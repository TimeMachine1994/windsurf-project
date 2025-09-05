#!/usr/bin/env node

/**
 * Development Database Reset Script
 * Drops all collections and recreates the development database
 */

import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const DATABASE_NAME = 'tributestream_dev';

class DevDatabaseReset {
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

  async dropAllCollections() {
    console.log('🗑️ Dropping all collections...');

    try {
      const collections = await this.db.listCollections().toArray();
      
      for (const collection of collections) {
        await this.db.collection(collection.name).drop();
        console.log(`✅ Dropped collection: ${collection.name}`);
      }

      if (collections.length === 0) {
        console.log('ℹ️ No collections found to drop');
      }
    } catch (error) {
      console.error('❌ Error dropping collections:', error.message);
    }
  }

  async cleanup() {
    if (this.client) {
      await this.client.close();
      console.log('🔌 Database connection closed');
    }
  }

  async run() {
    console.log('🚀 Resetting development database...\n');

    try {
      await this.connect();
      await this.dropAllCollections();

      console.log('\n🎉 Database reset complete!');
      console.log('💡 Run "npm run db:setup" to recreate the database structure');

    } catch (error) {
      console.error('💥 Reset failed:', error);
    } finally {
      await this.cleanup();
    }
  }
}

// Run the reset
const reset = new DevDatabaseReset();
reset.run().catch(error => {
  console.error('💥 Reset failed:', error);
  process.exit(1);
});
