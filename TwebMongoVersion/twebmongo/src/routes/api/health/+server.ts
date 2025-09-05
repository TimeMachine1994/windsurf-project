import type { RequestHandler } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';

export const GET: RequestHandler = async () => {
  try {
    const db = await getDb();
    await db.admin().ping();
    return new Response(JSON.stringify({ status: 'ok', database: 'connected' }), {
      headers: { 'content-type': 'application/json' }
    });
  } catch (e) {
    console.error('Database health check failed:', e);
    return new Response(JSON.stringify({ status: 'error', database: 'disconnected' }), {
      status: 500,
      headers: { 'content-type': 'application/json' }
    });
  }
};
