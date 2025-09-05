# TributeStream MongoDB Version - Build From Scratch Guide

## Overview
This guide walks you through building TributeStream from scratch using SvelteKit, Tailwind CSS, MongoDB, Auth0, and AWS S3. We'll create a completely fresh implementation in the `TwebMongoVersion` folder.

---

## Phase 1: Project Initialization

### Step 1: Create SvelteKit Project

```bash
cd TwebMongoVersion
npm create svelte@latest . --template skeleton --types typescript --prettier --eslint
npm install
```

### Step 2: Install Tailwind CSS

```bash
npm install -D tailwindcss postcss autoprefixer @tailwindcss/forms @tailwindcss/typography
npx tailwindcss init -p
```

Update `tailwind.config.js`:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          900: '#1e3a8a'
        }
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography')
  ]
}
```

Create `src/app.css`:
```css
@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';

@layer base {
  body {
    @apply bg-gray-50 text-gray-900;
  }
}

@layer components {
  .btn {
    @apply px-4 py-2 rounded-lg font-medium transition-colors;
  }
  
  .btn-primary {
    @apply bg-primary-600 text-white hover:bg-primary-700;
  }
  
  .btn-secondary {
    @apply bg-gray-200 text-gray-900 hover:bg-gray-300;
  }
  
  .card {
    @apply bg-white rounded-lg shadow-sm border border-gray-200 p-6;
  }
}
```

### Step 3: Install MongoDB and Auth Dependencies

```bash
npm install mongodb @auth0/auth0-spa-js
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
npm install jsonwebtoken bcryptjs joi
npm install @types/jsonwebtoken @types/bcryptjs
```

### Step 4: Install Additional Dependencies

```bash
npm install @sendgrid/mail stripe @stripe/stripe-js
npm install lucide-svelte # For icons
npm install date-fns # For date formatting
```

---

## Phase 2: Project Structure Setup

### Step 5: Create Folder Structure

```bash
mkdir -p src/lib/{components,services,stores,types,utils,mongodb}
mkdir -p src/routes/{api,auth}
mkdir -p static/images
mkdir -p scripts
```

### Step 6: Environment Configuration

Create `.env.example`:
```bash
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/tributestream_dev

# Auth0
VITE_AUTH0_DOMAIN=your-domain.auth0.com
VITE_AUTH0_CLIENT_ID=your-spa-client-id
VITE_AUTH0_AUDIENCE=https://api.tributestream.com
AUTH0_CLIENT_SECRET=your-client-secret

# AWS S3
VITE_AWS_ACCESS_KEY_ID=your-access-key
VITE_AWS_SECRET_ACCESS_KEY=your-secret-key
VITE_AWS_REGION=us-east-1
VITE_S3_BUCKET_NAME=tributestream-dev-photos

# Email (SendGrid)
SENDGRID_API_KEY=your-sendgrid-api-key
FROM_EMAIL=noreply@tributestream.com

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your-key
STRIPE_SECRET_KEY=sk_test_your-key

# App Configuration
VITE_APP_URL=http://localhost:5173
NODE_ENV=development
```

Create `.env` (copy from .env.example and fill in real values)

---

## Phase 3: Core Infrastructure

### Step 7: MongoDB Connection

Create `src/lib/mongodb/connection.ts`:
```typescript
import { MongoClient, Db } from 'mongodb';
import { dev } from '$app/environment';

let client: MongoClient;
let db: Db;

const MONGODB_URI = dev 
  ? import.meta.env.VITE_MONGODB_URI 
  : process.env.MONGODB_URI;

export async function connectToDatabase(): Promise<Db> {
  if (db) return db;
  
  if (!MONGODB_URI) {
    throw new Error('MongoDB URI not found');
  }
  
  client = new MongoClient(MONGODB_URI);
  await client.connect();
  db = client.db('tributestream_dev');
  
  return db;
}

export async function closeDatabaseConnection(): Promise<void> {
  if (client) {
    await client.close();
  }
}
```

### Step 8: TypeScript Types

Create `src/lib/types/index.ts`:
```typescript
import type { ObjectId } from 'mongodb';

export interface User {
  _id: ObjectId;
  auth0Id: string;
  email: string;
  displayName?: string;
  phone?: string;
  role: 'Viewer' | 'Owner' | 'Admin' | 'FuneralDirector';
  approved?: boolean;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

export interface Memorial {
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

export interface Photo {
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
```

### Step 9: Authentication Service

Create `src/lib/services/auth.ts`:
```typescript
import { createAuth0Client, type Auth0Client } from '@auth0/auth0-spa-js';
import { connectToDatabase } from '../mongodb/connection';
import type { User } from '../types';
import { writable } from 'svelte/store';

export const user = writable<User | null>(null);
export const isLoading = writable<boolean>(true);

class AuthService {
  private auth0Client: Auth0Client | null = null;
  private currentUser: User | null = null;

  async initialize() {
    this.auth0Client = await createAuth0Client({
      domain: import.meta.env.VITE_AUTH0_DOMAIN,
      clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
      authorizationParams: {
        redirect_uri: window.location.origin + '/auth/callback'
      }
    });

    const isAuthenticated = await this.auth0Client.isAuthenticated();
    if (isAuthenticated) {
      await this.loadCurrentUser();
    }
    
    isLoading.set(false);
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
    user.set(null);
  }

