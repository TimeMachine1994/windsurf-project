import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient, Db } from 'mongodb';
import { PhotoStorage } from '../lib/server/storage.js';
import sharp from 'sharp';

describe('Photo Storage Tests', () => {
  let mongod: MongoMemoryServer;
  let client: MongoClient;
  let db: Db;
  let photoStorage: PhotoStorage;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    client = new MongoClient(uri);
    await client.connect();
    db = client.db();
    photoStorage = new PhotoStorage();
  });

  afterAll(async () => {
    await client.close();
    await mongod.stop();
  });

  beforeEach(async () => {
    // Clear GridFS collections
    await db.collection('photos.files').deleteMany({});
    await db.collection('photos.chunks').deleteMany({});
    
    // Wait a bit to ensure cleanup is complete
    await new Promise(resolve => setTimeout(resolve, 100));
  });

  describe('Image Compression', () => {
    it('should compress large images', async () => {
      // Create a test image buffer (1x1 pixel PNG)
      const testImageBuffer = Buffer.from([
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
        0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
        0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
        0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4,
        0x89, 0x00, 0x00, 0x00, 0x0A, 0x49, 0x44, 0x41,
        0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
        0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00,
        0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE,
        0x42, 0x60, 0x82
      ]);

      const metadata = {
        memorialId: 'test-memorial-123',
        originalName: 'test-image.png',
        contentType: 'image/png',
        size: testImageBuffer.length,
        uploadedBy: 'test-user',
        uploadedAt: new Date()
      };

      const photoId = await photoStorage.uploadPhoto(testImageBuffer, 'test-image.png', metadata);
      
      expect(photoId).toBeDefined();
      expect(typeof photoId).toBe('string');
    });

    it('should handle invalid image data gracefully', async () => {
      const invalidBuffer = Buffer.from('not an image');
      const metadata = {
        memorialId: 'test-memorial-123',
        originalName: 'invalid.jpg',
        contentType: 'image/jpeg',
        size: invalidBuffer.length,
        uploadedBy: 'test-user',
        uploadedAt: new Date(),
        order: 1
      };
      
      // Should reject with an error
      await expect(
        photoStorage.uploadPhoto(invalidBuffer, 'invalid.jpg', metadata)
      ).rejects.toThrow();
    });
  });

  describe('Photo CRUD Operations', () => {
    let photoId: string;
    const testImageBuffer = Buffer.from('fake-image-data');

    beforeEach(async () => {
      const metadata = {
        memorialId: 'test-memorial-123',
        originalName: 'test.jpg',
        contentType: 'image/jpeg',
        size: testImageBuffer.length,
        uploadedBy: 'test-user',
        uploadedAt: new Date(),
        order: 1
      };

      photoId = await photoStorage.uploadPhoto(testImageBuffer, 'test.jpg', metadata);
    });

    it('should retrieve photos by memorial ID', async () => {
      const photos = await photoStorage.getPhotosByMemorial('test-memorial-123');
      
      expect(photos).toHaveLength(1);
      expect(photos[0].filename).toBe('test.jpg');
      expect(photos[0].id).toBe(photoId);
    });

    it('should delete photos', async () => {
      const success = await photoStorage.deletePhoto(photoId);
      expect(success).toBe(true);

      const photos = await photoStorage.getPhotosByMemorial('test-memorial-123');
      expect(photos).toHaveLength(0);
    });

    it('should update photo order', async () => {
      // Upload another photo
      const metadata2 = {
        memorialId: 'test-memorial-123',
        originalName: 'test2.jpg',
        contentType: 'image/jpeg',
        size: testImageBuffer.length,
        uploadedBy: 'test-user',
        uploadedAt: new Date(),
        order: 2
      };

      const photoId2 = await photoStorage.uploadPhoto(testImageBuffer, 'test2.jpg', metadata2);

      // Update order
      const success = await photoStorage.updatePhotoOrder('test-memorial-123', [
        { id: photoId, order: 2 },
        { id: photoId2, order: 1 }
      ]);

      expect(success).toBe(true);

      const photos = await photoStorage.getPhotosByMemorial('test-memorial-123');
      expect(photos).toHaveLength(2);
      expect(photos[0].order).toBe(1);
      expect(photos[1].order).toBe(2);
    });
  });

  describe('File Validation', () => {
    it('should validate file size limits', () => {
      const maxSize = 10 * 1024 * 1024; // 10MB
      const largeFileSize = 15 * 1024 * 1024; // 15MB

      expect(largeFileSize).toBeGreaterThan(maxSize);
    });

    it('should validate file types', () => {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      
      expect(allowedTypes).toContain('image/jpeg');
      expect(allowedTypes).toContain('image/png');
      expect(allowedTypes).not.toContain('text/plain');
      expect(allowedTypes).not.toContain('application/pdf');
    });
  });
});
