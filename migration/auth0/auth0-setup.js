#!/usr/bin/env node

/**
 * Auth0 Setup and Configuration Script
 * Automates Auth0 tenant configuration for TributeStream migration
 */

import { ManagementClient } from 'auth0';
import fs from 'fs/promises';
import dotenv from 'dotenv';

dotenv.config();

// Auth0 Management API Configuration
const AUTH0_CONFIG = {
  domain: process.env.AUTH0_DOMAIN,
  clientId: process.env.AUTH0_M2M_CLIENT_ID,
  clientSecret: process.env.AUTH0_M2M_CLIENT_SECRET,
  scope: 'read:users write:users create:users update:users delete:users read:roles write:roles create:roles update:roles delete:roles read:user_metadata write:user_metadata'
};

class Auth0Setup {
  constructor() {
    this.management = new ManagementClient(AUTH0_CONFIG);
    this.setupResults = {
      roles: [],
      rules: [],
      applications: [],
      connections: [],
      errors: []
    };
  }

  async createRoles() {
    console.log('👥 Creating Auth0 roles...');

    const roles = [
      {
        name: 'Viewer',
        description: 'Basic viewer role for memorial visitors'
      },
      {
        name: 'Owner',
        description: 'Memorial owner with full management permissions'
      },
      {
        name: 'Admin',
        description: 'System administrator with global permissions'
      },
      {
        name: 'FuneralDirector',
        description: 'Funeral director with livestreaming capabilities'
      }
    ];

    for (const role of roles) {
      try {
        const createdRole = await this.management.createRole(role);
        console.log(`✅ Created role: ${role.name}`);
        this.setupResults.roles.push(createdRole);
      } catch (error) {
        if (error.statusCode === 409) {
          console.log(`⚠️ Role already exists: ${role.name}`);
        } else {
          console.error(`❌ Failed to create role ${role.name}:`, error.message);
          this.setupResults.errors.push({ type: 'role', name: role.name, error: error.message });
        }
      }
    }
  }

  async createCustomClaims() {
    console.log('🔧 Creating custom claims rule...');

    const ruleScript = `
function addCustomClaims(user, context, callback) {
  const namespace = 'https://tributestream.com/';
  const assignedRoles = (context.authorization || {}).roles;
  
  // Add roles to both ID and Access tokens
  context.idToken = context.idToken || {};
  context.accessToken = context.accessToken || {};
  
  context.idToken[namespace + 'roles'] = assignedRoles;
  context.accessToken[namespace + 'roles'] = assignedRoles;
  
  // Add user metadata
  context.idToken[namespace + 'user_metadata'] = user.user_metadata || {};
  context.accessToken[namespace + 'user_metadata'] = user.user_metadata || {};
  
  // Add app metadata (for internal flags)
  context.idToken[namespace + 'app_metadata'] = user.app_metadata || {};
  context.accessToken[namespace + 'app_metadata'] = user.app_metadata || {};
  
  callback(null, user, context);
}`;

    const rule = {
      name: 'Add Custom Claims',
      script: ruleScript,
      order: 1,
      enabled: true
    };

    try {
      const createdRule = await this.management.createRule(rule);
      console.log('✅ Created custom claims rule');
      this.setupResults.rules.push(createdRule);
    } catch (error) {
      console.error('❌ Failed to create custom claims rule:', error.message);
      this.setupResults.errors.push({ type: 'rule', name: rule.name, error: error.message });
    }
  }

  async createFuneralDirectorApprovalRule() {
    console.log('👨‍💼 Creating funeral director approval rule...');

    const ruleScript = `
function funeralDirectorApproval(user, context, callback) {
  const namespace = 'https://tributestream.com/';
  
  // Check if user has FuneralDirector role
  const roles = (context.authorization || {}).roles || [];
  const isFuneralDirector = roles.includes('FuneralDirector');
  
  if (isFuneralDirector) {
    // Check if funeral director is approved
    const appMetadata = user.app_metadata || {};
    const isApproved = appMetadata.funeral_director_approved === true;
    
    if (!isApproved) {
      // Deny access if not approved
      return callback(new UnauthorizedError('Your funeral director account is pending approval. Please contact support.'));
    }
    
    // Add approval status to tokens
    context.idToken = context.idToken || {};
    context.accessToken = context.accessToken || {};
    
    context.idToken[namespace + 'funeral_director_approved'] = true;
    context.accessToken[namespace + 'funeral_director_approved'] = true;
  }
  
  callback(null, user, context);
}`;

    const rule = {
      name: 'Funeral Director Approval Check',
      script: ruleScript,
      order: 2,
      enabled: true
    };

    try {
      const createdRule = await this.management.createRule(rule);
      console.log('✅ Created funeral director approval rule');
      this.setupResults.rules.push(createdRule);
    } catch (error) {
      console.error('❌ Failed to create funeral director approval rule:', error.message);
      this.setupResults.errors.push({ type: 'rule', name: rule.name, error: error.message });
    }
  }

