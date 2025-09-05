#!/usr/bin/env node

/**
 * Firebase Data Export Script
 * Exports all collections from Firebase Firestore to JSON files
 */

import admin from 'firebase-admin';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const SERVICE_ACCOUNT_PATH = './firebase-service-account.json';
const EXPORT_DIR = './exports';
const BATCH_SIZE = 500;

// Collections to export
const COLLECTIONS = [
  'users',
  'memorials',
  'livestreamConfigs',
  'invitations'
];

// Subcollections to export
const SUBCOLLECTIONS = {
  memorials: ['slideshow', 'familyMembers', 'followers']
};

class FirebaseExporter {
  constructor() {
    this.db = null;
    this.exportStats = {
      totalDocuments: 0,
      totalCollections: 0,
      errors: []
    };
  }

  async initialize() {
    try {
      // Initialize Firebase Admin
      const serviceAccount = JSON.parse(
        await fs.readFile(SERVICE_ACCOUNT_PATH, 'utf8')
      );

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });

      this.db = admin.firestore();
      console.log('✅ Firebase Admin initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Firebase Admin:', error.message);
      process.exit(1);
    }
  }

  async createExportDirectory() {
    try {
      await fs.mkdir(EXPORT_DIR, { recursive: true });
      console.log(`📁 Export directory created: ${EXPORT_DIR}`);
    } catch (error) {
      console.error('❌ Failed to create export directory:', error.message);
      process.exit(1);
    }
  }

  async exportCollection(collectionName, parentPath = '') {
    try {
      const fullPath = parentPath ? `${parentPath}/${collectionName}` : collectionName;
      console.log(`📦 Exporting collection: ${fullPath}`);

      const collectionRef = parentPath 
        ? this.db.doc(parentPath).collection(collectionName)
        : this.db.collection(collectionName);

      const snapshot = await collectionRef.get();
      const documents = [];

      snapshot.forEach(doc => {
        const data = doc.data();
        
        // Convert Firestore timestamps to ISO strings
        const convertedData = this.convertTimestamps(data);
        
        documents.push({
          id: doc.id,
          path: doc.ref.path,
          ...convertedData
        });
      });

      // Save to file
      const fileName = parentPath 
        ? `${parentPath.replace(/\//g, '_')}_${collectionName}.json`
        : `${collectionName}.json`;
      
      const filePath = path.join(EXPORT_DIR, fileName);
      await fs.writeFile(filePath, JSON.stringify(documents, null, 2));

      console.log(`✅ Exported ${documents.length} documents from ${fullPath} to ${fileName}`);
      
      this.exportStats.totalDocuments += documents.length;
      this.exportStats.totalCollections++;

      return documents;
    } catch (error) {
      console.error(`❌ Error exporting collection ${collectionName}:`, error.message);
      this.exportStats.errors.push({
        collection: collectionName,
        error: error.message
      });
      return [];
    }
  }

  async exportSubcollections(parentCollection, parentDocuments) {
    const subcollections = SUBCOLLECTIONS[parentCollection];
    if (!subcollections) return;

    console.log(`🔍 Exporting subcollections for ${parentCollection}`);

    for (const subcollection of subcollections) {
      for (const parentDoc of parentDocuments) {
        const parentPath = `${parentCollection}/${parentDoc.id}`;
        await this.exportCollection(subcollection, parentPath);
      }
    }
  }

  convertTimestamps(obj) {
    if (!obj || typeof obj !== 'object') return obj;

    const converted = Array.isArray(obj) ? [] : {};

    for (const [key, value] of Object.entries(obj)) {
      if (value && typeof value === 'object') {
        // Check if it's a Firestore Timestamp
        if (value.constructor.name === 'Timestamp' || 
            (value._seconds !== undefined && value._nanoseconds !== undefined)) {
          converted[key] = {
            _firebaseTimestamp: true,
            _seconds: value._seconds || value.seconds,
            _nanoseconds: value._nanoseconds || value.nanoseconds,
            _isoString: new Date(
              (value._seconds || value.seconds) * 1000 + 
              (value._nanoseconds || value.nanoseconds) / 1000000
            ).toISOString()
          };
        } else {
          // Recursively convert nested objects
          converted[key] = this.convertTimestamps(value);
        }
      } else {
        converted[key] = value;
      }
    }

    return converted;
  }

  async exportFirebaseStorage() {
    try {
      console.log('📸 Exporting Firebase Storage file list...');
      
      const bucket = admin.storage().bucket();
      const [files] = await bucket.getFiles();
      
      const fileList = files.map(file => ({
        name: file.name,
        bucket: file.bucket.name,
        size: file.metadata.size,
        contentType: file.metadata.contentType,
        timeCreated: file.metadata.timeCreated,
        updated: file.metadata.updated,
        downloadUrl: `gs://${file.bucket.name}/${file.name}`
      }));

      await fs.writeFile(
        path.join(EXPORT_DIR, 'storage_files.json'),
        JSON.stringify(fileList, null, 2)
      );

      console.log(`✅ Exported ${fileList.length} storage files metadata`);
    } catch (error) {
      console.error('❌ Error exporting storage files:', error.message);
      this.exportStats.errors.push({
        collection: 'storage',
        error: error.message
      });
    }
  }

  async exportFirebaseAuth() {
    try {
      console.log('👥 Exporting Firebase Auth users...');
      
      const listUsersResult = await admin.auth().listUsers();
      const users = listUsersResult.users.map(user => ({
        uid: user.uid,
        email: user.email,
        emailVerified: user.emailVerified,
        displayName: user.displayName,
        photoURL: user.photoURL,
        disabled: user.disabled,
        metadata: {
          creationTime: user.metadata.creationTime,
          lastSignInTime: user.metadata.lastSignInTime,
          lastRefreshTime: user.metadata.lastRefreshTime
        },
        customClaims: user.customClaims,
        providerData: user.providerData
      }));

      await fs.writeFile(
        path.join(EXPORT_DIR, 'auth_users.json'),
        JSON.stringify(users, null, 2)
      );

      console.log(`✅ Exported ${users.length} auth users`);
    } catch (error) {
      console.error('❌ Error exporting auth users:', error.message);
      this.exportStats.errors.push({
        collection: 'auth',
        error: error.message
      });
    }
  }

  async generateMigrationReport() {
    const report = {
      exportDate: new Date().toISOString(),
      statistics: this.exportStats,
      collections: COLLECTIONS,
      subcollections: SUBCOLLECTIONS,
      recommendations: [
        'Review all exported data before migration',
        'Verify timestamp conversions are correct',
        'Check file paths for storage migration',
        'Validate user email addresses for Auth0 migration',
        'Test with a subset of data first'
      ]
    };

    await fs.writeFile(
      path.join(EXPORT_DIR, 'migration_report.json'),
      JSON.stringify(report, null, 2)
    );

    console.log('\n📊 Migration Report Generated');
    console.log(`Total Collections: ${this.exportStats.totalCollections}`);
    console.log(`Total Documents: ${this.exportStats.totalDocuments}`);
    console.log(`Errors: ${this.exportStats.errors.length}`);
    
    if (this.exportStats.errors.length > 0) {
      console.log('\n❌ Errors encountered:');
      this.exportStats.errors.forEach(error => {
        console.log(`  - ${error.collection}: ${error.error}`);
      });
    }
  }

  async run() {
    console.log('🚀 Starting Firebase data export...\n');

    await this.initialize();
    await this.createExportDirectory();

    // Export main collections
    for (const collection of COLLECTIONS) {
      const documents = await this.exportCollection(collection);
      
      // Export subcollections if they exist
      await this.exportSubcollections(collection, documents);
    }

    // Export Firebase Storage metadata
    await this.exportFirebaseStorage();

    // Export Firebase Auth users
    await this.exportFirebaseAuth();

    // Generate migration report
    await this.generateMigrationReport();

    console.log('\n🎉 Export completed successfully!');
    console.log(`📁 All data exported to: ${path.resolve(EXPORT_DIR)}`);
  }
}

// Run the export
const exporter = new FirebaseExporter();
exporter.run().catch(error => {
  console.error('💥 Export failed:', error);
  process.exit(1);
});
