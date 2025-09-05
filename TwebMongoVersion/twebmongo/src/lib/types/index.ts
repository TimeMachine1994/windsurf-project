import type { ObjectId } from 'mongodb';

export type Role = 'Viewer' | 'Owner' | 'Admin' | 'FuneralDirector';

export interface UserDoc {
  _id: ObjectId;
  auth0Id: string;
  email: string;
  name?: string;
  displayName?: string;
  phone?: string;
  role: Role;
  approved?: boolean;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  // Funeral Director specific fields
  funeralHomeName?: string;
  funeralHomeAddress?: string;
  funeralHomeEmail?: string;
  funeralHomePhone?: string;
  personalPhone?: string;
}

export interface MemorialDoc {
  _id: ObjectId;
  customUrl: string;
  lovedOneName: string;
  creatorId: ObjectId;
  creatorName: string;
  creatorEmail: string;
  isPublic: boolean;
  dateOfBirth?: Date;
  dateOfPassing?: Date;
  biography?: string;
  photoCount: number;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PhotoDoc {
  _id: ObjectId;
  memorialId: ObjectId;
  fileName: string;
  originalName: string;
  s3Key: string;
  s3Url: string;
  order: number;
  size: number;
  mimeType: string;
  uploadedBy: ObjectId;
  caption?: string;
  createdAt: Date;
  updatedAt: Date;
}
