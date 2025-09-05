import { json } from '@sveltejs/kit';
import { getDb } from '$lib/server/db.js';
import { photoStorage } from '$lib/server/storage.js';
import type { RequestHandler } from './$types';

// TODO: Add proper Auth0 token validation
async function getUserFromRequest(request: Request): Promise<string | null> {
  // For now, return a mock user ID - this should be replaced with proper Auth0 token validation
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return null;
  
  // Mock implementation - replace with actual Auth0 token verification
  return 'mock-user-id';
}

export const DELETE: RequestHandler = async ({ params, request }) => {
  try {
    const slug = params.slug;
    const userId = await getUserFromRequest(request);
    
    if (!userId) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!slug) {
      return json({ error: 'Memorial slug required' }, { status: 400 });
    }

    const db = await getDb();
    
    // Find the memorial and verify ownership
    const memorial = await db.collection('memorials').findOne({ slug });
    
    if (!memorial) {
      return json({ error: 'Memorial not found' }, { status: 404 });
    }

    if (memorial.creatorId !== userId) {
      return json({ error: 'You can only delete your own memorials' }, { status: 403 });
    }

    // Delete all photos associated with this memorial
    const photos = await photoStorage.getPhotosByMemorial(memorial._id.toString());
    for (const photo of photos) {
      await photoStorage.deletePhoto(photo.id);
    }

    // Delete the memorial document
    const deleteResult = await db.collection('memorials').deleteOne({ _id: memorial._id });
    
    if (deleteResult.deletedCount === 0) {
      return json({ error: 'Failed to delete memorial' }, { status: 500 });
    }

    return json({ 
      success: true, 
      message: 'Memorial and all associated photos deleted successfully' 
    });

  } catch (error) {
    console.error('Memorial deletion error:', error);
    return json({ error: 'Failed to delete memorial' }, { status: 500 });
  }
};
