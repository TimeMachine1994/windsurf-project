import { MongoClient, GridFSBucket, ObjectId } from 'mongodb';
import sharp from 'sharp';
import { getDb } from './db.js';

export interface PhotoMetadata {
  memorialId: string;
  originalName: string;
  contentType: string;
  size: number;
  uploadedBy: string;
  uploadedAt: Date;
  order?: number;
}

export class PhotoStorage {
  private bucket: GridFSBucket | null = null;

  private async getBucket(): Promise<GridFSBucket> {
    if (!this.bucket) {
      const db = await getDb();
      this.bucket = new GridFSBucket(db, { bucketName: 'photos' });
    }
    return this.bucket;
  }

  async uploadPhoto(
    fileBuffer: Buffer,
    filename: string,
    metadata: PhotoMetadata
  ): Promise<string> {
    try {
      // Compress and resize image
      const compressedBuffer = await this.compressImage(fileBuffer);
      
      const bucket = await this.getBucket();
      const uploadStream = bucket.openUploadStream(filename, {
        metadata: {
          ...metadata,
          compressed: true,
          originalSize: fileBuffer.length,
          compressedSize: compressedBuffer.length
        }
      });

      return new Promise((resolve, reject) => {
        uploadStream.on('finish', () => {
          resolve(uploadStream.id.toString());
        });
        
        uploadStream.on('error', (error) => {
          reject(error);
        });

        uploadStream.write(compressedBuffer);
        uploadStream.end();
      });
    } catch (error) {
      console.error('Photo upload error:', error);
      throw new Error('Failed to upload photo');
    }
  }

  async getPhoto(photoId: string): Promise<{ stream: any; metadata: any } | null> {
    try {
      const bucket = await this.getBucket();
      const objectId = new ObjectId(photoId);
      
      // Get file info first
      const files = await bucket.find({ _id: objectId }).toArray();
      if (files.length === 0) {
        return null;
      }

      const downloadStream = bucket.openDownloadStream(objectId);
      return {
        stream: downloadStream,
        metadata: files[0]
      };
    } catch (error) {
      console.error('Photo retrieval error:', error);
      return null;
    }
  }

  async deletePhoto(photoId: string): Promise<boolean> {
    try {
      const bucket = await this.getBucket();
      const objectId = new ObjectId(photoId);
      await bucket.delete(objectId);
      return true;
    } catch (error) {
      console.error('Photo deletion error:', error);
      return false;
    }
  }

  async getPhotosByMemorial(memorialId: string): Promise<any[]> {
    try {
      const bucket = await this.getBucket();
      const files = await bucket.find({ 
        'metadata.memorialId': memorialId 
      }).sort({ 'metadata.order': 1, uploadDate: 1 }).toArray();
      
      return files.map(file => ({
        id: file._id.toString(),
        filename: file.filename,
        contentType: file.metadata?.contentType,
        size: file.length,
        uploadedAt: file.uploadDate,
        uploadedBy: file.metadata?.uploadedBy,
        order: file.metadata?.order || 0,
        originalSize: file.metadata?.originalSize,
        compressedSize: file.metadata?.compressedSize
      }));
    } catch (error) {
      console.error('Error getting photos by memorial:', error);
      return [];
    }
  }

  private async compressImage(buffer: Buffer): Promise<Buffer> {
    try {
      // Get image info
      const image = sharp(buffer);
      const metadata = await image.metadata();
      
      let processedImage = image;

      // Resize if too large (max 1920x1080)
      if (metadata.width && metadata.width > 1920) {
        processedImage = processedImage.resize(1920, null, {
          withoutEnlargement: true
        });
      }
      
      if (metadata.height && metadata.height > 1080) {
        processedImage = processedImage.resize(null, 1080, {
          withoutEnlargement: true
        });
      }

      // Convert to JPEG with compression
      const compressedBuffer = await processedImage
        .jpeg({ 
          quality: 85, // Good balance of quality vs size
          progressive: true 
        })
        .toBuffer();

      return compressedBuffer;
    } catch (error) {
      console.error('Image compression error:', error);
      // Return original buffer if compression fails
      return buffer;
    }
  }

  async updatePhotoOrder(memorialId: string, photoOrders: { id: string; order: number }[]): Promise<boolean> {
    try {
      const db = await getDb();
      const bucket = await this.getBucket();
      
      // Update each photo's order in metadata
      for (const { id, order } of photoOrders) {
        await db.collection('photos.files').updateOne(
          { _id: new ObjectId(id), 'metadata.memorialId': memorialId },
          { $set: { 'metadata.order': order } }
        );
      }
      
      return true;
    } catch (error) {
      console.error('Error updating photo order:', error);
      return false;
    }
  }
}

export const photoStorage = new PhotoStorage();
