import { json } from '@sveltejs/kit';
import { photoStorage } from '$lib/server/storage.js';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
  try {
    const photoId = params.id;
    
    if (!photoId) {
      return json({ error: 'Photo ID required' }, { status: 400 });
    }

    const photo = await photoStorage.getPhoto(photoId);
    
    if (!photo) {
      return json({ error: 'Photo not found' }, { status: 404 });
    }

    const { stream, metadata } = photo;
    
    // Convert stream to buffer for response
    const chunks: Buffer[] = [];
    
    return new Promise((resolve) => {
      stream.on('data', (chunk: Buffer) => {
        chunks.push(chunk);
      });
      
      stream.on('end', () => {
        const buffer = Buffer.concat(chunks);
        resolve(new Response(buffer, {
          headers: {
            'Content-Type': metadata.metadata?.contentType || 'image/jpeg',
            'Content-Length': buffer.length.toString(),
            'Cache-Control': 'public, max-age=31536000' // Cache for 1 year
          }
        }));
      });
      
      stream.on('error', () => {
        resolve(json({ error: 'Failed to retrieve photo' }, { status: 500 }));
      });
    });

  } catch (error) {
    console.error('Photo retrieval error:', error);
    return json({ error: 'Failed to retrieve photo' }, { status: 500 });
  }
};

export const DELETE: RequestHandler = async ({ params, request }) => {
  try {
    const photoId = params.id;
    
    if (!photoId) {
      return json({ error: 'Photo ID required' }, { status: 400 });
    }

    // TODO: Add authentication check here
    // const userId = await getUserFromRequest(request);
    
    const success = await photoStorage.deletePhoto(photoId);
    
    if (!success) {
      return json({ error: 'Failed to delete photo' }, { status: 500 });
    }

    return json({ success: true, message: 'Photo deleted successfully' });

  } catch (error) {
    console.error('Photo deletion error:', error);
    return json({ error: 'Failed to delete photo' }, { status: 500 });
  }
};
