import { ObjectId } from 'mongodb';

// ============================================
// USER SCHEMA
// ============================================
export interface User {
  _id: ObjectId;
  auth0Id: string; // Auth0 user ID
  email: string;
  displayName?: string;
  phone?: string;
  role: 'Viewer' | 'Owner' | 'Admin' | 'FuneralDirector';
  
  // Funeral Director specific fields
  funeralHomeName?: string;
  funeralHomeAddress?: string;
  funeralHomeEmail?: string;
  funeralHomePhone?: string;
  personalPhone?: string;
  approved?: boolean;
  approvedAt?: Date;
  approvedBy?: ObjectId; // Admin user ID who approved
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  
  // Additional metadata
  emailVerified?: boolean;
  lastLoginAt?: Date;
  profileImageUrl?: string;
}

// ============================================
// MEMORIAL SCHEMA
// ============================================
export interface Memorial {
  _id: ObjectId;
  customUrl: string; // Unique URL slug
  lovedOneName: string;
  creatorId: ObjectId; // Reference to User._id
  creatorName: string;
  creatorPhone: string;
  creatorEmail: string;
  isPublic: boolean;
  
  // Optional memorial details
  dateOfBirth?: Date;
  dateOfPassing?: Date;
  biography?: string;
  location?: string;
  
  // Settings
  allowComments?: boolean;
  allowPhotos?: boolean;
  moderateContent?: boolean;
  
  // Statistics
  viewCount?: number;
  photoCount?: number;
  followerCount?: number;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// PHOTO SCHEMA
// ============================================
export interface Photo {
  _id: ObjectId;
  memorialId: ObjectId; // Reference to Memorial._id
  fileName: string;
  originalName: string;
  
  // S3 Storage details
  s3Key: string;
  s3Url: string;
  s3Bucket: string;
  
  // Photo metadata
  order: number;
  size: number; // File size in bytes
  mimeType: string;
  width?: number;
  height?: number;
  
  // Upload details
  uploadedBy: ObjectId; // Reference to User._id
  uploadedAt: Date;
  
  // Optional metadata
  caption?: string;
  tags?: string[];
  isProfilePhoto?: boolean;
  
  // Processing status
  processingStatus?: 'pending' | 'completed' | 'failed';
  thumbnailUrl?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// LIVESTREAM CONFIG SCHEMA
// ============================================
export interface LivestreamConfig {
  _id: ObjectId;
  memorialId: ObjectId; // Reference to Memorial._id
  creatorId: ObjectId; // Reference to User._id
  
  // Form data from calculator
  formData: {
    serviceType: string;
    duration: number;
    attendeeCount: number;
    features: string[];
    specialRequests?: string;
  };
  
  // Booking items and pricing
  bookingItems: BookingItem[];
  total: number;
  currency: string;
  
  // Workflow status
  currentStep: 'tier' | 'details' | 'addons' | 'payment' | 'confirmed';
  
  // Payment information
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentIntentId?: string;
  paidAt?: Date;
  
  // Livestream details
  streamKey?: string;
  streamUrl?: string;
  isLive?: boolean;
  streamStartTime?: Date;
  streamEndTime?: Date;
  viewerCount?: number;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export interface BookingItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  category: 'base' | 'addon' | 'upgrade';
}

// ============================================
// INVITATION SCHEMA
// ============================================
export interface Invitation {
  _id: ObjectId;
  memorialId: ObjectId; // Reference to Memorial._id
  invitedByUserId: ObjectId; // Reference to User._id
  inviteeEmail: string;
  inviteeName?: string;
  
  // Invitation details
  role: 'Viewer' | 'FamilyMember';
  message?: string;
  
  // Status tracking
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  acceptedAt?: Date;
  declinedAt?: Date;
  expiresAt: Date;
  
  // Security
  inviteToken: string; // Unique token for accepting invitation
  
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// FAMILY MEMBER SCHEMA
// ============================================
export interface FamilyMember {
  _id: ObjectId;
  memorialId: ObjectId; // Reference to Memorial._id
  userId: ObjectId; // Reference to User._id
  invitedBy: ObjectId; // Reference to User._id who invited them
  
  // Relationship details
  relationship?: string; // 'spouse', 'child', 'parent', 'sibling', 'friend', etc.
  permissions: {
    canUploadPhotos: boolean;
    canEditMemorial: boolean;
    canInviteOthers: boolean;
    canModerateComments: boolean;
  };
  
