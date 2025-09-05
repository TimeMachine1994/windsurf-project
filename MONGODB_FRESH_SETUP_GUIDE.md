# TributeStream MongoDB Fresh Development Setup

## Overview
This guide provides step-by-step instructions for setting up TributeStream with MongoDB from scratch during development. Since there's no existing data to migrate, we can implement a clean MongoDB + Auth0 architecture.

## Setup Complexity: Medium (5/10)
**Estimated Timeline:** 2-3 weeks (1-2 developers) | 1-2 weeks (3+ developers)

---

## Phase 1: Infrastructure Setup

### 1.1 MongoDB Atlas Setup

1. **Create MongoDB Atlas Account**
   ```bash
   # Visit https://www.mongodb.com/atlas
   # Sign up for free tier (M0)
   ```

2. **Create Development Cluster**
   - Choose AWS (recommended for S3 integration)
   - Select region closest to you
   - Use M0 free tier for development

3. **Database Configuration**
   ```javascript
   // Database name: tributestream_dev
   // Collections will be created automatically
   ```

4. **Network Access & Security**
   ```bash
   # Add your IP address to whitelist
   # For development: Add 0.0.0.0/0 (allow all)
   # Create database user: tributestream_dev / strong_password
   # Copy connection string
   ```

### 1.2 Auth0 Setup

1. **Create Auth0 Account**
   ```bash
   # Visit https://auth0.com
   # Create free account (up to 7,000 users)
   ```

2. **Create Single Page Application**
   ```javascript
   // Application Type: Single Page Application
   // Name: TributeStream Dev
   // Allowed Callback URLs: http://localhost:5173/callback
   // Allowed Logout URLs: http://localhost:5173
   // Allowed Web Origins: http://localhost:5173
   ```

3. **Create API (for backend authentication)**
   ```javascript
   // Name: TributeStream API
   // Identifier: https://api.tributestream.com
   // Signing Algorithm: RS256
   ```

### 1.3 AWS S3 Setup (for photo storage)

1. **Create S3 Bucket**
   ```bash
   # Bucket name: tributestream-dev-photos
   # Region: us-east-1 (or your preferred region)
   # Block all public access: OFF (we'll configure specific permissions)
   ```

2. **Configure CORS**
   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
       "AllowedOrigins": ["http://localhost:5173"],
       "ExposeHeaders": ["ETag"]
     }
   ]
   ```

3. **Create IAM User**
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
         "Resource": "arn:aws:s3:::tributestream-dev-photos/*"
       }
     ]
   }
   ```

---

## Phase 2: Development Environment

### 2.1 Update Dependencies

```bash
# Remove Firebase
npm uninstall firebase

# Install MongoDB and Auth dependencies
npm install mongodb @auth0/auth0-spa-js
npm install aws-sdk @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
npm install jsonwebtoken @types/jsonwebtoken
npm install bcryptjs @types/bcryptjs
npm install joi # for validation
```

### 2.2 Environment Variables

Create `.env` file:
```bash
# MongoDB
MONGODB_URI=mongodb+srv://tributestream_dev:password@cluster.mongodb.net/tributestream_dev

# Auth0
VITE_AUTH0_DOMAIN=your-domain.auth0.com
VITE_AUTH0_CLIENT_ID=your-spa-client-id
VITE_AUTH0_AUDIENCE=https://api.tributestream.com
AUTH0_CLIENT_SECRET=your-client-secret

# AWS S3
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
S3_BUCKET_NAME=tributestream-dev-photos

# App Configuration
NODE_ENV=development
JWT_SECRET=your-jwt-secret-for-server-side
```

### 2.3 Update Package.json Scripts

```json
{
  "scripts": {
    "dev": "vite dev",
    "dev:setup": "node scripts/setup-dev-db.js && vite dev",
    "build": "vite build",
    "preview": "vite preview",
    "db:setup": "node scripts/setup-dev-db.js",
    "db:seed": "node scripts/seed-dev-data.js",
    "db:reset": "node scripts/reset-dev-db.js"
  }
}
```

---

## Phase 3: Database Setup

### 3.1 MongoDB Connection

