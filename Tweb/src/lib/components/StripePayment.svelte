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
			paymentElement.on('change', (event: any) => {
				console.log('💳 Payment element change:', { 
					complete: event.complete, 
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
			
			addressElement.on('change', (event: any) => {
				console.log('🏠 Address element change:', { 
					complete: event.complete, 
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
			<div class="section-label" role="group" aria-label="Billing Address">Billing Address</div>
			<div bind:this={addressElementContainer} class="stripe-element"></div>
		</div>
		
		<div class="form-section">
			<div class="section-label" role="group" aria-label="Payment Method">Payment Method</div>
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

