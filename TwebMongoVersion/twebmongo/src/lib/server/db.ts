import { MongoClient, type Db } from 'mongodb';
import { MONGODB_URI } from '$env/static/private';

let client: MongoClient | null = null;
let db: Db | null = null;

export async function getDb(): Promise<Db> {
	if (db) return db;

	console.log('MONGODB_URI exists:', !!MONGODB_URI);
	console.log('MONGODB_URI length:', MONGODB_URI?.length || 0);

	if (!MONGODB_URI) {
		throw new Error('MONGODB_URI is not set in environment variables');
	}

	try {
		client = new MongoClient(MONGODB_URI);
		await client.connect();
		console.log('MongoDB connected successfully');
		db = client.db('tributestream_dev');
		return db;
	} catch (error) {
		console.error('MongoDB connection failed:', error);
		throw error;
	}
}

export async function ping(): Promise<boolean> {
	const database = await getDb();
	await database.admin().ping();
	return true;
}
