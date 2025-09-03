<script lang="ts">
	import { onMount, createEventDispatcher } from 'svelte';
	import { loadStripe, type Stripe, type StripeElements, type StripePaymentElement } from '@stripe/stripe-js';
	
	const dispatch = createEventDispatcher();
	
	export let clientSecret: string;
	export let amount: number;
	export let customerName: string = '';
	export let customerEmail: string = '';
	
	let stripe: Stripe | null = null;
	let elements: StripeElements | null = null;
	let paymentElement: StripePaymentElement | null = null;
	let addressElement: any = null;
	
	let paymentElementContainer: HTMLDivElement;
	let addressElementContainer: HTMLDivElement;
	
	let isLoading = false;
	let errorMessage = '';
	let isFormValid = false;
	
	// Get Stripe publishable key from environment
	import { PUBLIC_STRIPE_PUBLISHABLE_KEY } from '$env/static/public';
	const STRIPE_PUBLISHABLE_KEY = PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_TLlEzJE4mqLHyKOzQTfmSxjF';
	
	onMount(async () => {
		try {
			console.log('🔄 Initializing Stripe with:', { clientSecret, STRIPE_PUBLISHABLE_KEY });
			
			// Load Stripe
			stripe = await loadStripe(STRIPE_PUBLISHABLE_KEY);
			
			if (!stripe) {
				throw new Error('Failed to load Stripe');
			}
			console.log('✅ Stripe loaded successfully');
			
			// Create elements instance
			elements = stripe.elements({
				clientSecret,
				appearance: {
					theme: 'stripe',
					variables: {
						colorPrimary: '#667eea',
						colorBackground: '#ffffff',
						colorText: '#374151',
						colorDanger: '#dc2626',
						fontFamily: 'system-ui, sans-serif',
						spacingUnit: '4px',
						borderRadius: '8px'
					}
				}
			});
			console.log('✅ Stripe elements created');
			
			// Create Payment Element
			paymentElement = elements.create('payment', {
				defaultValues: {
					billingDetails: {
						name: customerName,
						email: customerEmail
					}
				}
			});
			console.log('✅ Payment element created');
			
			// Create Address Element
			addressElement = elements.create('address', {
				mode: 'billing',
				defaultValues: {
					name: customerName
				}
			});
			console.log('✅ Address element created');
			
			// Mount elements
			paymentElement.mount(paymentElementContainer);
			addressElement.mount(addressElementContainer);
			console.log('✅ Elements mounted to DOM');
			
			// Listen for changes
			paymentElement.on('change', (event) => {
				console.log('💳 Payment element change:', { 
					complete: event.complete, 
					error: event.error,
					empty: event.empty,
					value: event.value 
				});
				if (event.error) {
					errorMessage = event.error.message || '';
				} else {
					errorMessage = '';
				}
				isFormValid = event.complete;
				console.log('📝 Form validation updated:', { isFormValid, errorMessage });
			});
			
			paymentElement.on('ready', () => {
				console.log('✅ Payment element is ready for input');
			});
			
			paymentElement.on('focus', () => {
				console.log('🎯 Payment element focused');
			});
			
			paymentElement.on('blur', () => {
				console.log('👁️ Payment element blurred');
			});
			
			addressElement.on('change', (event) => {
				console.log('🏠 Address element change:', { 
					complete: event.complete, 
					error: event.error,
					value: event.value 
				});
				if (event.error) {
					errorMessage = event.error.message || '';
				} else if (errorMessage && !event.error) {
					errorMessage = '';
				}
			});
			
			addressElement.on('ready', () => {
				console.log('✅ Address element is ready for input');
			});
			
		} catch (error) {
			console.error('❌ Error initializing Stripe:', error);
			errorMessage = 'Failed to load payment form. Please refresh the page.';
		}
	});
	
	async function handleSubmit() {
		if (!stripe || !elements || !paymentElement) {
			errorMessage = 'Payment system not ready. Please try again.';
			return;
		}
		
		isLoading = true;
		errorMessage = '';
		
		try {
			// Submit the form to collect address
			const { error: submitError } = await elements.submit();
			if (submitError) {
				errorMessage = submitError.message || 'Please check your payment details.';
				isLoading = false;
				return;
			}
			
			// Confirm payment
			const { error, paymentIntent } = await stripe.confirmPayment({
				elements,
				confirmParams: {
					return_url: `${window.location.origin}/booking/success`,
				},
				redirect: 'if_required'
			});
			
			if (error) {
				errorMessage = error.message || 'Payment failed. Please try again.';
			} else if (paymentIntent && paymentIntent.status === 'succeeded') {
				dispatch('success', { paymentIntent });
			}
		} catch (error) {
			console.error('Payment error:', error);
			errorMessage = 'An unexpected error occurred. Please try again.';
		} finally {
			isLoading = false;
		}
	}
