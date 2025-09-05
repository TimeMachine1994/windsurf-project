# TributeStream MongoDB Migration Guide

## Overview
This guide provides step-by-step instructions for migrating TributeStream from Firebase to MongoDB. The migration involves replacing Firebase Auth, Firestore, and Firebase Storage with MongoDB Atlas, Auth0, and AWS S3.

## Migration Complexity: High (7/10)
**Estimated Timeline:** 6-8 weeks (1-2 developers) | 3-4 weeks (3+ developers)

---

## Phase 1: Infrastructure Setup

### 1.1 MongoDB Atlas Setup

1. **Create MongoDB Atlas Account**
   ```bash
   # Visit https://www.mongodb.com/atlas
   # Sign up for free tier or paid plan
   ```

2. **Create Database Cluster**
   - Choose cloud provider (AWS recommended for S3 integration)
   - Select region closest to your users
   - Configure cluster tier (M0 free tier for development)

3. **Database Configuration**
   ```javascript
   // Database name: tributestream
   // Collections to create:
   - users
   - memorials
   - photos
   - livestreamConfigs
   - invitations
   ```

4. **Network Access & Security**
   ```bash
   # Add IP whitelist (0.0.0.0/0 for development)
   # Create database user with readWrite permissions
   # Generate connection string
   ```

### 1.2 Authentication Provider Setup (Auth0)

1. **Create Auth0 Account**
   ```bash
   # Visit https://auth0.com
   # Create free account
   ```

2. **Configure Application**
   ```javascript
   // Application Type: Single Page Application
   // Allowed Callback URLs: http://localhost:5173/callback, https://yourdomain.com/callback
   // Allowed Logout URLs: http://localhost:5173, https://yourdomain.com
   // Allowed Web Origins: http://localhost:5173, https://yourdomain.com
   ```

3. **Setup Custom Claims (Roles)**
   ```javascript
   // Create Auth0 Rule for custom claims
   function addRolesToUser(user, context, callback) {
     const assignedRoles = (context.authorization || {}).roles;
     const idTokenClaims = context.idToken || {};
     const accessTokenClaims = context.accessToken || {};
     
     idTokenClaims['https://tributestream.com/roles'] = assignedRoles;
     accessTokenClaims['https://tributestream.com/roles'] = assignedRoles;
     
     callback(null, user, context);
   }
   ```

### 1.3 File Storage Setup (AWS S3)

1. **Create AWS Account & S3 Bucket**
   ```bash
   # Create S3 bucket: tributestream-photos
   # Enable versioning and encryption
   # Configure CORS policy
   ```

2. **S3 CORS Configuration**
   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
       "AllowedOrigins": ["http://localhost:5173", "https://yourdomain.com"],
       "ExposeHeaders": ["ETag"]
     }
   ]
   ```

3. **IAM User & Permissions**
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "s3:GetObject",
           "s3:PutObject",
           "s3:DeleteObject"
         ],
         "Resource": "arn:aws:s3:::tributestream-photos/*"
       }
     ]
   }
   ```

---

## Phase 2: Backend Migration

### 2.1 Install New Dependencies

```bash
# Remove Firebase
npm uninstall firebase

# Install MongoDB and Auth dependencies
npm install mongodb @auth0/auth0-spa-js
npm install aws-sdk multer multer-s3
npm install jsonwebtoken @types/jsonwebtoken
npm install dotenv
```

### 2.2 Environment Variables

```bash
# .env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/tributestream
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
S3_BUCKET_NAME=tributestream-photos
```

### 2.3 Database Schema Design

```javascript
// src/lib/mongodb/schemas.ts
export interface User {
  _id: ObjectId;
  auth0Id: string;
  email: string;
  displayName?: string;
  phone?: string;
  role: 'Viewer' | 'Owner' | 'Admin' | 'FuneralDirector';
  // Funeral Director fields
  funeralHomeName?: string;
  funeralHomeAddress?: string;
  approved?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Memorial {
  _id: ObjectId;
  customUrl: string;
  lovedOneName: string;
  creatorId: ObjectId;
  creatorName: string;
  creatorEmail: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Photo {
  _id: ObjectId;
  memorialId: ObjectId;
  fileName: string;
  originalName: string;
  s3Key: string;
  s3Url: string;
  order: number;
  uploadedBy: ObjectId;
  size: number;
  mimeType: string;
  createdAt: Date;
}
```

### 2.4 Database Connection

```typescript
// src/lib/mongodb/connection.ts
import { MongoClient, Db } from 'mongodb';

let client: MongoClient;
let db: Db;

export async function connectToDatabase(): Promise<Db> {
  if (db) return db;
  
  client = new MongoClient(process.env.MONGODB_URI!);
  await client.connect();
  db = client.db('tributestream');
  
  return db;
}

export async function closeDatabaseConnection(): Promise<void> {
  if (client) {
    await client.close();
  }
}
```

