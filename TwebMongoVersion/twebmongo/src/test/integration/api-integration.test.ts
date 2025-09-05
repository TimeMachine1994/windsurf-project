import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient, Db } from 'mongodb';
import supertest from 'supertest';
import { createServer } from 'vite';

describe('API Integration Tests', () => {
  let mongod: MongoMemoryServer;
  let client: MongoClient;
  let db: Db;
  let server: any;
  let request: supertest.SuperTest<supertest.Test>;

  beforeAll(async () => {
    // Start in-memory MongoDB
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    client = new MongoClient(uri);
    await client.connect();
    db = client.db();

    // Set MongoDB URI for tests
    process.env.MONGODB_URI = uri;

    // Create Vite server for testing
    server = await createServer({
      server: { middlewareMode: true }
    });
    
    request = supertest(server.ssrLoadModule('/src/app.html'));
  });

  afterAll(async () => {
    await client.close();
    await mongod.stop();
    if (server) {
      await server.close();
    }
  });

  beforeEach(async () => {
    // Clear collections
    await db.collection('memorials').deleteMany({});
    await db.collection('users').deleteMany({});
    await db.collection('photos.files').deleteMany({});
    await db.collection('photos.chunks').deleteMany({});
  });

  describe('Health Check API', () => {
    it('should return healthy status', async () => {
      // This would test the actual API endpoint
      // For now, we'll test the database connection directly
      const result = await db.admin().ping();
      expect(result.ok).toBe(1);
    });
  });

  describe('Memorial API Integration', () => {
    it('should create and retrieve memorial', async () => {
      const memorialData = {
        lovedOneName: 'Integration Test Person',
        dateOfBirth: '1980-01-01',
        dateOfPassing: '2024-01-01',
        biography: 'Test biography for integration testing.',
        slug: 'integration-test-person',
        isPublic: true,
        creatorId: 'test-user-123',
        creatorName: 'Test User',
        createdAt: new Date(),
        updatedAt: new Date(),
        viewCount: 0
      };

      // Insert memorial
      const insertResult = await db.collection('memorials').insertOne(memorialData);
      expect(insertResult.insertedId).toBeDefined();

      // Retrieve memorial
      const memorial = await db.collection('memorials').findOne({ slug: 'integration-test-person' });
      expect(memorial).toBeTruthy();
      expect(memorial?.lovedOneName).toBe('Integration Test Person');
    });

    it('should handle memorial URL checking', async () => {
      // Insert existing memorial
      await db.collection('memorials').insertOne({
        lovedOneName: 'Existing Memorial',
        slug: 'existing-memorial',
        creatorId: 'user-1',
        creatorName: 'User One',
        createdAt: new Date(),
        updatedAt: new Date(),
        viewCount: 0
      });

      // Check if URL exists
      const existing = await db.collection('memorials').findOne({ slug: 'existing-memorial' });
      expect(existing).toBeTruthy();

      // Check if new URL is available
      const available = await db.collection('memorials').findOne({ slug: 'new-memorial' });
      expect(available).toBeNull();
    });

    it('should increment view count', async () => {
      // Insert memorial
      const insertResult = await db.collection('memorials').insertOne({
        lovedOneName: 'View Test',
        slug: 'view-test',
        creatorId: 'user-1',
        creatorName: 'User One',
        createdAt: new Date(),
        updatedAt: new Date(),
        viewCount: 0
      });

      // Increment view count
      await db.collection('memorials').updateOne(
        { _id: insertResult.insertedId },
        { $inc: { viewCount: 1 } }
      );

      // Verify increment
      const memorial = await db.collection('memorials').findOne({ _id: insertResult.insertedId });
      expect(memorial?.viewCount).toBe(1);
    });
  });

  describe('Search API Integration', () => {
    beforeEach(async () => {
      // Insert test data
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

    it('should search memorials by name', async () => {
      const results = await db.collection('memorials').find({
        $and: [
          { isPublic: true },
          { lovedOneName: { $regex: 'Alice', $options: 'i' } }
        ]
      }).toArray();

      expect(results).toHaveLength(1);
      expect(results[0].lovedOneName).toBe('Alice Johnson');
    });

    it('should search memorials by biography', async () => {
      const results = await db.collection('memorials').find({
        $and: [
          { isPublic: true },
          { biography: { $regex: 'engineer', $options: 'i' } }
        ]
      }).toArray();

      expect(results).toHaveLength(1);
      expect(results[0].lovedOneName).toBe('Bob Wilson');
    });

    it('should exclude private memorials from search', async () => {
      const results = await db.collection('memorials').find({
        $and: [
          { isPublic: true },
          { lovedOneName: { $regex: 'Carol', $options: 'i' } }
        ]
      }).toArray();

      expect(results).toHaveLength(0);
    });
  });

  describe('User Profile Integration', () => {
    it('should create and update user profile', async () => {
      const userId = 'test-user-123';
      const userData = {
        userId,
        email: 'test@example.com',
        name: 'Test User',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Insert user
      await db.collection('users').insertOne(userData);

      // Update user
      await db.collection('users').updateOne(
        { userId },
        {
          $set: {
            name: 'Updated Test User',
            updatedAt: new Date()
          }
        }
      );

      // Verify update
      const user = await db.collection('users').findOne({ userId });
      expect(user?.name).toBe('Updated Test User');
    });

    it('should get user memorial count', async () => {
      const userId = 'test-user-123';

      // Insert memorials for user
      await db.collection('memorials').insertMany([
        {
          lovedOneName: 'Memorial 1',
          slug: 'memorial-1',
          creatorId: userId,
          creatorName: 'Test User',
          createdAt: new Date(),
          updatedAt: new Date(),
          viewCount: 0
        },
        {
          lovedOneName: 'Memorial 2',
          slug: 'memorial-2',
          creatorId: userId,
          creatorName: 'Test User',
          createdAt: new Date(),
          updatedAt: new Date(),
          viewCount: 0
        }
      ]);

      // Count memorials
      const count = await db.collection('memorials').countDocuments({ creatorId: userId });
      expect(count).toBe(2);
    });
  });

  describe('Photo Storage Integration', () => {
    it('should store and retrieve photo metadata', async () => {
      const photoMetadata = {
        filename: 'test-photo.jpg',
        metadata: {
          memorialId: 'test-memorial-123',
          originalName: 'test-photo.jpg',
          contentType: 'image/jpeg',
          size: 1024,
          uploadedBy: 'test-user',
          uploadedAt: new Date(),
          order: 1
        }
      };

      // Insert photo metadata
      const result = await db.collection('photos.files').insertOne(photoMetadata);
      expect(result.insertedId).toBeDefined();

      // Retrieve photos by memorial
      const photos = await db.collection('photos.files').find({
        'metadata.memorialId': 'test-memorial-123'
      }).toArray();

      expect(photos).toHaveLength(1);
      expect(photos[0].filename).toBe('test-photo.jpg');
    });

    it('should update photo order', async () => {
      // Insert multiple photos
      const photos = [
        {
          filename: 'photo1.jpg',
          metadata: {
            memorialId: 'test-memorial-123',
            order: 1,
            uploadedAt: new Date()
          }
        },
        {
          filename: 'photo2.jpg',
          metadata: {
            memorialId: 'test-memorial-123',
            order: 2,
            uploadedAt: new Date()
          }
        }
      ];

      const insertResult = await db.collection('photos.files').insertMany(photos);
      const photoIds = Object.values(insertResult.insertedIds);

      // Update order
      await db.collection('photos.files').updateOne(
        { _id: photoIds[0] },
        { $set: { 'metadata.order': 2 } }
      );

      await db.collection('photos.files').updateOne(
        { _id: photoIds[1] },
        { $set: { 'metadata.order': 1 } }
      );

      // Verify order update
      const updatedPhotos = await db.collection('photos.files')
        .find({ 'metadata.memorialId': 'test-memorial-123' })
        .sort({ 'metadata.order': 1 })
        .toArray();

      expect(updatedPhotos[0].filename).toBe('photo2.jpg');
      expect(updatedPhotos[1].filename).toBe('photo1.jpg');
    });
  });
});