</script>

<div class="stripe-payment-container">
	<div class="payment-header">
		<h3>Payment Information</h3>
		<div class="amount-display">
			<span class="amount-label">Total:</span>
			<span class="amount-value">${amount}</span>
		</div>
	</div>
	
	<div class="payment-form">
		<div class="form-section">
			<label class="section-label">Billing Address</label>
			<div bind:this={addressElementContainer} class="stripe-element"></div>
		</div>
		
		<div class="form-section">
			<label class="section-label">Payment Method</label>
			<div bind:this={paymentElementContainer} class="stripe-element"></div>
		</div>
		
		{#if errorMessage}
			<div class="error-message">
				{errorMessage}
			</div>
		{/if}
		
		<!-- Debug info for form state -->
		<div class="debug-payment-state">
			<p><strong>Payment Form Debug:</strong></p>
			<p>Form Valid: {isFormValid ? 'Yes' : 'No'}</p>
			<p>Loading: {isLoading ? 'Yes' : 'No'}</p>
			<p>Error: {errorMessage || 'None'}</p>
		</div>
		
		<button 
			class="pay-button {isFormValid && !isLoading ? 'enabled' : 'disabled'}"
			onclick={handleSubmit}
			disabled={!isFormValid || isLoading}
		>
			{#if isLoading}
				<span class="loading-spinner"></span>
				Processing...
			{:else}
				Pay ${amount}
			{/if}
		</button>
	</div>
	
	<div class="test-info">
		<h4>Test Card Information</h4>
		<div class="test-cards">
			<div class="test-card">
				<strong>Visa:</strong> 4242 4242 4242 4242
			</div>
			<div class="test-card">
				<strong>Mastercard:</strong> 5555 5555 5555 4444
			</div>
			<div class="test-card">
				<strong>Declined:</strong> 4000 0000 0000 0002
			</div>
		</div>
		<p class="test-note">Use any future expiry date, any 3-digit CVC, and any ZIP code.</p>
	</div>
</div>

<style>
	.stripe-payment-container {
		max-width: 500px;
		margin: 0 auto;
	}
	
	.payment-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid #e5e7eb;
	}
	
	.payment-header h3 {
		margin: 0;
		font-size: 1.5rem;
		font-weight: 600;
		color: #374151;
	}
	
	.amount-display {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 1.25rem;
		font-weight: 600;
	}
	
	.amount-label {
		color: #6b7280;
	}
	
	.amount-value {
		color: #667eea;
	}
	
	.payment-form {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}
	
	.form-section {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}
	
	.section-label {
		font-weight: 500;
		color: #374151;
		font-size: 0.875rem;
	}
	
	.stripe-element {
		border: 1px solid #d1d5db;
		border-radius: 8px;
		padding: 12px;
		background: white;
	}
	
	.error-message {
		color: #dc2626;
		font-size: 0.875rem;
		padding: 0.75rem;
		background: #fef2f2;
		border: 1px solid #fecaca;
		border-radius: 0.5rem;
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
	}
	
	.pay-button.enabled {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
	}
	
	.pay-button.enabled:hover {
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
	}
	
	.pay-button.disabled {
		background: #f3f4f6;
		color: #9ca3af;
		cursor: not-allowed;
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
	
	.test-info.mt-4 {
		margin-top: 1rem;
	}
	
	.debug-payment-state {
		background: #fff3cd;
		border: 1px solid #ffeaa7;
		border-radius: 0.5rem;
		padding: 0.75rem;
		margin: 1rem 0;
		font-size: 0.875rem;
	}
	
	.debug-payment-state p {
		margin: 0.25rem 0;
		color: #856404;
	}
	
	.test-info {
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
		margin-bottom: 0.75rem;
	}
	
	.test-card {
		font-size: 0.75rem;
		color: #6b7280;
		font-family: monospace;
	}
	
	.test-note {
		font-size: 0.75rem;
		color: #6b7280;
		margin: 0;
		font-style: italic;
	}
	
	@media (max-width: 768px) {
		.payment-header {
			flex-direction: column;
			align-items: flex-start;
			gap: 0.5rem;
		}
		
		.amount-display {
			font-size: 1.125rem;
		}
	}
</style>