  async configureApplication() {
    console.log('📱 Configuring Auth0 application...');

    const appConfig = {
      name: 'TributeStream SPA',
      app_type: 'spa',
      callbacks: [
        'http://localhost:5173/callback',
        'https://tributestream.com/callback',
        'https://app.tributestream.com/callback'
      ],
      allowed_logout_urls: [
        'http://localhost:5173',
        'https://tributestream.com',
        'https://app.tributestream.com'
      ],
      allowed_origins: [
        'http://localhost:5173',
        'https://tributestream.com',
        'https://app.tributestream.com'
      ],
      web_origins: [
        'http://localhost:5173',
        'https://tributestream.com',
        'https://app.tributestream.com'
      ],
      grant_types: [
        'authorization_code',
        'implicit',
        'refresh_token'
      ],
      jwt_configuration: {
        lifetime_in_seconds: 36000,
        secret_encoded: false,
        alg: 'RS256'
      },
      token_endpoint_auth_method: 'none'
    };

    try {
      // Check if application already exists
      const apps = await this.management.getClients();
      const existingApp = apps.find(app => app.name === appConfig.name);

      if (existingApp) {
        const updatedApp = await this.management.updateClient({ client_id: existingApp.client_id }, appConfig);
        console.log('✅ Updated existing application configuration');
        this.setupResults.applications.push(updatedApp);
      } else {
        const createdApp = await this.management.createClient(appConfig);
        console.log('✅ Created new application');
        this.setupResults.applications.push(createdApp);
      }
    } catch (error) {
      console.error('❌ Failed to configure application:', error.message);
      this.setupResults.errors.push({ type: 'application', name: appConfig.name, error: error.message });
    }
  }

  async setupPasswordPolicy() {
    console.log('🔐 Configuring password policy...');

    const connectionName = 'Username-Password-Authentication';
    
    const passwordPolicy = {
      options: {
        password_policy: 'good',
        password_complexity_options: {
          min_length: 8
        },
        password_no_personal_info: {
          enable: true
        },
        password_dictionary: {
          enable: true,
          dictionary: []
        },
        password_history: {
          enable: true,
          size: 5
        }
      }
    };

    try {
      const connections = await this.management.getConnections();
      const dbConnection = connections.find(conn => conn.name === connectionName);

      if (dbConnection) {
        await this.management.updateConnection({ id: dbConnection.id }, passwordPolicy);
        console.log('✅ Updated password policy');
      }
    } catch (error) {
      console.error('❌ Failed to update password policy:', error.message);
      this.setupResults.errors.push({ type: 'password_policy', error: error.message });
    }
  }

  async createUserMigrationScript() {
    console.log('👤 Creating user migration script...');

    const migrationScript = `
// User Migration Script for Firebase to Auth0
// This script handles the migration of users from Firebase to Auth0

function login(email, password, callback) {
  // This function is called when a user tries to login
  // and their user record is not found in Auth0
  
  const request = require('request');
  const bcrypt = require('bcrypt');
  
  // Call your Firebase verification endpoint
  const options = {
    url: 'https://your-migration-api.com/verify-user',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: email,
      password: password
    })
  };
  
  request(options, function(err, response, body) {
    if (err) return callback(err);
    
    const userData = JSON.parse(body);
    
    if (userData.success) {
      // User verified, create Auth0 profile
      const profile = {
        user_id: userData.uid,
        email: email,
        email_verified: userData.emailVerified || false,
        name: userData.displayName,
        user_metadata: {
          phone: userData.phone,
          firebase_uid: userData.uid
        },
        app_metadata: {
          role: userData.role,
          funeral_director_approved: userData.approved || false,
          migrated_from_firebase: true,
          migration_date: new Date().toISOString()
        }
      };
      
      callback(null, profile);
    } else {
      callback(new WrongUsernameOrPasswordError(email, 'Invalid credentials'));
    }
  });
}

function getByEmail(email, callback) {
  // This function is called to check if a user exists
  // Return null if user should be migrated
  callback(null, null);
}`;

    // Save migration script to file for manual upload
    await fs.writeFile('./auth0-migration-script.js', migrationScript);
    console.log('✅ Migration script saved to auth0-migration-script.js');
  }

