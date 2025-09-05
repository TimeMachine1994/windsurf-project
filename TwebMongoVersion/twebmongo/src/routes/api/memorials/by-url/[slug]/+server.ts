import { json } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
	try {
		const { slug } = params;
		
		if (!slug) {
			return json({ error: 'Memorial URL is required' }, { status: 400 });
		}

		const db = await getDb();
		
		// Find memorial by custom URL
		const memorial = await db.collection('memorials').findOne({ 
			customUrl: decodeURIComponent(slug) 
		});

		if (!memorial) {
			return json({ error: 'Memorial not found' }, { status: 404 });
		}

		// Increment view count
		await db.collection('memorials').updateOne(
			{ _id: memorial._id },
			{ 
				$inc: { viewCount: 1 },
				$set: { updatedAt: new Date() }
			}
		);

		// Return memorial data (increment viewCount in response)
		return json({
			...memorial,
			viewCount: memorial.viewCount + 1
		});

	} catch (error) {
		console.error('Error fetching memorial:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
