#!/usr/bin/env node

/**
 * MongoDB Data Import Script
 * Imports Firebase exported data into MongoDB with proper transformations
 */

import { MongoClient, ObjectId } from 'mongodb';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DATABASE_NAME = 'tributestream';
const EXPORT_DIR = './exports';
const BATCH_SIZE = 100;

class MongoDBImporter {
  constructor() {
    this.client = null;
    this.db = null;
    this.importStats = {
      totalDocuments: 0,
      totalCollections: 0,
      errors: [],
      mappings: {}
    };
  }

  async initialize() {
    try {
      this.client = new MongoClient(MONGODB_URI);
      await this.client.connect();
      this.db = this.client.db(DATABASE_NAME);
      console.log('✅ Connected to MongoDB successfully');
    } catch (error) {
      console.error('❌ Failed to connect to MongoDB:', error.message);
      process.exit(1);
    }
  }

  async createIndexes() {
    console.log('🔍 Creating MongoDB indexes...');

    const indexes = {
      users: [
        { auth0Id: 1 },
        { email: 1 },
        { role: 1, approved: 1 },
        { createdAt: -1 }
      ],
      memorials: [
        { customUrl: 1 },
        { creatorId: 1 },
        { isPublic: 1 },
        { createdAt: -1 }
      ],
      photos: [
        { memorialId: 1, order: 1 },
        { memorialId: 1, createdAt: -1 },
        { uploadedBy: 1 },
        { s3Key: 1 }
      ],
      livestreamConfigs: [
        { memorialId: 1 },
        { creatorId: 1 },
        { paymentStatus: 1 },
        { createdAt: -1 }
      ]
    };

    for (const [collection, indexSpecs] of Object.entries(indexes)) {
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

  async loadExportedData(fileName) {
    try {
      const filePath = path.join(EXPORT_DIR, fileName);
      const data = await fs.readFile(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`❌ Error loading ${fileName}:`, error.message);
      return [];
    }
  }

  convertFirebaseTimestamp(timestampObj) {
    if (!timestampObj || !timestampObj._firebaseTimestamp) {
      return timestampObj;
    }
    
    return new Date(timestampObj._isoString);
  }

  transformDocument(doc, transformRules = {}) {
    const transformed = { ...doc };
    
    // Remove Firebase-specific fields
    delete transformed.id;
    delete transformed.path;
    
    // Convert timestamps
    for (const [key, value] of Object.entries(transformed)) {
      if (value && typeof value === 'object' && value._firebaseTimestamp) {
        transformed[key] = this.convertFirebaseTimestamp(value);
      }
    }
    
    // Apply specific transformation rules
    for (const [field, rule] of Object.entries(transformRules)) {
      if (rule.type === 'objectId' && transformed[field]) {
        transformed[field] = new ObjectId(transformed[field]);
      } else if (rule.type === 'reference' && transformed[field]) {
        // Handle Firebase document references
        const refId = this.importStats.mappings[rule.collection]?.[transformed[field]];
        if (refId) {
          transformed[field] = refId;
        }
      }
    }
    
    return transformed;
  }

  async importUsers() {
    console.log('👥 Importing users...');
    
    const users = await this.loadExportedData('users.json');
    const authUsers = await this.loadExportedData('auth_users.json');
    
    // Create mapping between Firebase UID and Auth0 ID
    const uidToAuth0 = {};
    authUsers.forEach(authUser => {
      uidToAuth0[authUser.uid] = authUser.uid; // Will be replaced with actual Auth0 IDs
    });
    
    const transformedUsers = [];
    const uidMapping = {};
    
    for (const user of users) {
      const mongoId = new ObjectId();
      const transformed = this.transformDocument(user);
      
      // Add MongoDB-specific fields
      transformed._id = mongoId;
      transformed.auth0Id = uidToAuth0[user.id] || user.id; // Temporary - update with real Auth0 IDs
      
      transformedUsers.push(transformed);
      uidMapping[user.id] = mongoId;
    }
    
    // Store mapping for reference resolution
    this.importStats.mappings.users = uidMapping;
    
    if (transformedUsers.length > 0) {
      await this.db.collection('users').insertMany(transformedUsers);
      console.log(`✅ Imported ${transformedUsers.length} users`);
      this.importStats.totalDocuments += transformedUsers.length;
    }
    
    return uidMapping;
  }

  async importMemorials(userMapping) {
    console.log('🕯️ Importing memorials...');
    
    const memorials = await this.loadExportedData('memorials.json');
    const transformedMemorials = [];
    const memorialMapping = {};
    
    for (const memorial of memorials) {
      const mongoId = new ObjectId();
      const transformed = this.transformDocument(memorial);
      
      // Add MongoDB-specific fields
      transformed._id = mongoId;
      
      // Map creator UID to MongoDB ObjectId
      if (transformed.creatorUid && userMapping[transformed.creatorUid]) {
        transformed.creatorId = userMapping[transformed.creatorUid];
        delete transformed.creatorUid;
      }
      
      transformedMemorials.push(transformed);
      memorialMapping[memorial.id] = mongoId;
    }
    
    this.importStats.mappings.memorials = memorialMapping;
    
    if (transformedMemorials.length > 0) {
      await this.db.collection('memorials').insertMany(transformedMemorials);
      console.log(`✅ Imported ${transformedMemorials.length} memorials`);
      this.importStats.totalDocuments += transformedMemorials.length;
    }
    
    return memorialMapping;
  }

  async importPhotos(userMapping, memorialMapping) {
    console.log('📸 Importing photos...');
    
    // Find all slideshow files
    const files = await fs.readdir(EXPORT_DIR);
    const slideshowFiles = files.filter(file => 
      file.includes('slideshow') && file.endsWith('.json')
    );
    
    let totalPhotos = 0;
    
    for (const file of slideshowFiles) {
      const photos = await this.loadExportedData(file);
      const transformedPhotos = [];
      
      // Extract memorial ID from filename
      const memorialFirebaseId = file.split('_')[1]; // Assumes format: memorials_MEMORIAL-ID_slideshow.json
      const memorialMongoId = memorialMapping[memorialFirebaseId];
      
      if (!memorialMongoId) {
        console.warn(`⚠️ Memorial not found for photos in ${file}`);
        continue;
      }
      
      for (const photo of photos) {
        const mongoId = new ObjectId();
        const transformed = this.transformDocument(photo);
        
        // Add MongoDB-specific fields
        transformed._id = mongoId;
        transformed.memorialId = memorialMongoId;
        
        // Map uploader UID to MongoDB ObjectId
        if (transformed.uploadedBy && userMapping[transformed.uploadedBy]) {
          transformed.uploadedBy = userMapping[transformed.uploadedBy];
        }
        
        // Transform Firebase Storage URL to S3 format (placeholder)
        if (transformed.downloadUrl) {
          const fileName = transformed.fileName || `photo_${mongoId}`;
          transformed.s3Key = `memorials/${memorialMongoId}/${fileName}`;
          transformed.s3Url = `https://tributestream-photos.s3.amazonaws.com/${transformed.s3Key}`;
          transformed.s3Bucket = 'tributestream-photos';
          
          // Keep original Firebase URL for migration reference
          transformed.originalFirebaseUrl = transformed.downloadUrl;
          delete transformed.downloadUrl;
        }
        
        transformedPhotos.push(transformed);
      }
      
      if (transformedPhotos.length > 0) {
        await this.db.collection('photos').insertMany(transformedPhotos);
        totalPhotos += transformedPhotos.length;
      }
    }
    
    console.log(`✅ Imported ${totalPhotos} photos`);
    this.importStats.totalDocuments += totalPhotos;
  }

  async importLivestreamConfigs(userMapping, memorialMapping) {
    console.log('📺 Importing livestream configs...');
    
    const configs = await this.loadExportedData('livestreamConfigs.json');
    const transformedConfigs = [];
    
    for (const config of configs) {
      const mongoId = new ObjectId();
      const transformed = this.transformDocument(config);
      
      // Add MongoDB-specific fields
      transformed._id = mongoId;
      
      // Map memorial ID
      if (transformed.memorialId && memorialMapping[transformed.memorialId]) {
        transformed.memorialId = memorialMapping[transformed.memorialId];
      }
      
      // Map creator ID (if exists)
      if (transformed.creatorUid && userMapping[transformed.creatorUid]) {
        transformed.creatorId = userMapping[transformed.creatorUid];
        delete transformed.creatorUid;
      }
      
      transformedConfigs.push(transformed);
    }
    
    if (transformedConfigs.length > 0) {
      await this.db.collection('livestreamConfigs').insertMany(transformedConfigs);
      console.log(`✅ Imported ${transformedConfigs.length} livestream configs`);
      this.importStats.totalDocuments += transformedConfigs.length;
    }
  }

  async importFamilyMembers(userMapping, memorialMapping) {
    console.log('👨‍👩‍👧‍👦 Importing family members...');
    
    const files = await fs.readdir(EXPORT_DIR);
    const familyFiles = files.filter(file => 
      file.includes('familyMembers') && file.endsWith('.json')
    );
    
    let totalFamilyMembers = 0;
    
    for (const file of familyFiles) {
      const familyMembers = await this.loadExportedData(file);
      const transformedMembers = [];
      
      // Extract memorial ID from filename
      const memorialFirebaseId = file.split('_')[1];
      const memorialMongoId = memorialMapping[memorialFirebaseId];
      
      if (!memorialMongoId) {
        console.warn(`⚠️ Memorial not found for family members in ${file}`);
        continue;
      }
      
      for (const member of familyMembers) {
        const mongoId = new ObjectId();
        const transformed = this.transformDocument(member);
        
        transformed._id = mongoId;
        transformed.memorialId = memorialMongoId;
        
        // Map user IDs
        if (transformed.userId && userMapping[transformed.userId]) {
          transformed.userId = userMapping[transformed.userId];
        }
        if (transformed.invitedBy && userMapping[transformed.invitedBy]) {
          transformed.invitedBy = userMapping[transformed.invitedBy];
        }
        
        // Set default permissions if not present
        if (!transformed.permissions) {
          transformed.permissions = {
            canUploadPhotos: true,
            canEditMemorial: false,
            canInviteOthers: false,
            canModerateComments: false
          };
        }
        
        transformedMembers.push(transformed);
      }
      
      if (transformedMembers.length > 0) {
        await this.db.collection('familyMembers').insertMany(transformedMembers);
        totalFamilyMembers += transformedMembers.length;
      }
    }
    
    console.log(`✅ Imported ${totalFamilyMembers} family members`);
    this.importStats.totalDocuments += totalFamilyMembers;
  }

  async generateImportReport() {
    const report = {
      importDate: new Date().toISOString(),
      statistics: this.importStats,
      nextSteps: [
        'Update Auth0 user IDs in users collection',
        'Migrate photos from Firebase Storage to S3',
        'Update application configuration',
        'Test authentication flow',
        'Verify data integrity'
      ],
      sqlQueries: {
        updateAuth0Ids: `
          // Update users with real Auth0 IDs
          db.users.updateMany(
            {},
            { $set: { auth0Id: "auth0|" + "$auth0Id" } }
          );
        `,
        verifyDataIntegrity: `
          // Check for orphaned references
          db.photos.find({ memorialId: { $exists: false } });
          db.familyMembers.find({ userId: { $exists: false } });
        `
      }
    };

    await fs.writeFile(
      './migration_import_report.json',
      JSON.stringify(report, null, 2)
    );

    console.log('\n📊 Import Report Generated');
    console.log(`Total Collections: ${this.importStats.totalCollections}`);
    console.log(`Total Documents: ${this.importStats.totalDocuments}`);
    console.log(`Errors: ${this.importStats.errors.length}`);
  }

  async cleanup() {
    if (this.client) {
      await this.client.close();
      console.log('🔌 MongoDB connection closed');
    }
  }

  async run() {
    console.log('🚀 Starting MongoDB data import...\n');

    try {
      await this.initialize();
      await this.createIndexes();

      // Import in dependency order
      const userMapping = await this.importUsers();
      const memorialMapping = await this.importMemorials(userMapping);
      await this.importPhotos(userMapping, memorialMapping);
      await this.importLivestreamConfigs(userMapping, memorialMapping);
      await this.importFamilyMembers(userMapping, memorialMapping);

      await this.generateImportReport();

      console.log('\n🎉 Import completed successfully!');
      console.log('📋 Next steps:');
      console.log('  1. Update Auth0 user IDs');
      console.log('  2. Migrate photos to S3');
      console.log('  3. Update application configuration');
      console.log('  4. Test the migration');

    } catch (error) {
      console.error('💥 Import failed:', error);
      this.importStats.errors.push({
        stage: 'general',
        error: error.message
      });
    } finally {
      await this.cleanup();
    }
  }
}

// Run the import
const importer = new MongoDBImporter();
importer.run().catch(error => {
  console.error('💥 Import failed:', error);
  process.exit(1);
});