### 2.5 Authentication Middleware

```typescript
// src/lib/auth/middleware.ts
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '../mongodb/connection';

export async function verifyAuth(token: string) {
  try {
    const decoded = jwt.verify(token, process.env.AUTH0_CLIENT_SECRET!) as any;
    const db = await connectToDatabase();
    
    const user = await db.collection('users').findOne({ 
      auth0Id: decoded.sub 
    });
    
    return user;
  } catch (error) {
    throw new Error('Invalid token');
  }
}

export function requireRole(allowedRoles: string[]) {
  return (user: any) => {
    if (!user || !allowedRoles.includes(user.role)) {
      throw new Error('Insufficient permissions');
    }
  };
}
```

---

## Phase 3: Data Migration

### 3.1 Export Firebase Data

```javascript
// scripts/export-firebase-data.js
import admin from 'firebase-admin';
import fs from 'fs';

// Initialize Firebase Admin
const serviceAccount = require('./firebase-service-account.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function exportCollection(collectionName) {
  const snapshot = await db.collection(collectionName).get();
  const data = [];
  
  snapshot.forEach(doc => {
    data.push({ id: doc.id, ...doc.data() });
  });
  
  fs.writeFileSync(`./exports/${collectionName}.json`, JSON.stringify(data, null, 2));
  console.log(`Exported ${data.length} documents from ${collectionName}`);
}

// Export all collections
await exportCollection('users');
await exportCollection('memorials');
await exportCollection('livestreamConfigs');
```

### 3.2 Import to MongoDB

```javascript
// scripts/import-to-mongodb.js
import { MongoClient } from 'mongodb';
import fs from 'fs';

const client = new MongoClient(process.env.MONGODB_URI);

async function importCollection(collectionName) {
  const data = JSON.parse(fs.readFileSync(`./exports/${collectionName}.json`));
  const db = client.db('tributestream');
  
  // Transform Firebase data to MongoDB format
  const transformedData = data.map(doc => ({
    ...doc,
    _id: new ObjectId(),
    createdAt: new Date(doc.createdAt._seconds * 1000),
    updatedAt: new Date(doc.updatedAt._seconds * 1000)
  }));
  
  await db.collection(collectionName).insertMany(transformedData);
  console.log(`Imported ${transformedData.length} documents to ${collectionName}`);
}

await client.connect();
await importCollection('users');
await importCollection('memorials');
await client.close();
```

### 3.3 Migrate Photos to S3

```javascript
// scripts/migrate-photos.js
import AWS from 'aws-sdk';
import fetch from 'node-fetch';

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

async function migratePhoto(firebaseUrl, s3Key) {
  const response = await fetch(firebaseUrl);
  const buffer = await response.buffer();
  
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: s3Key,
    Body: buffer,
    ContentType: response.headers.get('content-type')
  };
  
  const result = await s3.upload(params).promise();
  return result.Location;
}
```

---

## Phase 4: Frontend Migration

### 4.1 Replace Firebase Config

```typescript
// src/lib/config/auth0.ts
import { createAuth0Client } from '@auth0/auth0-spa-js';

export const auth0Client = createAuth0Client({
  domain: 'your-domain.auth0.com',
  clientId: 'your-client-id',
  authorizationParams: {
    redirect_uri: window.location.origin + '/callback'
  }
});
```

### 4.2 Update Authentication Service

```typescript
// src/lib/services/auth.ts
import { auth0Client } from '../config/auth0';

export class AuthService {
  async login() {
    await auth0Client.loginWithRedirect();
  }
  
  async logout() {
    await auth0Client.logout({
      logoutParams: {
        returnTo: window.location.origin
      }
    });
  }
  
  async getUser() {
    return await auth0Client.getUser();
  }
  
  async getToken() {
    return await auth0Client.getTokenSilently();
  }
}
```

### 4.3 Update API Calls

```typescript
// src/lib/services/memorial.ts
export class MemorialService {
  private baseUrl = '/api';
  
  async createMemorial(data: MemorialData) {
    const token = await authService.getToken();
    
    const response = await fetch(`${this.baseUrl}/memorials`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    return response.json();
  }
  
  async getMemorial(id: string) {
    const response = await fetch(`${this.baseUrl}/memorials/${id}`);
    return response.json();
  }
}
```

### 4.4 Update Photo Upload Service