  async generateEnvironmentConfig() {
    console.log('⚙️ Generating environment configuration...');

    const config = {
      // Auth0 Configuration
      AUTH0_DOMAIN: process.env.AUTH0_DOMAIN,
      AUTH0_CLIENT_ID: 'YOUR_SPA_CLIENT_ID', // Replace with actual client ID
      AUTH0_CLIENT_SECRET: 'YOUR_CLIENT_SECRET', // For server-side operations
      
      // JWT Configuration
      JWT_SECRET: 'your-jwt-secret-key',
      JWT_EXPIRATION: '24h',
      
      // API Configuration
      API_BASE_URL: process.env.NODE_ENV === 'production' 
        ? 'https://api.tributestream.com' 
        : 'http://localhost:5173',
      
      // MongoDB Configuration
      MONGODB_URI: process.env.MONGODB_URI,
      
      // AWS Configuration
      AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
      AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
      AWS_REGION: process.env.AWS_REGION,
      S3_BUCKET_NAME: process.env.S3_BUCKET_NAME
    };

    const envContent = Object.entries(config)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    await fs.writeFile('./.env.migration', envContent);
    console.log('✅ Environment configuration saved to .env.migration');
  }

  async generateSetupReport() {
    const report = {
      setupDate: new Date().toISOString(),
      auth0Domain: process.env.AUTH0_DOMAIN,
      results: this.setupResults,
      nextSteps: [
        'Update .env file with Auth0 credentials',
        'Upload user migration script to Auth0 dashboard',
        'Test authentication flow',
        'Configure social connections if needed',
        'Set up Auth0 monitoring and logging',
        'Configure MFA settings',
        'Set up custom email templates'
      ],
      manualSteps: [
        {
          step: 'Upload Migration Script',
          description: 'Go to Auth0 Dashboard > Connections > Database > Username-Password-Authentication > Custom Database and upload the migration script'
        },
        {
          step: 'Configure Social Connections',
          description: 'Set up Google, Facebook, or other social login providers in Auth0 Dashboard > Connections > Social'
        },
        {
          step: 'Customize Login Page',
          description: 'Customize the Universal Login page in Auth0 Dashboard > Universal Login'
        }
      ]
    };

    await fs.writeFile('./auth0_setup_report.json', JSON.stringify(report, null, 2));
    console.log('\n📊 Setup report saved to auth0_setup_report.json');
    return report;
  }

  async run() {
    console.log('🚀 Starting Auth0 setup...\n');

    try {
      await this.createRoles();
      await this.createCustomClaims();
      await this.createFuneralDirectorApprovalRule();
      await this.configureApplication();
      await this.setupPasswordPolicy();
      await this.createUserMigrationScript();
      await this.generateEnvironmentConfig();
      
      const report = await this.generateSetupReport();

      console.log('\n🎉 Auth0 setup completed!');
      console.log(`✅ Created ${this.setupResults.roles.length} roles`);
      console.log(`✅ Created ${this.setupResults.rules.length} rules`);
      console.log(`❌ Encountered ${this.setupResults.errors.length} errors`);

      if (this.setupResults.errors.length > 0) {
        console.log('\n❌ Errors encountered:');
        this.setupResults.errors.forEach(error => {
          console.log(`  - ${error.type}: ${error.error}`);
        });
      }

      console.log('\n📋 Next steps:');
      report.nextSteps.forEach(step => {
        console.log(`  - ${step}`);
      });

    } catch (error) {
      console.error('💥 Setup failed:', error);
    }
  }
}

// Run the setup
const setup = new Auth0Setup();
setup.run().catch(error => {
  console.error('💥 Setup failed:', error);
  process.exit(1);
});