Create `src/lib/mongodb/connection.ts`:
```typescript
import { MongoClient, Db } from 'mongodb';

let client: MongoClient;
let db: Db;

export async function connectToDatabase(): Promise<Db> {
  if (db) return db;
  
  const uri = import.meta.env.VITE_MONGODB_URI || process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MongoDB URI not found in environment variables');
  }
  
  client = new MongoClient(uri);
  await client.connect();
  db = client.db();
  
  console.log('✅ Connected to MongoDB');
  return db;
}

export async function closeDatabaseConnection(): Promise<void> {
  if (client) {
    await client.close();
    console.log('🔌 MongoDB connection closed');
  }
}
```

### 3.2 Database Initialization Script

Create `scripts/setup-dev-db.js`:
```javascript
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

async function setupDatabase() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db();
    
    console.log('🚀 Setting up development database...');
    
    // Create indexes
    await db.collection('users').createIndex({ auth0Id: 1 }, { unique: true });
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('memorials').createIndex({ customUrl: 1 }, { unique: true });
    await db.collection('memorials').createIndex({ creatorId: 1 });
    await db.collection('photos').createIndex({ memorialId: 1, order: 1 });
    
    console.log('✅ Database indexes created');
    
    // Create admin user
    const adminUser = {
      auth0Id: 'dev-admin',
      email: 'admin@tributestream.dev',
      displayName: 'Development Admin',
      role: 'Admin',
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await db.collection('users').updateOne(
      { email: adminUser.email },
      { $setOnInsert: adminUser },
      { upsert: true }
    );
    
    console.log('✅ Admin user created');
    console.log('🎉 Database setup complete!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
  } finally {
    await client.close();
  }
}

setupDatabase();
```

---

## Phase 4: Service Layer Implementation

### 4.1 Authentication Service

Create `src/lib/services/auth.ts`:
```typescript
import { createAuth0Client, Auth0Client } from '@auth0/auth0-spa-js';
import { connectToDatabase } from '../mongodb/connection';
import type { User } from '../types/user';

class AuthService {
  private auth0Client: Auth0Client | null = null;
  private currentUser: User | null = null;

  async initialize() {
    this.auth0Client = await createAuth0Client({
      domain: import.meta.env.VITE_AUTH0_DOMAIN,
      clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
      authorizationParams: {
        redirect_uri: window.location.origin + '/callback',
        audience: import.meta.env.VITE_AUTH0_AUDIENCE
      }
    });

    const isAuthenticated = await this.auth0Client.isAuthenticated();
    if (isAuthenticated) {
      await this.loadCurrentUser();
    }
  }

  async login() {
    if (!this.auth0Client) throw new Error('Auth0 not initialized');
    await this.auth0Client.loginWithRedirect();
  }

  async logout() {
    if (!this.auth0Client) throw new Error('Auth0 not initialized');
    await this.auth0Client.logout({
      logoutParams: { returnTo: window.location.origin }
    });
    this.currentUser = null;
  }

  async getCurrentUser(): Promise<User | null> {
    if (this.currentUser) return this.currentUser;
    return await this.loadCurrentUser();
  }

  private async loadCurrentUser(): Promise<User | null> {
    if (!this.auth0Client) return null;

    const auth0User = await this.auth0Client.getUser();
    if (!auth0User) return null;

    // Load from MongoDB or create new user
    const db = await connectToDatabase();
    let mongoUser = await db.collection('users').findOne({ auth0Id: auth0User.sub });

    if (!mongoUser) {
      mongoUser = {
        auth0Id: auth0User.sub,
        email: auth0User.email,
        displayName: auth0User.name,
        role: 'Viewer',
        emailVerified: auth0User.email_verified,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await db.collection('users').insertOne(mongoUser);
    }

    this.currentUser = mongoUser;
    return mongoUser;
  }

  async getAccessToken(): Promise<string> {
    if (!this.auth0Client) throw new Error('Auth0 not initialized');
    return await this.auth0Client.getTokenSilently();
  }
}

export const authService = new AuthService();
```

### 4.2 Memorial Service

