/**
 * Memorial Service for MongoDB
 * Handles memorial creation, retrieval, and management
 */

import { connectToDatabase } from '../mongodb/connection';
import { ObjectId } from 'mongodb';
import { authService } from './auth';

export interface Memorial {
  _id: ObjectId;
  customUrl: string;
  lovedOneName: string;
  creatorId: ObjectId;
  creatorName: string;
  creatorPhone: string;
  creatorEmail: string;
  isPublic: boolean;
  dateOfBirth?: Date;
  dateOfPassing?: Date;
  biography?: string;
  location?: string;
  allowComments: boolean;
  allowPhotos: boolean;
  moderateContent: boolean;
  viewCount: number;
  photoCount: number;
  followerCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MemorialCreationData {
  lovedOneName: string;
  creatorName: string;
  creatorPhone: string;
  creatorEmail: string;
  dateOfBirth?: Date;
  dateOfPassing?: Date;
  biography?: string;
  location?: string;
}

export class MemorialService {
  
  async createMemorialAndUser(data: MemorialCreationData): Promise<{
    memorial: Memorial;
    user: any;
    generatedPassword: string;
    customUrl: string;
  }> {
    console.log('🚀 Starting memorial creation process');
    
    const db = await connectToDatabase();
    const memorialsCollection = db.collection('memorials');
    
    // Generate custom URL
    let customUrl = this.generateMemorialSlug(data.lovedOneName);
    customUrl = await this.ensureUniqueUrl(customUrl);
    
    // Register user as memorial owner
    const { user, tempPassword } = await authService.registerMemorialOwner({
      email: data.creatorEmail,
      displayName: data.creatorName,
      phone: data.creatorPhone
    });
    
    // Create memorial document
    const memorial: Omit<Memorial, '_id'> = {
      customUrl,
      lovedOneName: data.lovedOneName,
      creatorId: user._id,
      creatorName: data.creatorName,
      creatorPhone: data.creatorPhone,
      creatorEmail: data.creatorEmail,
      isPublic: false,
      dateOfBirth: data.dateOfBirth,
      dateOfPassing: data.dateOfPassing,
      biography: data.biography,
      location: data.location,
      allowComments: true,
      allowPhotos: true,
      moderateContent: false,
      viewCount: 0,
      photoCount: 0,
      followerCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await memorialsCollection.insertOne(memorial as Memorial);
    const createdMemorial = { ...memorial, _id: result.insertedId } as Memorial;
    
    console.log('✅ Memorial created successfully');
    
    return {
      memorial: createdMemorial,
      user,
      generatedPassword: tempPassword,
      customUrl
    };
  }
  
  async getMemorialByUrl(customUrl: string): Promise<Memorial | null> {
    const db = await connectToDatabase();
    const memorialsCollection = db.collection('memorials');
    
    const memorial = await memorialsCollection.findOne({ customUrl });
    
    if (memorial) {
      // Increment view count
      await memorialsCollection.updateOne(
        { _id: memorial._id },
        { $inc: { viewCount: 1 } }
      );
    }
    
    return memorial as Memorial | null;
  }
  
  async getMemorialByCreatorId(creatorId: ObjectId): Promise<Memorial | null> {
    const db = await connectToDatabase();
    const memorialsCollection = db.collection('memorials');
    
    return await memorialsCollection.findOne({ creatorId }) as Memorial | null;
  }
  
  async updateMemorial(memorialId: ObjectId, updates: Partial<Memorial>): Promise<void> {
    const currentUser = await authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    
    const db = await connectToDatabase();
    const memorialsCollection = db.collection('memorials');
    
    // Check permissions
    const memorial = await memorialsCollection.findOne({ _id: memorialId });
    if (!memorial) {
      throw new Error('Memorial not found');
    }
    
    const canEdit = currentUser.isAdmin() || 
                   memorial.creatorId.equals(currentUser._id) ||
                   await this.isFamilyMember(memorialId, currentUser._id);
    
    if (!canEdit) {
      throw new Error('Insufficient permissions to edit memorial');
    }
    
    await memorialsCollection.updateOne(
      { _id: memorialId },
      {
        $set: {
          ...updates,
          updatedAt: new Date()
        }
      }
    );
  }
  
  async deleteMemorial(memorialId: ObjectId): Promise<void> {
    const currentUser = await authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    
    const db = await connectToDatabase();
    const memorialsCollection = db.collection('memorials');
    
    // Check permissions - only owner or admin can delete
    const memorial = await memorialsCollection.findOne({ _id: memorialId });
    if (!memorial) {
      throw new Error('Memorial not found');
    }
    
    const canDelete = currentUser.isAdmin() || memorial.creatorId.equals(currentUser._id);
    if (!canDelete) {
      throw new Error('Insufficient permissions to delete memorial');
    }
    
    // Delete memorial and all related data
    await Promise.all([
      memorialsCollection.deleteOne({ _id: memorialId }),
      db.collection('photos').deleteMany({ memorialId }),
      db.collection('familyMembers').deleteMany({ memorialId }),
      db.collection('followers').deleteMany({ memorialId }),
      db.collection('livestreamConfigs').deleteMany({ memorialId })
    ]);
  }
  
  async searchMemorials(query: string, isPublicOnly: boolean = true): Promise<Memorial[]> {
    const db = await connectToDatabase();
    const memorialsCollection = db.collection('memorials');
    
    const searchFilter: any = {
      $text: { $search: query }
    };
    
    if (isPublicOnly) {
      searchFilter.isPublic = true;
    }
    
    return await memorialsCollection
      .find(searchFilter)
      .sort({ score: { $meta: 'textScore' } })
      .limit(20)
      .toArray() as Memorial[];
  }
  
  async getRecentMemorials(limit: number = 10): Promise<Memorial[]> {
    const db = await connectToDatabase();
    const memorialsCollection = db.collection('memorials');
    
    return await memorialsCollection
      .find({ isPublic: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray() as Memorial[];
  }
  
  // Family member management
  async addFamilyMember(memorialId: ObjectId, userId: ObjectId, permissions: any): Promise<void> {
    const currentUser = await authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    
    const db = await connectToDatabase();
    
    // Check if user is memorial owner
    const memorial = await db.collection('memorials').findOne({ _id: memorialId });
    if (!memorial || !memorial.creatorId.equals(currentUser._id)) {
      throw new Error('Only memorial owner can add family members');
    }
    
    const familyMember = {
      memorialId,
      userId,
      invitedBy: currentUser._id,
      permissions: {
        canUploadPhotos: true,
        canEditMemorial: false,
        canInviteOthers: false,
        canModerateComments: false,
        ...permissions
      },
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await db.collection('familyMembers').insertOne(familyMember);
  }
  
  async isFamilyMember(memorialId: ObjectId, userId: ObjectId): Promise<boolean> {
    const db = await connectToDatabase();
    const familyMember = await db.collection('familyMembers').findOne({
      memorialId,
      userId,
      status: 'active'
    });
    
    return !!familyMember;
  }
  
  // URL generation and validation
  private generateMemorialSlug(lovedOneName: string): string {
    return lovedOneName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
      .substring(0, 50); // Limit length
  }
  
  private async ensureUniqueUrl(baseUrl: string): Promise<string> {
    const db = await connectToDatabase();
    const memorialsCollection = db.collection('memorials');
    
    let url = baseUrl;
    let counter = 1;
    
    while (await memorialsCollection.findOne({ customUrl: url })) {
      if (counter <= 3) {
        url = `${baseUrl}-${counter}`;
      } else {
        // After 3 attempts, add random suffix
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        url = `${baseUrl}-${randomSuffix}`;
        break;
      }
      counter++;
    }
    
    return url;
  }
  
  async isUrlAvailable(customUrl: string): Promise<boolean> {
    const db = await connectToDatabase();
    const memorialsCollection = db.collection('memorials');
    
    const existing = await memorialsCollection.findOne({ customUrl });
    return !existing;
  }
}

export const memorialService = new MemorialService();
