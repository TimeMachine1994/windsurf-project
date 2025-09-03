<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	let paymentData: any = null;
	let loading = true;
	let error = '';

	onMount(() => {
		// Get payment data from URL params or session storage
		const urlParams = new URLSearchParams($page.url.search);
		const paymentIntentId = urlParams.get('payment_intent');
		const sessionData = sessionStorage.getItem('paymentReceipt');

		if (sessionData) {
			try {
				paymentData = JSON.parse(sessionData);
				loading = false;
				// Clear session data after use
				sessionStorage.removeItem('paymentReceipt');
			} catch (e) {
				error = 'Invalid payment data';
				loading = false;
			}
		} else if (paymentIntentId) {
			// Fetch payment details from Stripe if we only have payment intent ID
			fetchPaymentDetails(paymentIntentId);
		} else {
			error = 'No payment information found';
			loading = false;
		}
	});

	async function fetchPaymentDetails(paymentIntentId: string) {
		try {
			const response = await fetch(`/api/get-payment-details?payment_intent=${paymentIntentId}`);
			const data = await response.json();
			
			if (data.success) {
				paymentData = data.paymentData;
			} else {
				error = 'Failed to retrieve payment details';
			}
		} catch (e) {
			error = 'Error fetching payment details';
		} finally {
			loading = false;
		}
	}

	function formatDate(timestamp: number) {
		return new Date(timestamp * 1000).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function formatAmount(amount: number) {
		return (amount / 100).toFixed(2);
	}

	function printReceipt() {
		window.print();
	}

	function downloadReceipt() {
		// Create a simple text receipt for download
		const receiptText = generateReceiptText();
		const blob = new Blob([receiptText], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `receipt-${paymentData.paymentIntent.id}.txt`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}

	function generateReceiptText() {
		if (!paymentData) return '';
		
		return `
TRIBUTESTREAM RECEIPT
=====================

Payment ID: ${paymentData.paymentIntent.id}
Date: ${formatDate(paymentData.paymentIntent.created)}
Amount: $${formatAmount(paymentData.paymentIntent.amount)}
Status: ${paymentData.paymentIntent.status.toUpperCase()}

BILLING INFORMATION
-------------------
Name: ${paymentData.paymentData.firstName} ${paymentData.paymentData.lastName}
Email: ${paymentData.paymentData.email}
Phone: ${paymentData.paymentData.phone || 'N/A'}

BILLING ADDRESS
---------------
${paymentData.paymentData.address}
${paymentData.paymentData.city}, ${paymentData.paymentData.state} ${paymentData.paymentData.zipCode}
${paymentData.paymentData.country}

PAYMENT METHOD
--------------
Card ending in ****${paymentData.paymentIntent.payment_method?.card?.last4 || 'N/A'}
${paymentData.paymentIntent.payment_method?.card?.brand?.toUpperCase() || 'Card'}

Thank you for your business!
		`.trim();
	}
</script>

<svelte:head>
	<title>Payment Receipt - TributeStream</title>
</svelte:head>

<div class="receipt-container">
	{#if loading}
		<div class="loading-state">
			<div class="loading-spinner"></div>
			<p>Loading your receipt...</p>
		</div>
	{:else if error}
		<div class="error-state">
			<div class="error-icon">❌</div>
			<h2>Receipt Not Found</h2>
			<p>{error}</p>
			<button class="btn btn-primary" on:click={() => goto('/')}>Return Home</button>
		</div>
	{:else if paymentData}
		<div class="receipt-content">
			<div class="receipt-header">
				<div class="success-icon">✅</div>
				<h1>Payment Successful!</h1>
				<p class="success-message">Your payment has been processed successfully.</p>
			</div>

			<div class="receipt-details">
				<div class="receipt-section">
					<h3>Payment Information</h3>
					<div class="detail-grid">
						<div class="detail-item">
							<span class="label">Payment ID:</span>
							<span class="value">{paymentData.paymentIntent.id}</span>
						</div>
						<div class="detail-item">
							<span class="label">Date:</span>
							<span class="value">{formatDate(paymentData.paymentIntent.created)}</span>
						</div>
						<div class="detail-item">
							<span class="label">Amount:</span>
							<span class="value amount">${formatAmount(paymentData.paymentIntent.amount)}</span>
						</div>
						<div class="detail-item">
							<span class="label">Status:</span>
							<span class="value status-success">{paymentData.paymentIntent.status.toUpperCase()}</span>
						</div>
					</div>
				</div>

				<div class="receipt-section">
					<h3>Billing Information</h3>
					<div class="detail-grid">
						<div class="detail-item">
							<span class="label">Name:</span>
							<span class="value">{paymentData.paymentData.firstName} {paymentData.paymentData.lastName}</span>
						</div>
						<div class="detail-item">
							<span class="label">Email:</span>
							<span class="value">{paymentData.paymentData.email}</span>
						</div>
						{#if paymentData.paymentData.phone}
							<div class="detail-item">
								<span class="label">Phone:</span>
								<span class="value">{paymentData.paymentData.phone}</span>
							</div>
						{/if}
					</div>
				</div>

				<div class="receipt-section">
					<h3>Billing Address</h3>
					<div class="address-block">
						<p>{paymentData.paymentData.address}</p>
						<p>{paymentData.paymentData.city}, {paymentData.paymentData.state} {paymentData.paymentData.zipCode}</p>
						<p>{paymentData.paymentData.country}</p>
					</div>
				</div>

				{#if paymentData.paymentIntent.payment_method?.card}
					<div class="receipt-section">
						<h3>Payment Method</h3>
						<div class="payment-method">
							<span class="card-brand">{paymentData.paymentIntent.payment_method.card.brand.toUpperCase()}</span>
							<span class="card-number">****{paymentData.paymentIntent.payment_method.card.last4}</span>
						</div>
					</div>
				{/if}
			</div>

			<div class="receipt-actions">
				<button class="btn btn-secondary" on:click={printReceipt}>
					🖨️ Print Receipt
				</button>
				<button class="btn btn-secondary" on:click={downloadReceipt}>
					📄 Download Receipt
				</button>
				<button class="btn btn-primary" on:click={() => goto('/')}>
					🏠 Return Home
				</button>
			</div>

			<div class="receipt-footer">
				<p>A copy of this receipt has been sent to your email address.</p>
				<p class="support-text">
					If you have any questions about this payment, please contact our support team.
				</p>
			</div>
		</div>
	{/if}
</div>

<style>
	.receipt-container {
		max-width: 800px;
		margin: 2rem auto;
		padding: 1rem;
		min-height: 80vh;
		display: flex;
		flex-direction: column;
		justify-content: center;
	}

	.loading-state, .error-state {
		text-align: center;
		padding: 3rem;
	}

	.loading-spinner {
		width: 40px;
		height: 40px;
		border: 4px solid #e5e7eb;
		border-top: 4px solid #667eea;
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin: 0 auto 1rem;
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}

	.error-icon, .success-icon {
		font-size: 3rem;
		margin-bottom: 1rem;
	}

	.receipt-content {
		background: white;
		border-radius: 1rem;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
		overflow: hidden;
	}

	.receipt-header {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		text-align: center;
		padding: 3rem 2rem;
	}

	.receipt-header h1 {
		margin: 1rem 0 0.5rem;
		font-size: 2rem;
		font-weight: 600;
	}

	.success-message {
		font-size: 1.125rem;
		opacity: 0.9;
		margin: 0;
	}

	.receipt-details {
		padding: 2rem;
	}

	.receipt-section {
		margin-bottom: 2rem;
		padding-bottom: 1.5rem;
		border-bottom: 1px solid #e5e7eb;
	}

	.receipt-section:last-child {
		border-bottom: none;
		margin-bottom: 0;
	}

	.receipt-section h3 {
		margin: 0 0 1rem;
		font-size: 1.25rem;
		font-weight: 600;
		color: #374151;
	}

	.detail-grid {
		display: grid;
		gap: 0.75rem;
	}

	.detail-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5rem 0;
	}

	.label {
		font-weight: 500;
		color: #6b7280;
	}

	.value {
		font-weight: 600;
		color: #374151;
	}

	.amount {
		font-size: 1.25rem;
		color: #059669;
	}

	.status-success {
		color: #059669;
		background: #d1fae5;
		padding: 0.25rem 0.75rem;
		border-radius: 0.5rem;
		font-size: 0.875rem;
	}

	.address-block p {
		margin: 0.25rem 0;
		color: #374151;
	}

	.payment-method {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1rem;
		background: #f9fafb;
		border-radius: 0.5rem;
	}

	.card-brand {
		font-weight: 600;
		color: #374151;
	}

	.card-number {
		font-family: monospace;
		color: #6b7280;
	}

	.receipt-actions {
		display: flex;
		gap: 1rem;
		padding: 2rem;
		border-top: 1px solid #e5e7eb;
		justify-content: center;
		flex-wrap: wrap;
	}

	.btn {
		padding: 0.75rem 1.5rem;
		border: none;
		border-radius: 0.5rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
		text-decoration: none;
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
	}

	.btn-primary {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
	}

	.btn-primary:hover {
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
	}

	.btn-secondary {
		background: white;
		color: #667eea;
		border: 2px solid #667eea;
	}

	.btn-secondary:hover {
		background: #667eea;
		color: white;
	}

	.receipt-footer {
		text-align: center;
		padding: 2rem;
		background: #f9fafb;
		color: #6b7280;
	}

	.receipt-footer p {
		margin: 0.5rem 0;
	}

	.support-text {
		font-size: 0.875rem;
	}

	@media (max-width: 768px) {
		.receipt-container {
			margin: 1rem;
			padding: 0.5rem;
		}

		.receipt-header {
			padding: 2rem 1rem;
		}

		.receipt-details {
			padding: 1.5rem;
		}

		.receipt-actions {
			flex-direction: column;
			padding: 1.5rem;
		}

		.detail-item {
			flex-direction: column;
			align-items: flex-start;
			gap: 0.25rem;
		}
	}

	@media print {
		.receipt-actions {
			display: none;
		}
		
		.receipt-container {
			margin: 0;
			padding: 0;
		}
		
		.receipt-content {
			box-shadow: none;
		}
	}
</style>