  // Status
  status: 'active' | 'inactive';
  
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// FOLLOWER SCHEMA
// ============================================
export interface Follower {
  _id: ObjectId;
  memorialId: ObjectId; // Reference to Memorial._id
  userId: ObjectId; // Reference to User._id
  
  // Notification preferences
  emailNotifications: boolean;
  pushNotifications: boolean;
  
  createdAt: Date;
}

// ============================================
// COMMENT SCHEMA (Future feature)
// ============================================
export interface Comment {
  _id: ObjectId;
  memorialId: ObjectId; // Reference to Memorial._id
  authorId: ObjectId; // Reference to User._id
  content: string;
  
  // Moderation
  isApproved: boolean;
  moderatedBy?: ObjectId; // Reference to User._id
  moderatedAt?: Date;
  
  // Threading (for replies)
  parentCommentId?: ObjectId;
  replyCount: number;
  
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// AUDIT LOG SCHEMA
// ============================================
export interface AuditLog {
  _id: ObjectId;
  userId?: ObjectId; // Reference to User._id (null for system actions)
  action: string; // 'create', 'update', 'delete', 'login', etc.
  resource: string; // 'memorial', 'photo', 'user', etc.
  resourceId?: ObjectId;
  
  // Details
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  
  createdAt: Date;
}

// ============================================
// ANALYTICS SCHEMA
// ============================================
export interface Analytics {
  _id: ObjectId;
  memorialId?: ObjectId; // Reference to Memorial._id (null for global analytics)
  
  // Metrics
  event: string; // 'page_view', 'photo_upload', 'slideshow_play', etc.
  value?: number;
  metadata?: Record<string, any>;
  
  // Session info
  sessionId?: string;
  userId?: ObjectId;
  
  createdAt: Date;
}

// ============================================
// MONGODB INDEXES
// ============================================
export const MONGODB_INDEXES = {
  users: [
    { auth0Id: 1 }, // Unique index
    { email: 1 }, // Unique index
    { role: 1, approved: 1 },
    { createdAt: -1 }
  ],
  
  memorials: [
    { customUrl: 1 }, // Unique index
    { creatorId: 1 },
    { isPublic: 1 },
    { createdAt: -1 },
    { lovedOneName: 'text' } // Text search
  ],
  
  photos: [
    { memorialId: 1, order: 1 },
    { memorialId: 1, createdAt: -1 },
    { uploadedBy: 1 },
    { s3Key: 1 } // Unique index
  ],
  
  livestreamConfigs: [
    { memorialId: 1 }, // Unique index
    { creatorId: 1 },
    { paymentStatus: 1 },
    { createdAt: -1 }
  ],
  
  invitations: [
    { memorialId: 1 },
    { inviteeEmail: 1 },
    { inviteToken: 1 }, // Unique index
    { status: 1 },
    { expiresAt: 1 }
  ],
  
  familyMembers: [
    { memorialId: 1, userId: 1 }, // Compound unique index
    { userId: 1 },
    { status: 1 }
  ],
  
  followers: [
    { memorialId: 1, userId: 1 }, // Compound unique index
    { userId: 1 },
    { createdAt: -1 }
  ],
  
  auditLogs: [
    { userId: 1, createdAt: -1 },
    { resource: 1, resourceId: 1 },
    { action: 1 },
    { createdAt: -1 }
  ],
  
  analytics: [
    { memorialId: 1, createdAt: -1 },
    { event: 1, createdAt: -1 },
    { userId: 1, createdAt: -1 },
    { createdAt: -1 }
  ]
};

// ============================================
// VALIDATION SCHEMAS (using Joi or similar)
// ============================================
export const VALIDATION_RULES = {
  user: {
    email: 'required|email',
    displayName: 'string|max:100',
    phone: 'string|max:20',
    role: 'required|in:Viewer,Owner,Admin,FuneralDirector'
  },
  
  memorial: {
    customUrl: 'required|string|min:3|max:50|regex:/^[a-z0-9-]+$/',
    lovedOneName: 'required|string|max:100',
    creatorName: 'required|string|max:100',
    creatorEmail: 'required|email',
    isPublic: 'boolean'
  },
  
  photo: {
    fileName: 'required|string|max:255',
    originalName: 'required|string|max:255',
    mimeType: 'required|in:image/jpeg,image/png,image/gif,image/webp',
    size: 'required|integer|max:10485760' // 10MB max
  }
};
