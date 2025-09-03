<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { loadStripe, type Stripe, type StripeElements, type StripeCardElement } from '@stripe/stripe-js';

	const dispatch = createEventDispatcher();

	export let amount: number;
	export let customerName: string = '';
	export let customerEmail: string = '';

	// Stripe variables
	let stripe: Stripe | null = null;
	let elements: StripeElements | null = null;
	let cardElement: StripeCardElement | null = null;
	let cardElementContainer: HTMLDivElement;

	// Get Stripe publishable key from environment
	import { PUBLIC_STRIPE_PUBLISHABLE_KEY } from '$env/static/public';
	const STRIPE_PUBLISHABLE_KEY = PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_TLlEzJE4mqLHyKOzQTfmSxjF';

	let formData = {
		// Billing Information
		firstName: customerName.split(' ')[0] || '',
		lastName: customerName.split(' ').slice(1).join(' ') || '',
		email: customerEmail,
		phone: '',
		
		// Billing Address
		address: '',
		city: '',
		state: '',
		zipCode: '',
		country: 'US',
		
		// Payment Information (Stripe will handle card data)
		cardholderName: customerName
	};

	let isLoading = false;
	let errors: Record<string, string> = {};

	function validateForm() {
		errors = {};
		
		// Required field validation
		if (!formData.firstName.trim()) errors.firstName = 'First name is required';
		if (!formData.lastName.trim()) errors.lastName = 'Last name is required';
		if (!formData.email.trim()) errors.email = 'Email is required';
		if (!formData.address.trim()) errors.address = 'Address is required';
		if (!formData.city.trim()) errors.city = 'City is required';
		if (!formData.state.trim()) errors.state = 'State is required';
		if (!formData.zipCode.trim()) errors.zipCode = 'ZIP code is required';
		
		// Payment validation
		if (!formData.cardholderName.trim()) errors.cardholderName = 'Cardholder name is required';
		
		// Email format validation
		if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
			errors.email = 'Please enter a valid email address';
		}
		
		return Object.keys(errors).length === 0;
	}

	// Initialize Stripe
	onMount(async () => {
		try {
			stripe = await loadStripe(STRIPE_PUBLISHABLE_KEY);
			if (!stripe) throw new Error('Failed to load Stripe');

			elements = stripe.elements();
			cardElement = elements.create('card', {
				style: {
					base: {
						fontSize: '16px',
						color: '#374151',
						fontFamily: 'system-ui, sans-serif',
						'::placeholder': {
							color: '#9ca3af',
						},
					},
					invalid: {
						color: '#dc2626',
					},
				},
				hidePostalCode: true
			});

			cardElement.mount(cardElementContainer);
			console.log('✅ Stripe card element mounted');
		} catch (error) {
			console.error('❌ Error initializing Stripe:', error);
		}
	});

	async function handleSubmit() {
		if (!validateForm()) {
			return;
		}

		if (!stripe || !cardElement) {
			errors.cardNumber = 'Payment system not ready. Please refresh the page.';
			return;
		}
		
		isLoading = true;
		
		try {
			// Create payment intent
			const response = await fetch('/api/create-payment-intent', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					amount: amount,
					memorialId: 'payment-form', // You can pass this as a prop if needed
					customerInfo: {
						name: `${formData.firstName} ${formData.lastName}`,
						email: formData.email
					}
				})
			});

			const { clientSecret } = await response.json();

			if (!clientSecret) {
				throw new Error('Failed to create payment intent');
			}

			// Confirm payment with Stripe
			const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
				payment_method: {
					card: cardElement,
					billing_details: {
						name: formData.cardholderName,
						email: formData.email,
						address: {
							line1: formData.address,
							city: formData.city,
							state: formData.state,
							postal_code: formData.zipCode,
							country: formData.country
						}
					}
				}
			});

			if (error) {
				console.error('Payment failed:', error);
				errors.cardNumber = error.message || 'Payment failed';
			} else if (paymentIntent && paymentIntent.status === 'succeeded') {
				console.log('Payment succeeded:', paymentIntent);
				
				// Send receipt email
				try {
					await fetch('/api/send-receipt', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({
							paymentData: formData,
							paymentIntent: paymentIntent
						})
					});
					console.log('Receipt email sent');
				} catch (emailError) {
					console.error('Failed to send receipt email:', emailError);
					// Don't fail the whole process if email fails
				}

				// Store receipt data in session storage for the receipt page
				const receiptData = {
					paymentIntent,
					paymentData: formData,
					amount: amount
				};
				sessionStorage.setItem('paymentReceipt', JSON.stringify(receiptData));

				// Redirect to receipt page
				window.location.href = '/receipt';
			}
		} catch (error) {
			console.error('Payment error:', error);
			errors.cardNumber = 'An error occurred during payment. Please try again.';
		} finally {
			isLoading = false;
		}
	}

	// Generate year options
	const currentYear = new Date().getFullYear();
	const years = Array.from({ length: 10 }, (_, i) => currentYear + i);
