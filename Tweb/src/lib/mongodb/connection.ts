/**
 * MongoDB Database Connection
 * Handles connection to MongoDB Atlas for TributeStream
 */

import { MongoClient, Db } from 'mongodb';
import { dev } from '$app/environment';

let client: MongoClient;
let db: Db;

const MONGODB_URI = dev 
  ? import.meta.env.VITE_MONGODB_URI 
  : process.env.MONGODB_URI;

const DATABASE_NAME = dev ? 'tributestream_dev' : 'tributestream';

export async function connectToDatabase(): Promise<Db> {
  if (db) return db;
  
  if (!MONGODB_URI) {
    throw new Error('MongoDB URI not found in environment variables');
  }
  
  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db(DATABASE_NAME);
    
    if (dev) {
      console.log('✅ Connected to MongoDB (Development)');
    }
    
    return db;
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    throw error;
  }
}

export async function closeDatabaseConnection(): Promise<void> {
  if (client) {
    await client.close();
    client = null as any;
    db = null as any;
    
    if (dev) {
      console.log('🔌 MongoDB connection closed');
    }
  }
}

// Health check function
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    const database = await connectToDatabase();
    await database.admin().ping();
    return true;
  } catch (error) {
    console.error('❌ Database health check failed:', error);
    return false;
  }
}

// Get database statistics
export async function getDatabaseStats() {
  try {
    const database = await connectToDatabase();
    const stats = await database.stats();
    return {
      collections: stats.collections,
      dataSize: stats.dataSize,
      indexSize: stats.indexSize,
      storageSize: stats.storageSize
    };
  } catch (error) {
    console.error('❌ Failed to get database stats:', error);
    return null;
  }
}