Create `src/lib/services/memorial.ts`:
```typescript
import { connectToDatabase } from '../mongodb/connection';
import { ObjectId } from 'mongodb';
import { authService } from './auth';

export class MemorialService {
  async createMemorial(data: {
    lovedOneName: string;
    creatorName: string;
    creatorEmail: string;
    creatorPhone: string;
  }) {
    const db = await connectToDatabase();
    const user = await authService.getCurrentUser();
    
    if (!user) throw new Error('User not authenticated');

    const customUrl = this.generateSlug(data.lovedOneName);
    const uniqueUrl = await this.ensureUniqueUrl(customUrl);

    const memorial = {
      customUrl: uniqueUrl,
      lovedOneName: data.lovedOneName,
      creatorId: user._id,
      creatorName: data.creatorName,
      creatorEmail: data.creatorEmail,
      creatorPhone: data.creatorPhone,
      isPublic: false,
      photoCount: 0,
      viewCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('memorials').insertOne(memorial);
    return { ...memorial, _id: result.insertedId };
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  private async ensureUniqueUrl(baseUrl: string): Promise<string> {
    const db = await connectToDatabase();
    let url = baseUrl;
    let counter = 1;

    while (await db.collection('memorials').findOne({ customUrl: url })) {
      url = `${baseUrl}-${counter}`;
      counter++;
    }

    return url;
  }
}

export const memorialService = new MemorialService();
```

---

## Phase 5: Frontend Updates

### 5.1 Update App Layout

Update `src/routes/+layout.svelte`:
```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { authService } from '$lib/services/auth';
  
  onMount(async () => {
    await authService.initialize();
  });
</script>

<main>
  <slot />
</main>
```

### 5.2 Update Authentication Components

Replace Firebase auth calls in your components with Auth0:
```svelte
<!-- LoginForm.svelte -->
<script lang="ts">
  import { authService } from '$lib/services/auth';
  
  async function handleLogin() {
    await authService.login();
  }
</script>

<button on:click={handleLogin}>Login</button>
```

---

## Phase 6: API Routes

### 6.1 Authentication Middleware

Create `src/lib/auth/middleware.ts`:
```typescript
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '../mongodb/connection';

export async function authenticateRequest(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('No valid authorization header');
  }

  const token = authHeader.substring(7);
  const decoded = jwt.verify(token, process.env.AUTH0_CLIENT_SECRET!) as any;
  
  const db = await connectToDatabase();
  const user = await db.collection('users').findOne({ auth0Id: decoded.sub });
  
  if (!user) {
    throw new Error('User not found');
  }

  return user;
}
```

### 6.2 Memorial API Routes

Create `src/routes/api/memorials/+server.ts`:
```typescript
import { json } from '@sveltejs/kit';
import { connectToDatabase } from '$lib/mongodb/connection';
import { authenticateRequest } from '$lib/auth/middleware';

export async function POST({ request }) {
  try {
    const user = await authenticateRequest(request);
    const data = await request.json();
    
    const db = await connectToDatabase();
    // Memorial creation logic here
    
    return json({ success: true });
  } catch (error) {
    return json({ error: error.message }, { status: 401 });
  }
}
```

---

## Phase 7: Development Workflow

### 7.1 Development Commands

```bash
# Setup development database
npm run db:setup

# Start development server
npm run dev

# Reset database (when needed)
npm run db:reset

# Seed test data
npm run db:seed
```

### 7.2 Testing Setup

Create basic test data:
```javascript
// scripts/seed-dev-data.js
// Creates sample memorials and users for testing
```

---

## Phase 8: Deployment Preparation

### 8.1 Production Environment

1. **MongoDB Atlas Production Cluster**
2. **Auth0 Production Application**
3. **AWS S3 Production Bucket**
4. **Environment Variables for Production**

### 8.2 Build Configuration

Update `vite.config.js` for production builds with proper environment handling.

---

## Benefits of Fresh Implementation

✅ **Clean Architecture** - No legacy Firebase code to maintain  
✅ **Modern Stack** - Latest MongoDB, Auth0, and AWS integrations  
✅ **Better Performance** - Optimized for your specific use case  
✅ **Cost Effective** - Pay only for what you use  
✅ **Scalable** - Built for growth from day one  

---

## Next Steps

1. **Week 1**: Infrastructure setup and basic authentication
2. **Week 2**: Core memorial and photo functionality  
3. **Week 3**: Testing, refinement, and deployment preparation

This approach gives you a modern, scalable foundation without the complexity of data migration!