  async handleCallback() {
    if (!this.auth0Client) throw new Error('Auth0 not initialized');
    await this.auth0Client.handleRedirectCallback();
    await this.loadCurrentUser();
    window.location.replace('/');
  }

  private async loadCurrentUser(): Promise<User | null> {
    if (!this.auth0Client) return null;

    const auth0User = await this.auth0Client.getUser();
    if (!auth0User) return null;

    const db = await connectToDatabase();
    let mongoUser = await db.collection('users').findOne({ auth0Id: auth0User.sub });

    if (!mongoUser) {
      const newUser = {
        auth0Id: auth0User.sub,
        email: auth0User.email,
        displayName: auth0User.name,
        role: 'Viewer',
        emailVerified: auth0User.email_verified,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: new Date()
      };

      const result = await db.collection('users').insertOne(newUser);
      mongoUser = { ...newUser, _id: result.insertedId };
    }

    this.currentUser = mongoUser as User;
    user.set(this.currentUser);
    return this.currentUser;
  }

  async getCurrentUser(): Promise<User | null> {
    return this.currentUser || await this.loadCurrentUser();
  }

  async getAccessToken(): Promise<string> {
    if (!this.auth0Client) throw new Error('Auth0 not initialized');
    return await this.auth0Client.getTokenSilently();
  }
}

export const authService = new AuthService();
```

---

## Phase 4: Basic Components

### Step 10: Layout and Navigation

Create `src/routes/+layout.svelte`:
```svelte
<script lang="ts">
  import '../app.css';
  import { onMount } from 'svelte';
  import { authService, user, isLoading } from '$lib/services/auth';
  import Header from '$lib/components/Header.svelte';
  import Footer from '$lib/components/Footer.svelte';
  
