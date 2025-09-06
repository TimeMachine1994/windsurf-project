import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import Stripe from 'stripe';
import { STRIPE_SECRET_KEY } from '$env/static/private';

const stripe = new Stripe(STRIPE_SECRET_KEY, {
	apiVersion: '2024-06-20'
});

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { bookingItems, totalPrice, customerInfo } = await request.json();

		// Create payment intent
		const paymentIntent = await stripe.paymentIntents.create({
			amount: Math.round(totalPrice * 100), // Convert to cents
			currency: 'usd',
			metadata: {
				service: 'TributeStream Booking',
				items: JSON.stringify(bookingItems),
				customer_email: customerInfo?.email || '',
				customer_name: customerInfo?.name || ''
			}
		});

		return json({
			clientSecret: paymentIntent.client_secret,
			paymentIntentId: paymentIntent.id
		});
	} catch (error) {
		console.error('Error creating payment intent:', error);
		return json(
			{ error: 'Failed to create payment intent' },
			{ status: 500 }
		);
	}
};
