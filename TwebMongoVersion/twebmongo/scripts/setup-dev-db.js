import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

async function setupDatabase() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db('tributestream_dev');
    
    console.log('🚀 Setting up development database...');
    
    // Create indexes for users collection
    await db.collection('users').createIndex({ auth0Id: 1 }, { unique: true });
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    console.log('✅ Users collection indexes created');
    
    // Create indexes for memorials collection
    await db.collection('memorials').createIndex({ customUrl: 1 }, { unique: true });
    await db.collection('memorials').createIndex({ creatorId: 1 });
    await db.collection('memorials').createIndex({ isPublic: 1 });
    console.log('✅ Memorials collection indexes created');
    
    // Create indexes for photos collection
    await db.collection('photos').createIndex({ memorialId: 1, order: 1 });
    await db.collection('photos').createIndex({ uploadedBy: 1 });
    await db.collection('photos').createIndex({ s3Key: 1 }, { unique: true });
    console.log('✅ Photos collection indexes created');
    
    console.log('🎉 Database setup complete!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

setupDatabase();
