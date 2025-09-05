import { json } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import bcrypt from 'bcryptjs';
import type { RequestHandler } from './$types';

function generateMemorialSlug(name: string): string {
	return name
		.toLowerCase()
		.replace(/[^a-z0-9]/g, '-')
		.replace(/-+/g, '-')
		.replace(/^-|-$/g, '');
}

function generatePassword(): string {
	const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
	let password = '';
	for (let i = 0; i < 12; i++) {
		password += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return password;
}

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const { 
			lovedOneName,
			creatorName,
			creatorPhone,
			creatorEmail,
			dateOfBirth,
			dateOfPassing,
			biography
		} = body;

		// Validation
		if (!lovedOneName || !creatorName || !creatorPhone || !creatorEmail) {
			return json({ error: 'Missing required fields' }, { status: 400 });
		}

		const db = await getDb();
		
		// Check if user already exists
		const existingUser = await db.collection('users').findOne({ email: creatorEmail });
		if (existingUser) {
			return json({ error: 'An account with this email already exists' }, { status: 409 });
		}

		// Generate custom URL
		let customUrl = generateMemorialSlug(lovedOneName);
		let urlCounter = 1;
		
		// Check if URL already exists and modify if needed
		while (await db.collection('memorials').findOne({ customUrl })) {
			customUrl = `${generateMemorialSlug(lovedOneName)}-${urlCounter}`;
			urlCounter++;
		}

		// Generate password for owner account
		const generatedPassword = generatePassword();
		const hashedPassword = await bcrypt.hash(generatedPassword, 12);

		// Create owner user account
		const userDoc = {
			email: creatorEmail,
			password: hashedPassword,
			name: creatorName,
			displayName: creatorName,
			phone: creatorPhone,
			role: 'Owner' as const,
			approved: true,
			emailVerified: false,
			createdAt: new Date(),
			updatedAt: new Date()
		};

		const userResult = await db.collection('users').insertOne(userDoc);

		// Create memorial
		const memorialDoc = {
			customUrl,
			lovedOneName,
			creatorId: userResult.insertedId,
			creatorName,
			creatorEmail,
			isPublic: true,
			dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
			dateOfPassing: dateOfPassing ? new Date(dateOfPassing) : null,
			biography: biography || null,
			photoCount: 0,
			viewCount: 0,
			createdAt: new Date(),
			updatedAt: new Date()
		};

		const memorialResult = await db.collection('memorials').insertOne(memorialDoc);

		return json({ 
			success: true,
			customUrl,
			generatedPassword,
			memorial: {
				...memorialDoc,
				_id: memorialResult.insertedId
			},
			user: {
				...userDoc,
				_id: userResult.insertedId,
				password: undefined // Don't return password in response
			}
		});

	} catch (error) {
		console.error('Memorial creation error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
