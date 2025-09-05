import type { RequestHandler } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';

export const GET: RequestHandler = async ({ params }) => {
  console.log('🏛️ MEMORIAL API: GET request received for slug:', params.slug);
  
  try {
    const { slug } = params;
    
    if (!slug) {
      console.log('🏛️ MEMORIAL API: No slug provided');
      return new Response(JSON.stringify({ message: 'Memorial slug required' }), {
        status: 400,
        headers: { 'content-type': 'application/json' }
      });
    }

    console.log('🏛️ MEMORIAL API: Attempting to connect to database...');
    
    try {
      const db = await getDb();
      console.log('🏛️ MEMORIAL API: Database connected, searching for memorial...');
      
      const memorial = await db.collection('memorials').findOne({ customUrl: slug });
      console.log('🏛️ MEMORIAL API: Memorial query result:', memorial ? 'found' : 'not found');
      
      if (!memorial) {
        console.log('🏛️ MEMORIAL API: Memorial not found in database');
        return new Response(JSON.stringify({ message: 'Memorial not found' }), {
          status: 404,
          headers: { 'content-type': 'application/json' }
        });
      }

      // Increment view count
      await db.collection('memorials').updateOne(
        { _id: memorial._id },
        { $inc: { viewCount: 1 } }
      );

      console.log('🏛️ MEMORIAL API: Returning memorial data');
      return new Response(JSON.stringify(memorial), {
        headers: { 'content-type': 'application/json' }
      });
      
    } catch (dbError) {
      console.error('🏛️ MEMORIAL API: Database connection failed:', dbError);
      
      // Return a mock memorial for demo purposes when DB is not available
      console.log('🏛️ MEMORIAL API: Returning mock memorial data');
      const mockMemorial = {
        _id: 'mock-id',
        lovedOneName: 'Demo Memorial',
        slug: slug,
        customUrl: slug,
        biography: 'This is a demo memorial page. The database is not connected, so this is mock data.',
        dateOfBirth: '1950-01-01',
        dateOfPassing: '2023-12-31',
        creatorName: 'Demo User',
        creatorId: 'demo-user-id',
        createdAt: new Date(),
        viewCount: 1,
        isPublic: true
      };
      
      return new Response(JSON.stringify(mockMemorial), {
        headers: { 'content-type': 'application/json' }
      });
    }

  } catch (error) {
    console.error('🏛️ MEMORIAL API: Unexpected error:', error);
    return new Response(JSON.stringify({ message: 'Internal server error', error: error.message }), {
      status: 500,
      headers: { 'content-type': 'application/json' }
    });
  }
};
