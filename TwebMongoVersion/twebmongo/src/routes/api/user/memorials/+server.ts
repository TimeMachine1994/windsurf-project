import { json } from '@sveltejs/kit';
import { getDb } from '$lib/server/db.js';
import type { RequestHandler } from './$types';

// TODO: Add proper Auth0 token validation
async function getUserFromRequest(request: Request): Promise<string | null> {
  // For now, return a mock user ID - this should be replaced with proper Auth0 token validation
  const authHeader = request.headers.get('authorization');
  console.log('📋 USER MEMORIALS API: Auth header:', authHeader ? 'present' : 'missing');
  
  // Mock implementation - replace with actual Auth0 token verification
  // For demo purposes, always return a mock user ID
  return 'mock-user-id';
}

export const GET: RequestHandler = async ({ request }) => {
  console.log('📋 USER MEMORIALS API: GET request received');
  
  try {
    const userId = await getUserFromRequest(request);
    console.log('📋 USER MEMORIALS API: User ID:', userId);
    
    if (!userId) {
      console.log('📋 USER MEMORIALS API: No user ID, returning unauthorized');
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('📋 USER MEMORIALS API: Attempting to connect to database...');
    
    try {
      const db = await getDb();
      console.log('📋 USER MEMORIALS API: Database connected, querying memorials...');
      
      // Get all memorials created by this user
      const memorials = await db.collection('memorials')
        .find({ creatorId: userId })
        .sort({ createdAt: -1 })
        .toArray();

      console.log('📋 USER MEMORIALS API: Found', memorials.length, 'memorials');

      return json({ 
        success: true, 
        memorials 
      });
      
    } catch (dbError) {
      console.error('📋 USER MEMORIALS API: Database error:', dbError);
      
      // Return mock memorials for demo when DB is not available
      console.log('📋 USER MEMORIALS API: Database unavailable, returning mock memorials');
      const mockMemorials = [
        {
          _id: 'mock-memorial-1',
          lovedOneName: 'Demo Memorial 1',
          slug: 'demo-memorial-1',
          customUrl: 'demo-memorial-1',
          biography: 'This is a demo memorial created for testing purposes.',
          dateOfBirth: '1950-01-01',
          dateOfPassing: '2023-12-31',
          creatorName: 'Demo User',
          creatorId: 'mock-user-id',
          createdAt: new Date('2024-01-01'),
          viewCount: 15,
          isPublic: true
        },
        {
          _id: 'mock-memorial-2',
          lovedOneName: 'Demo Memorial 2',
          slug: 'demo-memorial-2',
          customUrl: 'demo-memorial-2',
          biography: 'Another demo memorial for testing the my memorials page.',
          dateOfBirth: '1945-06-15',
          dateOfPassing: '2023-11-20',
          creatorName: 'Demo User',
          creatorId: 'mock-user-id',
          createdAt: new Date('2024-01-15'),
          viewCount: 8,
          isPublic: false
        }
      ];
      
      return json({ 
        success: true, 
        memorials: mockMemorials 
      });
    }

  } catch (error) {
    console.error('📋 USER MEMORIALS API: Unexpected error:', error);
    return json({ error: 'Failed to retrieve memorials', details: error.message }, { status: 500 });
  }
};