```typescript
// src/lib/services/photos.ts
export class PhotoService {
  async uploadPhoto(memorialId: string, file: File) {
    const token = await authService.getToken();
    const formData = new FormData();
    formData.append('photo', file);
    formData.append('memorialId', memorialId);
    
    const response = await fetch('/api/photos/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    return response.json();
  }
}
```

---

## Phase 5: API Routes Migration

### 5.1 Memorial API Routes

```typescript
// src/routes/api/memorials/+server.ts
import { json } from '@sveltejs/kit';
import { connectToDatabase } from '$lib/mongodb/connection';
import { verifyAuth } from '$lib/auth/middleware';

export async function POST({ request }) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const user = await verifyAuth(token);
    
    const data = await request.json();
    const db = await connectToDatabase();
    
    const memorial = {
      ...data,
      creatorId: user._id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await db.collection('memorials').insertOne(memorial);
    return json({ success: true, id: result.insertedId });
  } catch (error) {
    return json({ error: error.message }, { status: 400 });
  }
}
```

### 5.2 Photo Upload API

```typescript
// src/routes/api/photos/upload/+server.ts
import { json } from '@sveltejs/kit';
import AWS from 'aws-sdk';
import { connectToDatabase } from '$lib/mongodb/connection';

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

export async function POST({ request }) {
  try {
    const formData = await request.formData();
    const file = formData.get('photo') as File;
    const memorialId = formData.get('memorialId') as string;
    
    // Upload to S3
    const s3Key = `memorials/${memorialId}/${Date.now()}-${file.name}`;
    const uploadParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: s3Key,
      Body: Buffer.from(await file.arrayBuffer()),
      ContentType: file.type
    };
    
    const s3Result = await s3.upload(uploadParams).promise();
    
    // Save metadata to MongoDB
    const db = await connectToDatabase();
    const photo = {
      memorialId: new ObjectId(memorialId),
      fileName: file.name,
      s3Key,
      s3Url: s3Result.Location,
      size: file.size,
      mimeType: file.type,
      createdAt: new Date()
    };
    
    const result = await db.collection('photos').insertOne(photo);
    return json({ success: true, photo: { ...photo, _id: result.insertedId } });
  } catch (error) {
    return json({ error: error.message }, { status: 500 });
  }
}
```

---

## Phase 6: Testing & Deployment

### 6.1 Testing Checklist

- [ ] User registration and login
- [ ] Memorial creation and viewing
- [ ] Photo upload and display
- [ ] Role-based permissions
- [ ] Slideshow functionality
- [ ] Livestream configuration
- [ ] Admin approval workflows

### 6.2 Performance Optimization

```javascript
// MongoDB Indexes
db.users.createIndex({ "auth0Id": 1 }, { unique: true });
db.memorials.createIndex({ "customUrl": 1 }, { unique: true });
db.memorials.createIndex({ "creatorId": 1 });
db.photos.createIndex({ "memorialId": 1, "order": 1 });
```

### 6.3 Deployment Steps

1. **Environment Setup**
   ```bash
   # Production environment variables
   # MongoDB Atlas production cluster
   # Auth0 production application
   # S3 production bucket
   ```

2. **Database Migration**
   ```bash
   # Run migration scripts in production
   # Verify data integrity
   # Test all functionality
   ```

3. **DNS & SSL**
   ```bash
   # Update DNS records
   # Configure SSL certificates
   # Update Auth0 callback URLs
   ```

---

## Rollback Plan

### Emergency Rollback Steps

1. **Immediate Rollback**
   ```bash
   # Revert to Firebase codebase
   git checkout firebase-backup-branch
   npm install
   npm run build
   ```

2. **Data Synchronization**
   ```bash
   # Export any new data from MongoDB
   # Import back to Firebase if needed
   ```

---

## Post-Migration Monitoring

### Key Metrics to Monitor

- Authentication success rates
- Photo upload performance
- Database query performance
- Error rates and logs
- User experience feedback

### Monitoring Tools

```bash
# MongoDB Atlas monitoring
# AWS CloudWatch for S3
# Auth0 logs and analytics
# Application performance monitoring
```

---

## Estimated Costs

| Service | Development | Production |
|---------|-------------|------------|
| MongoDB Atlas | Free (M0) | $57/month (M10) |
| Auth0 | Free (7,000 users) | $23/month (1,000 users) |
| AWS S3 | ~$5/month | ~$20-50/month |
| **Total** | **~$5/month** | **~$100-130/month** |

---

## Conclusion

This migration requires significant effort but provides benefits like:
- Better cost control at scale
- More flexible data modeling
- Reduced vendor lock-in
- Enhanced security options

**Recommendation:** Ensure you have compelling reasons for migration before proceeding, as Firebase provides excellent integration and developer experience for your current use case.