</script>

<div class="payment-form-container">
	<div class="payment-header">
		<h3>Payment Information</h3>
		<div class="amount-display">
			<span class="amount-label">Total:</span>
			<span class="amount-value">${amount}</span>
		</div>
	</div>

	<form on:submit|preventDefault={handleSubmit} class="payment-form">
		<!-- Billing Information -->
		<div class="form-section">
			<h4 class="section-title">Billing Information</h4>
			
			<div class="form-row">
				<div class="form-group">
					<label for="firstName">First Name *</label>
					<input
						type="text"
						id="firstName"
						bind:value={formData.firstName}
						class:error={errors.firstName}
						required
					/>
					{#if errors.firstName}
						<span class="error-text">{errors.firstName}</span>
					{/if}
				</div>
				
				<div class="form-group">
					<label for="lastName">Last Name *</label>
					<input
						type="text"
						id="lastName"
						bind:value={formData.lastName}
						class:error={errors.lastName}
						required
					/>
					{#if errors.lastName}
						<span class="error-text">{errors.lastName}</span>
					{/if}
				</div>
			</div>
			
			<div class="form-row">
				<div class="form-group">
					<label for="email">Email *</label>
					<input
						type="email"
						id="email"
						bind:value={formData.email}
						class:error={errors.email}
						required
					/>
					{#if errors.email}
						<span class="error-text">{errors.email}</span>
					{/if}
				</div>
				
				<div class="form-group">
					<label for="phone">Phone</label>
					<input
						type="tel"
						id="phone"
						bind:value={formData.phone}
					/>
				</div>
			</div>
		</div>

		<!-- Billing Address -->
		<div class="form-section">
			<h4 class="section-title">Billing Address</h4>
			
			<div class="form-group">
				<label for="address">Street Address *</label>
				<input
					type="text"
					id="address"
					bind:value={formData.address}
					class:error={errors.address}
					required
				/>
				{#if errors.address}
					<span class="error-text">{errors.address}</span>
				{/if}
			</div>
			
			<div class="form-row">
				<div class="form-group">
					<label for="city">City *</label>
					<input
						type="text"
						id="city"
						bind:value={formData.city}
						class:error={errors.city}
						required
					/>
					{#if errors.city}
						<span class="error-text">{errors.city}</span>
					{/if}
				</div>
				
				<div class="form-group">
					<label for="state">State *</label>
					<input
						type="text"
						id="state"
						bind:value={formData.state}
						class:error={errors.state}
						required
					/>
					{#if errors.state}
						<span class="error-text">{errors.state}</span>
					{/if}
				</div>
				
				<div class="form-group">
					<label for="zipCode">ZIP Code *</label>
					<input
						type="text"
						id="zipCode"
						bind:value={formData.zipCode}
						class:error={errors.zipCode}
						required
					/>
					{#if errors.zipCode}
						<span class="error-text">{errors.zipCode}</span>
					{/if}
				</div>
			</div>
		</div>

		<!-- Payment Information -->
		<div class="form-section">
			<h4 class="section-title">Payment Information</h4>
			
			<div class="form-group">
				<label for="cardholderName">Cardholder Name *</label>
				<input
					type="text"
					id="cardholderName"
					bind:value={formData.cardholderName}
					class:error={errors.cardholderName}
					required
				/>
				{#if errors.cardholderName}
					<span class="error-text">{errors.cardholderName}</span>
				{/if}
			</div>
			
			<div class="form-group">
				<label for="cardElement">Card Information *</label>
				<div bind:this={cardElementContainer} class="stripe-card-element"></div>
				{#if errors.cardNumber}
					<span class="error-text">{errors.cardNumber}</span>
				{/if}
			</div>
		</div>

		<button 
			type="submit" 
			class="pay-button"
			disabled={isLoading}
		>
			{#if isLoading}
				<span class="loading-spinner"></span>
				Processing Payment...
			{:else}
				Pay ${amount}
			{/if}
		</button>
	</form>

	<!-- Test Card Info -->
	<div class="test-info">
		<h4>Test Card Information</h4>
		<div class="test-cards">
			<div class="test-card">
				<strong>Test Card:</strong> 4242 4242 4242 4242
			</div>
			<div class="test-card">
				<strong>Any future expiry date and any 3-digit CVV</strong>
			</div>
		</div>
	</div>
</div>

<style>
	.payment-form-container {
		max-width: 600px;
		margin: 0 auto;
		padding: 1rem;
	}

	.payment-header {
		text-align: center;
		margin-bottom: 2rem;
		padding: 1.5rem;
		background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
		color: white;
		border-radius: 12px 12px 0 0;
		box-shadow: var(--shadow-md);
		transition: all 0.3s ease;
	}

	.payment-header h3 {
		margin: 0 0 1rem 0;
		font-size: 1.5rem;
		font-weight: 600;
	}

	.amount-display {
		font-size: 2rem;
		font-weight: 700;
		margin: 0;
	}

	.amount-label {
		font-size: 0.875rem;
		opacity: 0.9;
		margin-bottom: 0.5rem;
		font-weight: 500;
		color: var(--color-primary);
	}

	.payment-form {
		display: flex;
		flex-direction: column;
		gap: 2rem;
		padding: 2rem;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 0 0 12px 12px;
		box-shadow: var(--shadow-lg);
		transition: all 0.3s ease;
	}

	.section-title {
		margin: 0;
		font-size: 1.125rem;
		font-weight: 600;
		color: var(--color-text);
		border-bottom: 1px solid var(--color-border);
		padding-bottom: 0.5rem;
	}

	.form-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}

	.form-row.three-col {
		grid-template-columns: 1fr 1fr 1fr;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	label {
		display: block;
		margin-bottom: 0.5rem;
		font-weight: 500;
		color: var(--color-text);
		font-size: 0.875rem;
	}

	input, select {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid var(--color-border);
		border-radius: 6px;
		font-size: 1rem;
		transition: border-color 0.2s ease, box-shadow 0.2s ease;
		background: var(--color-background);
		color: var(--color-text);
	}

	.stripe-card-element {
		padding: 0.75rem;
		border: 1px solid var(--color-border);
		border-radius: 0.5rem;
		background: var(--color-background);
		transition: border-color 0.2s ease, box-shadow 0.2s ease;
	}

	.stripe-card-element.StripeElement--focus {
		border-color: var(--color-primary);
		box-shadow: 0 0 0 3px var(--color-primary-alpha);
	}

	input.error {
		border-color: var(--color-error);
		box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
	}

	input:focus, select:focus {
		outline: none;
		border-color: var(--color-primary);
		box-shadow: 0 0 0 3px var(--color-primary-alpha);
	}

	.error-text {
		color: var(--color-error);
		font-size: 0.75rem;
		margin-top: 0.25rem;
		display: block;
	}

	.pay-button {
		width: 100%;
		padding: 1rem;
		border: none;
		border-radius: 0.5rem;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
		color: white;
		margin-top: 1rem;
	}

	.pay-button:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: var(--shadow-primary);
	}

	.pay-button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		background: var(--color-text-muted);
	}

	.loading-spinner {
		width: 16px;
		height: 16px;
		border: 2px solid transparent;
		border-top: 2px solid currentColor;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}

	.test-info {
		margin-top: 2rem;
		padding: 1rem;
		background: #f8fafc;
		border-radius: 0.5rem;
		border: 1px solid #e2e8f0;
	}

	.test-info h4 {
		margin: 0 0 0.75rem 0;
		font-size: 0.875rem;
		font-weight: 600;
		color: #374151;
	}

	.test-cards {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.test-card {
		font-size: 0.75rem;
		color: #6b7280;
		font-family: monospace;
	}

	@media (max-width: 768px) {
		.form-row {
			grid-template-columns: 1fr;
		}
		
		.payment-header {
			flex-direction: column;
			align-items: flex-start;
			gap: 0.5rem;
		}
	}
</style>
