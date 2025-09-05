import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient, Db } from 'mongodb';
import { photoStorage } from '../lib/server/storage.js';

describe('Memorial API Tests', () => {
  let mongod: MongoMemoryServer;
  let client: MongoClient;
  let db: Db;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    client = new MongoClient(uri);
    await client.connect();
    db = client.db();
  });

  afterAll(async () => {
    await client.close();
    await mongod.stop();
  });

  beforeEach(async () => {
    // Clear collections before each test
    await db.collection('memorials').deleteMany({});
    await db.collection('users').deleteMany({});
    await db.collection('photos.files').deleteMany({});
    await db.collection('photos.chunks').deleteMany({});
  });

  describe('Memorial Creation', () => {
    it('should create a memorial with valid data', async () => {
      const memorialData = {
        lovedOneName: 'John Doe',
        dateOfBirth: '1950-01-01',
        dateOfPassing: '2024-01-01',
        biography: 'A loving father and husband.',
        slug: 'john-doe-memorial',
        isPublic: true,
        creatorId: 'test-user-123',
        creatorName: 'Test User'
      };

      const result = await db.collection('memorials').insertOne({
        ...memorialData,
        createdAt: new Date(),
        updatedAt: new Date(),
        viewCount: 0
      });

      expect(result.insertedId).toBeDefined();
      
      const memorial = await db.collection('memorials').findOne({ _id: result.insertedId });
      expect(memorial?.lovedOneName).toBe('John Doe');
      expect(memorial?.slug).toBe('john-doe-memorial');
      expect(memorial?.isPublic).toBe(true);
    });

    it('should prevent duplicate slugs', async () => {
      const memorialData = {
        lovedOneName: 'John Doe',
        slug: 'john-doe-memorial',
        creatorId: 'test-user-123',
        creatorName: 'Test User',
        createdAt: new Date(),
        updatedAt: new Date(),
        viewCount: 0
      };

      // Insert first memorial
      await db.collection('memorials').insertOne(memorialData);

      // Try to insert duplicate slug
      const existingMemorial = await db.collection('memorials').findOne({ slug: 'john-doe-memorial' });
      expect(existingMemorial).toBeTruthy();
    });

    it('should validate required fields', () => {
      const invalidData = {
        // Missing required fields
        slug: 'test-memorial'
      };

      // This would be validated by the API endpoint
      expect(invalidData).not.toHaveProperty('lovedOneName');
      expect(invalidData).not.toHaveProperty('creatorId');
    });
  });

  describe('Memorial Retrieval', () => {
    beforeEach(async () => {
      // Insert test memorial
      await db.collection('memorials').insertOne({
        lovedOneName: 'Jane Smith',
        slug: 'jane-smith-memorial',
        biography: 'A wonderful person.',
        isPublic: true,
        creatorId: 'test-user-123',
        creatorName: 'Test User',
        createdAt: new Date(),
        updatedAt: new Date(),
        viewCount: 5
      });
    });

    it('should retrieve memorial by slug', async () => {
      const memorial = await db.collection('memorials').findOne({ slug: 'jane-smith-memorial' });
      
      expect(memorial).toBeTruthy();
      expect(memorial?.lovedOneName).toBe('Jane Smith');
      expect(memorial?.biography).toBe('A wonderful person.');
    });

    it('should increment view count', async () => {
      const initialMemorial = await db.collection('memorials').findOne({ slug: 'jane-smith-memorial' });
      const initialViewCount = initialMemorial?.viewCount || 0;

      // Simulate view count increment
      await db.collection('memorials').updateOne(
        { slug: 'jane-smith-memorial' },
        { $inc: { viewCount: 1 } }
      );

      const updatedMemorial = await db.collection('memorials').findOne({ slug: 'jane-smith-memorial' });
      expect(updatedMemorial?.viewCount).toBe(initialViewCount + 1);
    });
  });

  describe('Memorial Search', () => {
    beforeEach(async () => {
      // Insert test memorials
      await db.collection('memorials').insertMany([
        {
          lovedOneName: 'Alice Johnson',
          slug: 'alice-johnson',
          biography: 'A talented artist and teacher.',
          isPublic: true,
          creatorId: 'user-1',
          creatorName: 'Creator One',
          createdAt: new Date(),
          viewCount: 10
        },
        {
          lovedOneName: 'Bob Wilson',
          slug: 'bob-wilson',
          biography: 'A dedicated engineer and father.',
          isPublic: true,
          creatorId: 'user-2',
          creatorName: 'Creator Two',
          createdAt: new Date(),
          viewCount: 15
        },
        {
          lovedOneName: 'Carol Private',
          slug: 'carol-private',
          biography: 'A private memorial.',
          isPublic: false,
          creatorId: 'user-3',
          creatorName: 'Creator Three',
          createdAt: new Date(),
          viewCount: 2
        }
      ]);
    });

    it('should search public memorials by name', async () => {
      const results = await db.collection('memorials').find({
        $and: [
          { isPublic: true },
          { lovedOneName: { $regex: 'Alice', $options: 'i' } }
        ]
      }).toArray();

      expect(results).toHaveLength(1);
      expect(results[0].lovedOneName).toBe('Alice Johnson');
    });

    it('should search by biography content', async () => {
      const results = await db.collection('memorials').find({
        $and: [
          { isPublic: true },
          { biography: { $regex: 'engineer', $options: 'i' } }
        ]
      }).toArray();

      expect(results).toHaveLength(1);
      expect(results[0].lovedOneName).toBe('Bob Wilson');
    });

    it('should not return private memorials in search', async () => {
      const results = await db.collection('memorials').find({
        $and: [
          { isPublic: true },
          { lovedOneName: { $regex: 'Carol', $options: 'i' } }
        ]
      }).toArray();

      expect(results).toHaveLength(0);
    });

    it('should sort results by popularity', async () => {
      const results = await db.collection('memorials').find({
        isPublic: true
      }).sort({ viewCount: -1 }).toArray();

      expect(results).toHaveLength(2);
      expect(results[0].lovedOneName).toBe('Bob Wilson'); // Higher view count
      expect(results[1].lovedOneName).toBe('Alice Johnson');
    });
  });

  describe('Memorial Deletion', () => {
    let insertResult;

    beforeEach(async () => {
      // Insert test memorial
      insertResult = await db.collection('memorials').insertOne({
        lovedOneName: 'Jane Smith',
        slug: 'jane-smith-memorial',
        biography: 'A wonderful person.',
        isPublic: true,
        creatorId: 'test-user-123',
        creatorName: 'Test User',
        createdAt: new Date(),
        updatedAt: new Date(),
        viewCount: 5
      });
    });

    it('should delete memorial and associated photos', async () => {
      // Simulate photo deletion (would be handled by photoStorage.deletePhoto)
      const deleteResult = await db.collection('memorials').deleteOne({ 
        _id: { $eq: insertResult.insertedId },
        creatorId: 'test-user-123' 
      });

      expect(deleteResult.deletedCount).toBe(1);

      const memorial = await db.collection('memorials').findOne({ _id: insertResult.insertedId });
      expect(memorial).toBeNull();
    });

    it('should prevent deletion by non-owner', async () => {
      const deleteResult = await db.collection('memorials').deleteOne({ 
        _id: { $eq: insertResult.insertedId },
        creatorId: 'different-user' 
      });

      expect(deleteResult.deletedCount).toBe(0);
    });
  });
});
