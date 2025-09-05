import { json } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import bcrypt from 'bcryptjs';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const { 
			email, 
			password, 
			displayName, 
			phone, 
			role,
			funeralHomeName,
			funeralHomeAddress,
			funeralHomeEmail,
			funeralHomePhone,
			personalPhone
		} = body;

		// Validation
		if (!email || !password || !displayName || !role) {
			return json({ error: 'Missing required fields' }, { status: 400 });
		}

		if (!['Viewer', 'FuneralDirector'].includes(role)) {
			return json({ error: 'Invalid role' }, { status: 400 });
		}

		// Additional validation for funeral directors
		if (role === 'FuneralDirector') {
			if (!funeralHomeName || !funeralHomeAddress || !funeralHomeEmail || !funeralHomePhone || !personalPhone) {
				return json({ error: 'Missing funeral director required fields' }, { status: 400 });
			}
		}

		const db = await getDb();
		
		// Check if user already exists
		const existingUser = await db.collection('users').findOne({ email });
		if (existingUser) {
			return json({ error: 'An account with this email already exists' }, { status: 409 });
		}

		// Hash password
		const hashedPassword = await bcrypt.hash(password, 12);

		// Create user document
		const userDoc = {
			email,
			password: hashedPassword,
			name: displayName,
			displayName,
			phone: phone || null,
			role,
			approved: role === 'FuneralDirector' ? false : true, // Funeral directors need approval
			emailVerified: false,
			createdAt: new Date(),
			updatedAt: new Date(),
			// Funeral director specific fields
			...(role === 'FuneralDirector' && {
				funeralHomeName,
				funeralHomeAddress,
				funeralHomeEmail,
				funeralHomePhone,
				personalPhone
			})
		};

		const result = await db.collection('users').insertOne(userDoc);

		// Return success (don't include password in response)
		const { password: _, ...userResponse } = userDoc;
		
		return json({ 
			success: true, 
			user: { 
				...userResponse, 
				_id: result.insertedId 
			},
			message: role === 'FuneralDirector' 
				? 'Funeral director account created successfully. Pending admin approval.'
				: 'Account created successfully!'
		});

	} catch (error) {
		console.error('Registration error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
