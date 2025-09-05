import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
  try {
    const query = url.searchParams.get('q');
    
    if (!query || query.trim().length === 0) {
      return json({ error: 'Search query is required' }, { status: 400 });
    }

    const searchTerm = query.trim();
    
    // For now, return empty results since we don't have memorials in DB yet
    const memorials: any[] = [];

    return json({ 
      success: true, 
      memorials,
      count: memorials.length,
      query: searchTerm
    });

  } catch (error) {
    console.error('Search error:', error);
    return json({ error: 'Search failed' }, { status: 500 });
  }
};
