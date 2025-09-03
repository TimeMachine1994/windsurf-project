import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import Stripe from 'stripe';
import { STRIPE_SECRET_KEY } from '$env/static/private';

// Initialize Stripe with environment variable
if (!STRIPE_SECRET_KEY) {
	throw new Error('STRIPE_SECRET_KEY environment variable is required');
}
const stripe = new Stripe(STRIPE_SECRET_KEY);

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { amount, currency = 'usd', memorialId, customerInfo } = await request.json();

		// Validate required fields
		if (!amount || amount <= 0) {
			return json({ error: 'Invalid amount' }, { status: 400 });
		}

		if (!memorialId) {
			return json({ error: 'Memorial ID is required' }, { status: 400 });
		}

		// Create Payment Intent
		const paymentIntent = await stripe.paymentIntents.create({
			amount: Math.round(amount * 100), // Convert to cents
			currency,
			metadata: {
				memorialId,
				customerName: customerInfo?.name || '',
				customerEmail: customerInfo?.email || ''
			},
			automatic_payment_methods: {
				enabled: true
			}
		});

		return json({
			clientSecret: paymentIntent.client_secret,
			paymentIntentId: paymentIntent.id
		});

	} catch (error: any) {
		console.error('Error creating payment intent:', error);
		return json(
			{ error: error.message || 'Failed to create payment intent' },
			{ status: 500 }
		);
	}
};
