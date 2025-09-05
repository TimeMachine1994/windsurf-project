import { json } from '@sveltejs/kit';
import { getDb } from '$lib/server/db.js';
import type { RequestHandler } from './$types';

interface UserProfile {
  userId: string;
  email: string;
  name: string;
  picture?: string;
  createdAt: Date;
  updatedAt: Date;
  memorialCount?: number;
  photoCount?: number;
}

// TODO: Add proper Auth0 token validation
async function getUserFromRequest(request: Request): Promise<string | null> {
  // For now, return a mock user ID - this should be replaced with proper Auth0 token validation
  const authHeader = request.headers.get('authorization');
  console.log('👤 PROFILE API: Auth header:', authHeader ? 'present' : 'missing');
  
  // Mock implementation - replace with actual Auth0 token verification
  // For demo purposes, always return a mock user ID
  return 'mock-user-id';
}

export const GET: RequestHandler = async ({ request }) => {
  console.log('👤 PROFILE API: GET request received');
  
  try {
    const userId = await getUserFromRequest(request);
    console.log('👤 PROFILE API: User ID:', userId);
    
    if (!userId) {
      console.log('👤 PROFILE API: No user ID, returning unauthorized');
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('👤 PROFILE API: Attempting to connect to database...');
    
    try {
      const db = await getDb();
      console.log('👤 PROFILE API: Database connected, querying user profile...');
      
      // Get user profile
      let userProfile = await db.collection('users').findOne({ userId });
      console.log('👤 PROFILE API: User profile found:', userProfile ? 'yes' : 'no');
      
      if (!userProfile) {
        console.log('👤 PROFILE API: Creating new user profile...');
        // Create profile if it doesn't exist (first time user)
        const newProfile = {
          userId,
          email: 'test@example.com', // This should come from Auth0 token
          name: 'Test User', // This should come from Auth0 token
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        await db.collection('users').insertOne(newProfile);
        userProfile = newProfile;
      }

      // Get memorial count
      const memorialCount = await db.collection('memorials').countDocuments({ creatorId: userId });
      console.log('👤 PROFILE API: Memorial count:', memorialCount);
      
      // Get photo count
      const photoCount = await db.collection('photos.files').countDocuments({ 'metadata.uploadedBy': userId });
      console.log('👤 PROFILE API: Photo count:', photoCount);

      const profile: UserProfile = {
        userId: userProfile.userId,
        email: userProfile.email,
        name: userProfile.name,
        picture: userProfile.picture,
        createdAt: userProfile.createdAt,
        updatedAt: userProfile.updatedAt,
        memorialCount,
        photoCount
      };

      console.log('👤 PROFILE API: Returning profile data');
      return json(profile);
      
    } catch (dbError) {
      console.error('👤 PROFILE API: Database error:', dbError);
      
      // Return mock profile for demo when DB is not available
      console.log('👤 PROFILE API: Database unavailable, returning mock profile');
      const mockProfile: UserProfile = {
        userId: 'mock-user-id',
        email: 'test@example.com',
        name: 'Test User',
        picture: undefined,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        memorialCount: 2,
        photoCount: 5
      };
      
      return json(mockProfile);
    }

  } catch (error) {
    console.error('👤 PROFILE API: Unexpected error:', error);
    return json({ error: 'Failed to retrieve profile', details: error.message }, { status: 500 });
  }
};

export const PUT: RequestHandler = async ({ request }) => {
  try {
    const userId = await getUserFromRequest(request);
    if (!userId) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, email } = await request.json();
    
    if (!name || !email) {
      return json({ error: 'Name and email are required' }, { status: 400 });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return json({ error: 'Invalid email format' }, { status: 400 });
    }

    const db = await getDb();
    
    const updateResult = await db.collection('users').updateOne(
      { userId },
      {
        $set: {
          name,
          email,
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );

    if (updateResult.matchedCount === 0 && updateResult.upsertedCount === 0) {
      return json({ error: 'Failed to update profile' }, { status: 500 });
    }

    return json({ 
      success: true, 
      message: 'Profile updated successfully' 
    });

  } catch (error) {
    console.error('Profile update error:', error);
    return json({ error: 'Failed to update profile' }, { status: 500 });
  }
};
