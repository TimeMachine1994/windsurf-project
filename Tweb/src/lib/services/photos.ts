/**
 * Photo Service for S3 + MongoDB
 * Handles photo uploads, management, and S3 integration
 */

import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { connectToDatabase } from '../mongodb/connection';
import { ObjectId } from 'mongodb';
import { authService } from './auth';

export interface Photo {
  _id: ObjectId;
  memorialId: ObjectId;
  fileName: string;
  originalName: string;
  s3Key: string;
  s3Url: string;
  s3Bucket: string;
  order: number;
  size: number;
  mimeType: string;
  width?: number;
  height?: number;
  uploadedBy: ObjectId;
  uploadedAt: Date;
  caption?: string;
  tags?: string[];
  isProfilePhoto?: boolean;
  processingStatus: 'pending' | 'completed' | 'failed';
  thumbnailUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class PhotoService {
  private s3Client: S3Client;
  private bucketName: string;

  constructor() {
    this.s3Client = new S3Client({
      region: import.meta.env.VITE_AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID!,
        secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY!
      }
    });
    this.bucketName = import.meta.env.VITE_S3_BUCKET_NAME || 'tributestream-dev-photos';
  }

  async uploadPhoto(memorialId: ObjectId, file: File): Promise<Photo> {
    const currentUser = await authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    // Validate file
    this.validateFile(file);

    // Check permissions
    await this.checkUploadPermissions(memorialId, currentUser._id);

    const db = await connectToDatabase();
    const photosCollection = db.collection('photos');

    // Generate unique filename and S3 key
    const fileExtension = this.getFileExtension(file.name);
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    const fileName = `${timestamp}_${randomId}${fileExtension}`;
    const s3Key = `memorials/${memorialId}/${fileName}`;

    try {
      // Upload to S3
      const uploadCommand = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: s3Key,
        Body: file,
        ContentType: file.type,
        Metadata: {
          'original-name': file.name,
          'memorial-id': memorialId.toString(),
          'uploaded-by': currentUser._id.toString()
        }
      });

      await this.s3Client.send(uploadCommand);

      // Generate S3 URL
      const s3Url = `https://${this.bucketName}.s3.amazonaws.com/${s3Key}`;

      // Get next order number
      const lastPhoto = await photosCollection
        .findOne({ memorialId }, { sort: { order: -1 } });
      const nextOrder = lastPhoto ? lastPhoto.order + 1 : 0;

