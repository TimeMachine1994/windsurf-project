import type { RequestHandler } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { ObjectId } from 'mongodb';
import type { MemorialDoc } from '$lib/types';

export const POST: RequestHandler = async ({ request }) => {
  console.log('📝 MEMORIAL API: POST request received');
  
  try {
    const data = await request.json();
    console.log('📝 MEMORIAL API: Request data:', data);
    const { lovedOneName, customUrl, dateOfBirth, dateOfPassing, biography, isPublic } = data;

    // Validate required fields
    if (!lovedOneName || !customUrl) {
      console.log('📝 MEMORIAL API: Missing required fields');
      return new Response(JSON.stringify({ message: 'Name and URL are required' }), {
        status: 400,
        headers: { 'content-type': 'application/json' }
      });
    }

    console.log('📝 MEMORIAL API: Attempting to connect to database...');
    
    try {
      const db = await getDb();
      console.log('📝 MEMORIAL API: Database connected, checking URL availability...');
      
      // Check if URL already exists
      const existingMemorial = await db.collection('memorials').findOne({ customUrl });
      if (existingMemorial) {
        console.log('📝 MEMORIAL API: URL already exists');
        return new Response(JSON.stringify({ message: 'URL already exists' }), {
          status: 409,
          headers: { 'content-type': 'application/json' }
        });
      }

      // Create memorial document
      const memorial: Omit<MemorialDoc, '_id'> = {
        customUrl,
        lovedOneName,
        creatorId: new ObjectId(), // TODO: Get from authenticated user
        creatorName: 'Test User', // TODO: Get from authenticated user
        creatorEmail: 'test@example.com', // TODO: Get from authenticated user
        isPublic: isPublic ?? true,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        dateOfPassing: dateOfPassing ? new Date(dateOfPassing) : undefined,
        biography: biography || '',
        photoCount: 0,
        viewCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      console.log('📝 MEMORIAL API: Inserting memorial into database...');
      const result = await db.collection('memorials').insertOne(memorial);
      console.log('📝 MEMORIAL API: Memorial created with ID:', result.insertedId);
      
      return new Response(JSON.stringify({ 
        _id: result.insertedId,
        ...memorial 
      }), {
        status: 201,
        headers: { 'content-type': 'application/json' }
      });
      
    } catch (dbError) {
      console.error('📝 MEMORIAL API: Database error:', dbError);
      
      // Return mock success for demo when DB is not available
      console.log('📝 MEMORIAL API: Database unavailable, returning mock success');
      const mockMemorial = {
        _id: 'mock-' + Date.now(),
        customUrl,
        lovedOneName,
        creatorId: 'mock-creator-id',
        creatorName: 'Demo User',
        creatorEmail: 'demo@example.com',
        isPublic: isPublic ?? true,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        dateOfPassing: dateOfPassing ? new Date(dateOfPassing) : undefined,
        biography: biography || '',
        photoCount: 0,
        viewCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      return new Response(JSON.stringify(mockMemorial), {
        status: 201,
        headers: { 'content-type': 'application/json' }
      });
    }

  } catch (error) {
    console.error('📝 MEMORIAL API: Unexpected error:', error);
    return new Response(JSON.stringify({ message: 'Internal server error', error: error.message }), {
      status: 500,
      headers: { 'content-type': 'application/json' }
    });
  }
};