  onMount(async () => {
    await authService.initialize();
  });
</script>

<div class="min-h-screen flex flex-col">
  {#if $isLoading}
    <div class="flex items-center justify-center min-h-screen">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  {:else}
    <Header />
    <main class="flex-1">
      <slot />
    </main>
    <Footer />
  {/if}
</div>
```

Create `src/lib/components/Header.svelte`:
```svelte
<script lang="ts">
  import { user, authService } from '$lib/services/auth';
  import { LogIn, LogOut, User, Home } from 'lucide-svelte';
  
  async function handleLogin() {
    await authService.login();
  }
  
  async function handleLogout() {
    await authService.logout();
  }
</script>

<header class="bg-white shadow-sm border-b">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between items-center h-16">
      <!-- Logo -->
      <div class="flex items-center">
        <a href="/" class="flex items-center space-x-2">
          <Home class="h-8 w-8 text-primary-600" />
          <span class="text-xl font-bold text-gray-900">TributeStream</span>
        </a>
      </div>

      <!-- Navigation -->
      <nav class="hidden md:flex space-x-8">
        <a href="/" class="text-gray-600 hover:text-gray-900">Home</a>
        <a href="/memorials" class="text-gray-600 hover:text-gray-900">Memorials</a>
        <a href="/about" class="text-gray-600 hover:text-gray-900">About</a>
      </nav>

      <!-- User Menu -->
      <div class="flex items-center space-x-4">
        {#if $user}
          <div class="flex items-center space-x-2">
            <User class="h-5 w-5 text-gray-600" />
            <span class="text-sm text-gray-700">{$user.displayName || $user.email}</span>
          </div>
          <button 
            on:click={handleLogout}
            class="btn btn-secondary flex items-center space-x-1"
          >
            <LogOut class="h-4 w-4" />
            <span>Logout</span>
          </button>
        {:else}
          <button 
            on:click={handleLogin}
            class="btn btn-primary flex items-center space-x-1"
          >
            <LogIn class="h-4 w-4" />
            <span>Login</span>
          </button>
        {/if}
      </div>
    </div>
  </div>
</header>
```

### Step 11: Home Page

Create `src/routes/+page.svelte`:
```svelte
<script lang="ts">
  import { user } from '$lib/services/auth';
  import { Heart, Users, Camera } from 'lucide-svelte';
</script>

<svelte:head>
  <title>TributeStream - Honor Lives, Share Memories</title>
</svelte:head>

<!-- Hero Section -->
<section class="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
    <div class="text-center">
      <h1 class="text-4xl md:text-6xl font-bold mb-6">
        Honor Lives, Share Memories
      </h1>
      <p class="text-xl md:text-2xl mb-8 text-primary-100">
        Create beautiful digital memorials to celebrate the lives of your loved ones
      </p>
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <a href="/create-memorial" class="btn bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 text-lg">
          Create Memorial
        </a>
        <a href="/memorials" class="btn border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-3 text-lg">
          Browse Memorials
        </a>
      </div>
    </div>
  </div>
</section>

<!-- Features Section -->
<section class="py-20">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-16">
      <h2 class="text-3xl font-bold text-gray-900 mb-4">
        Everything You Need to Honor a Life
      </h2>
      <p class="text-xl text-gray-600">
        Our platform provides all the tools to create meaningful digital memorials
      </p>
    </div>

    <div class="grid md:grid-cols-3 gap-8">
      <div class="card text-center">
        <div class="flex justify-center mb-4">
          <Heart class="h-12 w-12 text-primary-600" />
        </div>
        <h3 class="text-xl font-semibold mb-2">Beautiful Memorials</h3>
        <p class="text-gray-600">
          Create stunning digital memorials with photos, stories, and memories
        </p>
      </div>

      <div class="card text-center">
        <div class="flex justify-center mb-4">
          <Camera class="h-12 w-12 text-primary-600" />
        </div>
        <h3 class="text-xl font-semibold mb-2">Photo Galleries</h3>
        <p class="text-gray-600">
          Upload and organize photos with drag-and-drop slideshow management
        </p>
      </div>

      <div class="card text-center">
        <div class="flex justify-center mb-4">
          <Users class="h-12 w-12 text-primary-600" />
        </div>
        <h3 class="text-xl font-semibold mb-2">Family Sharing</h3>
        <p class="text-gray-600">
          Invite family members to contribute photos and share memories
        </p>
      </div>
    </div>
  </div>
</section>

{#if $user}
  <!-- User Dashboard Preview -->
  <section class="bg-gray-50 py-20">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center">
        <h2 class="text-3xl font-bold text-gray-900 mb-4">
          Welcome back, {$user.displayName || $user.email}
        </h2>
        <p class="text-xl text-gray-600 mb-8">
          Manage your memorials and continue honoring your loved ones
        </p>
        <a href="/dashboard" class="btn btn-primary px-8 py-3 text-lg">
          Go to Dashboard
        </a>
      </div>
    </div>
  </section>
{/if}
```

### Step 12: Authentication Callback

Create `src/routes/auth/callback/+page.svelte`:
```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { authService } from '$lib/services/auth';
  
  onMount(async () => {
    try {
      await authService.handleCallback();
    } catch (error) {
      console.error('Authentication callback failed:', error);
      window.location.replace('/');
    }
  });
</script>

<div class="flex items-center justify-center min-h-screen">
  <div class="text-center">
    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
    <p class="text-gray-600">Completing authentication...</p>
  </div>
</div>
```

---

## Phase 5: Database Setup

### Step 13: Database Initialization Script

Create `scripts/setup-dev-db.js`:
```javascript
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

async function setupDatabase() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db('tributestream_dev');
    
    console.log('🚀 Setting up development database...');
    
    // Create indexes
    await db.collection('users').createIndex({ auth0Id: 1 }, { unique: true });
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('memorials').createIndex({ customUrl: 1 }, { unique: true });
    await db.collection('memorials').createIndex({ creatorId: 1 });
    await db.collection('photos').createIndex({ memorialId: 1, order: 1 });
    
    console.log('✅ Database indexes created');
    console.log('🎉 Database setup complete!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
  } finally {
    await client.close();
  }
}

setupDatabase();
```

### Step 14: Package.json Scripts

Update `package.json` scripts:
```json
{
  "scripts": {
    "dev": "vite dev",
    "build": "vite build",
    "preview": "vite preview",
    "check": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json",
    "check:watch": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json --watch",
    "lint": "prettier --plugin-search-dir . --check . && eslint .",
    "format": "prettier --plugin-search-dir . --write .",
    "db:setup": "node scripts/setup-dev-db.js"
  }
}
```

---

## Phase 6: Development Workflow

### Step 15: Start Development

```bash
# Install dependencies
npm install

# Set up database
npm run db:setup

# Start development server
npm run dev
```

### Step 16: Git Setup

```bash
git init
echo "node_modules/
.env
.DS_Store
dist/
.svelte-kit/" > .gitignore

git add .
git commit -m "Initial TributeStream MongoDB version setup"
```

---

## Phase 7: Next Steps

### Immediate Development Tasks:
1. **Memorial Creation Flow** - Build create-memorial page with form validation
2. **Photo Upload System** - Implement S3 integration with drag-and-drop
3. **Memorial Display** - Create memorial view pages with photo galleries
4. **User Dashboard** - Build user management interface
5. **Admin Panel** - Create admin approval system for funeral directors

### Advanced Features:
1. **Slideshow Viewer** - Implement fullscreen photo slideshow with controls
2. **Family Member Management** - Add invitation and permission system
3. **Livestream Integration** - Add Cloudflare Stream for funeral services
4. **Payment Processing** - Integrate Stripe for premium features
5. **Email Notifications** - Set up SendGrid for user communications

---

## Architecture Benefits

✅ **Modern Stack** - SvelteKit + TypeScript + Tailwind  
✅ **Scalable Database** - MongoDB with proper indexing  
✅ **Secure Authentication** - Auth0 with role-based access  
✅ **Cloud Storage** - AWS S3 for reliable photo storage  
✅ **Developer Experience** - Hot reload, TypeScript, ESLint  
✅ **Production Ready** - Environment variables, error handling  

This foundation provides everything needed to build a robust, scalable memorial platform from scratch!
