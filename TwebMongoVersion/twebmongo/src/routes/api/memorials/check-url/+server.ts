import type { RequestHandler } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';

export const GET: RequestHandler = async ({ url }) => {
  try {
    const customUrl = url.searchParams.get('url');
    
    if (!customUrl) {
      return new Response(JSON.stringify({ available: false, message: 'URL parameter required' }), {
        status: 400,
        headers: { 'content-type': 'application/json' }
      });
    }

    const db = await getDb();
    const existingMemorial = await db.collection('memorials').findOne({ customUrl });
    
    return new Response(JSON.stringify({ 
      available: !existingMemorial 
    }), {
      headers: { 'content-type': 'application/json' }
    });

  } catch (error) {
    console.error('URL check error:', error);
    return new Response(JSON.stringify({ available: false, message: 'Server error' }), {
      status: 500,
      headers: { 'content-type': 'application/json' }
    });
  }
};