      // Create photo document
      const photo: Omit<Photo, '_id'> = {
        memorialId,
        fileName,
        originalName: file.name,
        s3Key,
        s3Url,
        s3Bucket: this.bucketName,
        order: nextOrder,
        size: file.size,
        mimeType: file.type,
        uploadedBy: currentUser._id,
        uploadedAt: new Date(),
        processingStatus: 'completed',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await photosCollection.insertOne(photo as Photo);
      const createdPhoto = { ...photo, _id: result.insertedId } as Photo;

      // Update memorial photo count
      await db.collection('memorials').updateOne(
        { _id: memorialId },
        { $inc: { photoCount: 1 } }
      );

      console.log('✅ Photo uploaded successfully');
      return createdPhoto;

    } catch (error) {
      console.error('❌ Photo upload failed:', error);
      throw new Error(`Failed to upload photo: ${error.message}`);
    }
  }

  async getPhotos(memorialId: ObjectId): Promise<Photo[]> {
    const db = await connectToDatabase();
    const photosCollection = db.collection('photos');

    return await photosCollection
      .find({ memorialId })
      .sort({ order: 1 })
      .toArray() as Photo[];
  }

  async getPhoto(photoId: ObjectId): Promise<Photo | null> {
    const db = await connectToDatabase();
    const photosCollection = db.collection('photos');

    return await photosCollection.findOne({ _id: photoId }) as Photo | null;
  }

  async updatePhotoOrder(memorialId: ObjectId, photoUpdates: { id: string; order: number }[]): Promise<void> {
    const currentUser = await authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    // Check permissions
    await this.checkUploadPermissions(memorialId, currentUser._id);

    const db = await connectToDatabase();
    const photosCollection = db.collection('photos');

    // Update each photo's order
    const updatePromises = photoUpdates.map(async ({ id, order }) => {
      await photosCollection.updateOne(
        { _id: new ObjectId(id), memorialId },
        { $set: { order, updatedAt: new Date() } }
      );
    });

    await Promise.all(updatePromises);
    console.log('✅ Photo order updated successfully');
  }

  async deletePhoto(photoId: ObjectId): Promise<void> {
    const currentUser = await authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    const db = await connectToDatabase();
    const photosCollection = db.collection('photos');

    // Get photo details
    const photo = await photosCollection.findOne({ _id: photoId });
    if (!photo) {
      throw new Error('Photo not found');
    }

    // Check permissions
    await this.checkUploadPermissions(photo.memorialId, currentUser._id);

    try {
      // Delete from S3
      const deleteCommand = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: photo.s3Key
      });
      await this.s3Client.send(deleteCommand);

      // Delete from MongoDB
      await photosCollection.deleteOne({ _id: photoId });

      // Update memorial photo count
      await db.collection('memorials').updateOne(
        { _id: photo.memorialId },
        { $inc: { photoCount: -1 } }
      );

      console.log('✅ Photo deleted successfully');

    } catch (error) {
      console.error('❌ Photo deletion failed:', error);
      throw new Error(`Failed to delete photo: ${error.message}`);
    }
  }

  async updatePhotoCaption(photoId: ObjectId, caption: string): Promise<void> {
    const currentUser = await authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    const db = await connectToDatabase();
    const photosCollection = db.collection('photos');

    const photo = await photosCollection.findOne({ _id: photoId });
    if (!photo) {
      throw new Error('Photo not found');
    }

    // Check permissions
    await this.checkUploadPermissions(photo.memorialId, currentUser._id);

    await photosCollection.updateOne(
      { _id: photoId },
      {
        $set: {
          caption,
          updatedAt: new Date()
        }
      }
    );
  }

  async generatePresignedUrl(s3Key: string, expiresIn: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: s3Key
    });

    return await getSignedUrl(this.s3Client, command, { expiresIn });
  }

  private validateFile(file: File): void {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    if (file.size > maxSize) {
      throw new Error('File size too large. Maximum size is 10MB.');
    }

    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.');
    }
  }

  private getFileExtension(filename: string): string {
    const lastDot = filename.lastIndexOf('.');
    return lastDot !== -1 ? filename.substring(lastDot) : '.jpg';
  }

  private async checkUploadPermissions(memorialId: ObjectId, userId: ObjectId): Promise<void> {
    const db = await connectToDatabase();

    // Check if user is memorial owner
    const memorial = await db.collection('memorials').findOne({ _id: memorialId });
    if (memorial && memorial.creatorId.equals(userId)) {
      return; // Owner has permission
    }

    // Check if user is admin
    const user = await db.collection('users').findOne({ _id: userId });
    if (user && user.role === 'Admin') {
      return; // Admin has permission
    }

    // Check if user is family member with photo upload permission
    const familyMember = await db.collection('familyMembers').findOne({
      memorialId,
      userId,
      status: 'active'
    });

    if (familyMember && familyMember.permissions?.canUploadPhotos) {
      return; // Family member with permission
    }

    throw new Error('Insufficient permissions to upload photos to this memorial');
  }

  // Batch operations for slideshow management
  async uploadMultiplePhotos(memorialId: ObjectId, files: File[]): Promise<Photo[]> {
    const uploadPromises = files.map(file => this.uploadPhoto(memorialId, file));
    return await Promise.all(uploadPromises);
  }

  async reorderPhotos(memorialId: ObjectId, photoIds: string[]): Promise<void> {
    const photoUpdates = photoIds.map((id, index) => ({
      id,
      order: index
    }));

    await this.updatePhotoOrder(memorialId, photoUpdates);
  }

  // Get photos with pagination
  async getPhotosWithPagination(
    memorialId: ObjectId, 
    page: number = 1, 
    limit: number = 20
  ): Promise<{ photos: Photo[]; total: number; hasMore: boolean }> {
    const db = await connectToDatabase();
    const photosCollection = db.collection('photos');

    const skip = (page - 1) * limit;

    const [photos, total] = await Promise.all([
      photosCollection
        .find({ memorialId })
        .sort({ order: 1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      photosCollection.countDocuments({ memorialId })
    ]);

    return {
      photos: photos as Photo[],
      total,
      hasMore: skip + photos.length < total
    };
  }
}

export const photoService = new PhotoService();
