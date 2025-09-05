#!/usr/bin/env node

/**
 * S3 Photo Migration Script
 * Migrates photos from Firebase Storage to AWS S3
 */

import AWS from 'aws-sdk';
import fetch from 'node-fetch';
import fs from 'fs/promises';
import path from 'path';
import { MongoClient, ObjectId } from 'mongodb';

// Configuration
const AWS_CONFIG = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
};

const S3_BUCKET = process.env.S3_BUCKET_NAME || 'tributestream-photos';
const MONGODB_URI = process.env.MONGODB_URI;
const CONCURRENT_UPLOADS = 5;
const RETRY_ATTEMPTS = 3;

class S3PhotoMigrator {
  constructor() {
    this.s3 = new AWS.S3(AWS_CONFIG);
    this.mongoClient = null;
    this.db = null;
    this.migrationStats = {
      totalPhotos: 0,
      successfulMigrations: 0,
      failedMigrations: 0,
      skippedPhotos: 0,
      errors: []
    };
  }

  async initialize() {
    try {
      // Test S3 connection
      await this.s3.headBucket({ Bucket: S3_BUCKET }).promise();
      console.log('✅ S3 connection verified');

      // Connect to MongoDB
      this.mongoClient = new MongoClient(MONGODB_URI);
      await this.mongoClient.connect();
      this.db = this.mongoClient.db('tributestream');
      console.log('✅ MongoDB connection established');

    } catch (error) {
      console.error('❌ Initialization failed:', error.message);
      process.exit(1);
    }
  }

  async getPhotosToMigrate() {
    try {
      const photos = await this.db.collection('photos')
        .find({ 
          originalFirebaseUrl: { $exists: true },
          migrationStatus: { $ne: 'completed' }
        })
        .toArray();

      console.log(`📸 Found ${photos.length} photos to migrate`);
      return photos;
    } catch (error) {
      console.error('❌ Error fetching photos:', error.message);
      return [];
    }
  }

