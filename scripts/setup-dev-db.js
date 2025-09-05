#!/usr/bin/env node

/**
 * Development Database Setup Script
 * Initializes MongoDB with indexes and basic data for development
 */

import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const DATABASE_NAME = 'tributestream_dev';

class DevDatabaseSetup {
  constructor() {
    this.client = null;
    this.db = null;
  }

  async connect() {
    try {
      this.client = new MongoClient(MONGODB_URI);
      await this.client.connect();
      this.db = this.client.db(DATABASE_NAME);
      console.log('✅ Connected to MongoDB');
    } catch (error) {
      console.error('❌ Failed to connect to MongoDB:', error.message);
      process.exit(1);
    }
  }

  async createIndexes() {
    console.log('🔍 Creating database indexes...');

    const indexes = [
      // Users collection
      {
        collection: 'users',
        indexes: [
          { auth0Id: 1 },
          { email: 1 },
          { role: 1, approved: 1 },
          { createdAt: -1 }
        ]
      },
      
      // Memorials collection
      {
        collection: 'memorials',
        indexes: [
          { customUrl: 1 },
          { creatorId: 1 },
          { isPublic: 1 },
          { createdAt: -1 },
          { lovedOneName: 'text' }
        ]
      },
      
      // Photos collection
      {
        collection: 'photos',
        indexes: [
          { memorialId: 1, order: 1 },
          { memorialId: 1, createdAt: -1 },
          { uploadedBy: 1 },
          { s3Key: 1 }
        ]
      },
      
      // Livestream configs collection
      {
        collection: 'livestreamConfigs',
        indexes: [
          { memorialId: 1 },
          { creatorId: 1 },
          { paymentStatus: 1 },
          { createdAt: -1 }
        ]
      },
      
      // Family members collection
      {
        collection: 'familyMembers',
        indexes: [
          { memorialId: 1, userId: 1 },
          { userId: 1 },
          { status: 1 }
        ]
      }
    ];

    for (const { collection, indexes: indexSpecs } of indexes) {
      try {
        for (const indexSpec of indexSpecs) {
          await this.db.collection(collection).createIndex(indexSpec);
        }
        console.log(`✅ Created indexes for ${collection}`);
      } catch (error) {
        console.error(`❌ Error creating indexes for ${collection}:`, error.message);
      }
    }
  }

  async createAdminUser() {
    console.log('👤 Creating development admin user...');

    const adminUser = {
      auth0Id: 'dev-admin-' + Date.now(),
      email: 'admin@tributestream.dev',
      displayName: 'Development Admin',
      role: 'Admin',
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    try {
      await this.db.collection('users').updateOne(
        { email: adminUser.email },
        { $setOnInsert: adminUser },
        { upsert: true }
      );
      console.log('✅ Admin user created/updated');
    } catch (error) {
      console.error('❌ Error creating admin user:', error.message);
    }
  }

  async createSampleData() {
    console.log('📝 Creating sample development data...');

    // Sample memorial owner
    const sampleOwner = {
      auth0Id: 'dev-owner-' + Date.now(),
      email: 'owner@tributestream.dev',
      displayName: 'Sample Memorial Owner',
      phone: '+1-555-0123',
      role: 'Owner',
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    try {
      const ownerResult = await this.db.collection('users').insertOne(sampleOwner);
      console.log('✅ Sample owner created');

      // Sample memorial
      const sampleMemorial = {
        customUrl: 'john-doe-memorial',
        lovedOneName: 'John Doe',
        creatorId: ownerResult.insertedId,
        creatorName: sampleOwner.displayName,
        creatorPhone: sampleOwner.phone,
        creatorEmail: sampleOwner.email,
        isPublic: true,
        dateOfBirth: new Date('1950-01-15'),
        dateOfPassing: new Date('2024-01-15'),
        biography: 'A loving father, husband, and friend who touched many lives.',
        location: 'Springfield, USA',
        allowComments: true,
        allowPhotos: true,
        moderateContent: false,
        viewCount: 0,
        photoCount: 0,
        followerCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await this.db.collection('memorials').insertOne(sampleMemorial);
      console.log('✅ Sample memorial created');

      // Sample funeral director
      const sampleFuneralDirector = {
        auth0Id: 'dev-fd-' + Date.now(),
        email: 'director@tributestream.dev',
        displayName: 'Sample Funeral Director',
        role: 'FuneralDirector',
        funeralHomeName: 'Peaceful Rest Funeral Home',
        funeralHomeAddress: '123 Main St, Springfield, USA',
        funeralHomeEmail: 'info@peacefulrest.com',
        funeralHomePhone: '+1-555-0199',
        personalPhone: '+1-555-0188',
        approved: true,
        approvedAt: new Date(),
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await this.db.collection('users').insertOne(sampleFuneralDirector);
      console.log('✅ Sample funeral director created');

    } catch (error) {
      console.error('❌ Error creating sample data:', error.message);
    }
  }

  async cleanup() {
    if (this.client) {
      await this.client.close();
      console.log('🔌 Database connection closed');
    }
  }

  async run() {
    console.log('🚀 Setting up development database...\n');

    try {
      await this.connect();
      await this.createIndexes();
      await this.createAdminUser();
      await this.createSampleData();

      console.log('\n🎉 Development database setup complete!');
      console.log('\n📋 Sample accounts created:');
      console.log('  Admin: admin@tributestream.dev');
      console.log('  Owner: owner@tributestream.dev');
      console.log('  Funeral Director: director@tributestream.dev');
      console.log('\n💡 Use these accounts for testing during development');

    } catch (error) {
      console.error('💥 Setup failed:', error);
    } finally {
      await this.cleanup();
    }
  }
}

// Run the setup
const setup = new DevDatabaseSetup();
setup.run().catch(error => {
  console.error('💥 Setup failed:', error);
  process.exit(1);
});
