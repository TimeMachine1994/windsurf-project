import { json } from '@sveltejs/kit';
import { photoStorage } from '$lib/server/storage.js';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
  try {
    const memorialId = params.memorialId;
    
    if (!memorialId) {
      return json({ error: 'Memorial ID required' }, { status: 400 });
    }

    const photos = await photoStorage.getPhotosByMemorial(memorialId);
    
    return json({ 
      success: true, 
      photos 
    });

  } catch (error) {
    console.error('Error getting memorial photos:', error);
    return json({ error: 'Failed to retrieve photos' }, { status: 500 });
  }
};

export const PUT: RequestHandler = async ({ params, request }) => {
  try {
    const memorialId = params.memorialId;
    const { photoOrders } = await request.json();
    
    if (!memorialId || !photoOrders) {
      return json({ error: 'Memorial ID and photo orders required' }, { status: 400 });
    }

    // TODO: Add authentication check here
    // const userId = await getUserFromRequest(request);
    
    const success = await photoStorage.updatePhotoOrder(memorialId, photoOrders);
    
    if (!success) {
      return json({ error: 'Failed to update photo order' }, { status: 500 });
    }

    return json({ 
      success: true, 
      message: 'Photo order updated successfully' 
    });

  } catch (error) {
    console.error('Error updating photo order:', error);
    return json({ error: 'Failed to update photo order' }, { status: 500 });
  }
};