  async downloadFromFirebase(firebaseUrl) {
    try {
      const response = await fetch(firebaseUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const buffer = await response.buffer();
      const contentType = response.headers.get('content-type') || 'image/jpeg';
      
      return { buffer, contentType };
    } catch (error) {
      throw new Error(`Failed to download from Firebase: ${error.message}`);
    }
  }

  async uploadToS3(buffer, s3Key, contentType, metadata = {}) {
    const uploadParams = {
      Bucket: S3_BUCKET,
      Key: s3Key,
      Body: buffer,
      ContentType: contentType,
      Metadata: {
        'migrated-from': 'firebase-storage',
        'migration-date': new Date().toISOString(),
        ...metadata
      }
    };

    try {
      const result = await this.s3.upload(uploadParams).promise();
      return result.Location;
    } catch (error) {
      throw new Error(`S3 upload failed: ${error.message}`);
    }
  }

  async updatePhotoRecord(photoId, s3Url, s3Key) {
    try {
      await this.db.collection('photos').updateOne(
        { _id: photoId },
        {
          $set: {
            s3Url: s3Url,
            s3Key: s3Key,
            s3Bucket: S3_BUCKET,
            migrationStatus: 'completed',
            migratedAt: new Date()
          }
        }
      );
    } catch (error) {
      throw new Error(`Failed to update photo record: ${error.message}`);
    }
  }

  async migratePhoto(photo, retryCount = 0) {
    try {
      console.log(`📤 Migrating photo: ${photo.originalName} (${photo._id})`);

      // Download from Firebase
      const { buffer, contentType } = await this.downloadFromFirebase(photo.originalFirebaseUrl);

      // Generate S3 key
      const fileExtension = path.extname(photo.originalName) || '.jpg';
      const s3Key = `memorials/${photo.memorialId}/${photo._id}${fileExtension}`;

      // Upload to S3
      const s3Url = await this.uploadToS3(buffer, s3Key, contentType, {
        'original-name': photo.originalName,
        'memorial-id': photo.memorialId.toString(),
        'uploaded-by': photo.uploadedBy?.toString() || 'unknown'
      });

      // Update MongoDB record
      await this.updatePhotoRecord(photo._id, s3Url, s3Key);

      console.log(`✅ Successfully migrated: ${photo.originalName}`);
      this.migrationStats.successfulMigrations++;

      return { success: true, s3Url, s3Key };

    } catch (error) {
      console.error(`❌ Migration failed for ${photo.originalName}: ${error.message}`);

      if (retryCount < RETRY_ATTEMPTS) {
        console.log(`🔄 Retrying... (${retryCount + 1}/${RETRY_ATTEMPTS})`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
        return this.migratePhoto(photo, retryCount + 1);
      }

      // Mark as failed after all retries
      await this.markPhotoAsFailed(photo._id, error.message);
      this.migrationStats.failedMigrations++;
      this.migrationStats.errors.push({
        photoId: photo._id,
        originalName: photo.originalName,
        error: error.message
      });

      return { success: false, error: error.message };
    }
  }

  async markPhotoAsFailed(photoId, errorMessage) {
    try {
      await this.db.collection('photos').updateOne(
        { _id: photoId },
        {
          $set: {
            migrationStatus: 'failed',
            migrationError: errorMessage,
            migrationAttemptedAt: new Date()
          }
        }
      );
    } catch (error) {
      console.error('❌ Failed to mark photo as failed:', error.message);
    }
  }

  async migratePhotosInBatches(photos) {
    const batches = [];
    for (let i = 0; i < photos.length; i += CONCURRENT_UPLOADS) {
      batches.push(photos.slice(i, i + CONCURRENT_UPLOADS));
    }

    console.log(`🔄 Processing ${batches.length} batches of ${CONCURRENT_UPLOADS} photos each`);

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      console.log(`\n📦 Processing batch ${i + 1}/${batches.length}`);

      const promises = batch.map(photo => this.migratePhoto(photo));
      await Promise.all(promises);

      // Progress update
      const completed = this.migrationStats.successfulMigrations + this.migrationStats.failedMigrations;
      const percentage = ((completed / this.migrationStats.totalPhotos) * 100).toFixed(1);
      console.log(`📊 Progress: ${completed}/${this.migrationStats.totalPhotos} (${percentage}%)`);
    }
  }

  async validateMigration() {
    console.log('\n🔍 Validating migration...');

    const validationResults = {
      totalPhotos: 0,
      migratedPhotos: 0,
      failedPhotos: 0,
      missingS3Files: 0
    };

    const photos = await this.db.collection('photos').find({}).toArray();
    validationResults.totalPhotos = photos.length;

    for (const photo of photos) {
      if (photo.migrationStatus === 'completed') {
        validationResults.migratedPhotos++;
        
        // Check if S3 file exists
        try {
          await this.s3.headObject({
            Bucket: S3_BUCKET,
            Key: photo.s3Key
          }).promise();
        } catch (error) {
          if (error.code === 'NotFound') {
            validationResults.missingS3Files++;
            console.warn(`⚠️ S3 file missing: ${photo.s3Key}`);
          }
        }
      } else if (photo.migrationStatus === 'failed') {
        validationResults.failedPhotos++;
      }
    }

    console.log('\n📊 Validation Results:');
    console.log(`Total Photos: ${validationResults.totalPhotos}`);
    console.log(`Successfully Migrated: ${validationResults.migratedPhotos}`);
    console.log(`Failed Migrations: ${validationResults.failedPhotos}`);
    console.log(`Missing S3 Files: ${validationResults.missingS3Files}`);

    return validationResults;
  }

  async generateMigrationReport() {
    const report = {
      migrationDate: new Date().toISOString(),
      statistics: this.migrationStats,
      s3Bucket: S3_BUCKET,
      awsRegion: AWS_CONFIG.region,
      validation: await this.validateMigration(),
      nextSteps: [
        'Update application configuration to use S3 URLs',
        'Test photo display functionality',
        'Remove Firebase Storage references',
        'Update photo upload logic to use S3',
        'Consider implementing CDN for better performance'
      ]
    };

    await fs.writeFile(
      './s3_migration_report.json',
      JSON.stringify(report, null, 2)
    );

    console.log('\n📋 Migration report saved to s3_migration_report.json');
    return report;
  }

  async cleanup() {
    if (this.mongoClient) {
      await this.mongoClient.close();
      console.log('🔌 MongoDB connection closed');
    }
  }

  async run() {
    console.log('🚀 Starting S3 photo migration...\n');

    try {
      await this.initialize();

      const photos = await this.getPhotosToMigrate();
      this.migrationStats.totalPhotos = photos.length;

      if (photos.length === 0) {
        console.log('✅ No photos to migrate');
        return;
      }

      await this.migratePhotosInBatches(photos);
      await this.generateMigrationReport();

      console.log('\n🎉 Migration completed!');
      console.log(`✅ Successfully migrated: ${this.migrationStats.successfulMigrations} photos`);
      console.log(`❌ Failed migrations: ${this.migrationStats.failedMigrations} photos`);

      if (this.migrationStats.failedMigrations > 0) {
        console.log('\n❌ Failed photos:');
        this.migrationStats.errors.forEach(error => {
          console.log(`  - ${error.originalName}: ${error.error}`);
        });
      }

    } catch (error) {
      console.error('💥 Migration failed:', error);
    } finally {
      await this.cleanup();
    }
  }
}

// Run the migration
const migrator = new S3PhotoMigrator();
migrator.run().catch(error => {
  console.error('💥 Migration failed:', error);
  process.exit(1);
});
