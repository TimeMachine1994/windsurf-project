import { json } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import bcrypt from 'bcryptjs';
import type { RequestHandler } from './$types';

function generateMemorialSlug(name: string): string {
	const slug = name
		.toLowerCase()
		.replace(/[^a-z0-9]/g, '-')
		.replace(/-+/g, '-')
		.replace(/^-|-$/g, '');
	return `celebration-of-life-for-${slug}`;
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
			biography,
			serviceDate,
			serviceStartTime,
			serviceEndTime,
			serviceDays,
			funeralDirectorId
		} = body;

		// Validation
		if (!lovedOneName || !creatorName || !creatorPhone || !creatorEmail || !funeralDirectorId) {
			return json({ error: 'Missing required fields' }, { status: 400 });
		}

		const db = await getDb();
		
		// Verify funeral director exists and is approved
		const funeralDirector = await db.collection('users').findOne({ 
			_id: funeralDirectorId,
			role: 'FuneralDirector',
			approved: true
		});

		if (!funeralDirector) {
			return json({ error: 'Invalid or unapproved funeral director' }, { status: 403 });
		}

		// Check if family user already exists
		const existingUser = await db.collection('users').findOne({ email: creatorEmail });
		if (existingUser) {
			return json({ error: 'An account with this email already exists' }, { status: 409 });
		}

		// Generate custom URL
		let baseSlug = generateMemorialSlug(lovedOneName);
		let customUrl = baseSlug;
		let urlCounter = 1;
		
		// Check if URL already exists and modify if needed
		while (await db.collection('memorials').findOne({ customUrl })) {
			const nameSlug = lovedOneName
				.toLowerCase()
				.replace(/[^a-z0-9]/g, '-')
				.replace(/-+/g, '-')
				.replace(/^-|-$/g, '');
			customUrl = `celebration-of-life-for-${nameSlug}-${urlCounter}`;
			urlCounter++;
		}

		// Generate password for family owner account
		const generatedPassword = generatePassword();
		const hashedPassword = await bcrypt.hash(generatedPassword, 12);

		// Create family owner user account
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
			updatedAt: new Date(),
			// Link to funeral director who created this
			createdByFuneralDirector: funeralDirectorId,
			funeralHomeName: funeralDirector.funeralHomeName
		};

		const userResult = await db.collection('users').insertOne(userDoc);

		// Create memorial with enhanced funeral director fields
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
			updatedAt: new Date(),
			// Funeral director specific fields
			funeralDirectorId,
			funeralHomeName: funeralDirector.funeralHomeName,
			funeralDirectorName: funeralDirector.displayName || funeralDirector.name,
			// Service information
			serviceDate: serviceDate ? new Date(serviceDate) : null,
			serviceStartTime: serviceStartTime || null,
			serviceEndTime: serviceEndTime || null,
			serviceDays: serviceDays || 1,
			// Professional service flag
			isProfessionalService: true
		};

		const memorialResult = await db.collection('memorials').insertOne(memorialDoc);

		// Send welcome email with credentials to family
		try {
			const emailResponse = await fetch('/api/email/send-credentials', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					email: creatorEmail,
					name: creatorName,
					password: generatedPassword,
					memorialUrl: customUrl,
					lovedOneName,
					funeralHomeName: funeralDirector.funeralHomeName,
					funeralDirectorName: funeralDirector.displayName || funeralDirector.name
				})
			});

			if (!emailResponse.ok) {
				console.warn('Failed to send credentials email:', await emailResponse.text());
			}
		} catch (emailError) {
			console.warn('Email sending failed:', emailError);
			// Don't fail the memorial creation if email fails
		}

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
			},
			funeralDirector: {
				name: funeralDirector.displayName || funeralDirector.name,
				funeralHomeName: funeralDirector.funeralHomeName
			}
		});

	} catch (error) {
		console.error('Funeral director memorial creation error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
