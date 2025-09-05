import { json } from '@sveltejs/kit';
import { photoStorage } from '$lib/server/storage.js';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const formData = await request.formData();
    const file = formData.get('photo') as File;
    const memorialId = formData.get('memorialId') as string;
    const uploadedBy = formData.get('uploadedBy') as string;

    if (!file || !memorialId || !uploadedBy) {
      return json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return json({ error: 'Only image files are allowed' }, { status: 400 });
    }

    // Validate file size (max 10MB before compression)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return json({ error: 'File size too large. Maximum 10MB allowed.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    const metadata = {
      memorialId,
      originalName: file.name,
      contentType: file.type,
      size: file.size,
      uploadedBy,
      uploadedAt: new Date()
    };

    const photoId = await photoStorage.uploadPhoto(buffer, file.name, metadata);

    return json({ 
      success: true, 
      photoId,
      message: 'Photo uploaded successfully'
    });

  } catch (error) {
    console.error('Photo upload error:', error);
    return json({ error: 'Failed to upload photo' }, { status: 500 });
  }
};
