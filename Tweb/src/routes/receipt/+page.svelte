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

