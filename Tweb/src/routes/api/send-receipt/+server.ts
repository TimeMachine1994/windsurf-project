import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { SENDGRID_API_KEY, SENDGRID_FROM_EMAIL, SENDGRID_FROM_NAME } from '$env/static/private';
import sgMail from '@sendgrid/mail';

// Initialize SendGrid
if (SENDGRID_API_KEY) {
	sgMail.setApiKey(SENDGRID_API_KEY);
}

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { paymentData, paymentIntent } = await request.json();

		if (!SENDGRID_API_KEY) {
			console.warn('SendGrid API key not configured, skipping email');
			return json({ success: true, message: 'Email service not configured' });
		}

		const receiptHtml = generateReceiptHTML(paymentData, paymentIntent);
		const receiptText = generateReceiptText(paymentData, paymentIntent);

		const msg = {
			to: paymentData.email,
			from: {
				email: SENDGRID_FROM_EMAIL || 'noreply@tributestream.com',
				name: SENDGRID_FROM_NAME || 'TributeStream'
			},
			subject: `Payment Receipt - ${paymentIntent.id}`,
			text: receiptText,
			html: receiptHtml,
		};

		await sgMail.send(msg);
		console.log('Receipt email sent successfully to:', paymentData.email);

		return json({ success: true, message: 'Receipt email sent successfully' });

	} catch (error: any) {
		console.error('Error sending receipt email:', error);
		return json(
			{ success: false, error: error.message || 'Failed to send receipt email' },
			{ status: 500 }
		);
	}
};

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

function generateReceiptText(paymentData: any, paymentIntent: any) {
	return `
TRIBUTESTREAM RECEIPT
=====================

Payment ID: ${paymentIntent.id}
Date: ${formatDate(paymentIntent.created)}
Amount: $${formatAmount(paymentIntent.amount)}
Status: ${paymentIntent.status.toUpperCase()}

BILLING INFORMATION
-------------------
Name: ${paymentData.firstName} ${paymentData.lastName}
Email: ${paymentData.email}
Phone: ${paymentData.phone || 'N/A'}

BILLING ADDRESS
---------------
${paymentData.address}
${paymentData.city}, ${paymentData.state} ${paymentData.zipCode}
${paymentData.country}

PAYMENT METHOD
--------------
Card ending in ****${paymentIntent.payment_method?.card?.last4 || 'N/A'}
${paymentIntent.payment_method?.card?.brand?.toUpperCase() || 'Card'}

Thank you for choosing TributeStream!

If you have any questions about this payment, please contact our support team.
	`.trim();
}

function generateReceiptHTML(paymentData: any, paymentIntent: any) {
	return `
<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>Payment Receipt</title>
	<style>
		body {
			font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
			line-height: 1.6;
			color: #374151;
			max-width: 600px;
			margin: 0 auto;
			padding: 20px;
			background-color: #f9fafb;
		}
		.container {
			background: white;
			border-radius: 8px;
			overflow: hidden;
			box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		}
		.header {
			background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
			color: white;
			text-align: center;
			padding: 40px 20px;
		}
		.header h1 {
			margin: 0;
			font-size: 24px;
			font-weight: 600;
		}
		.success-icon {
			font-size: 48px;
			margin-bottom: 16px;
		}
		.content {
			padding: 30px;
		}
		.section {
			margin-bottom: 30px;
			padding-bottom: 20px;
			border-bottom: 1px solid #e5e7eb;
		}
		.section:last-child {
			border-bottom: none;
			margin-bottom: 0;
		}
		.section h3 {
			margin: 0 0 16px;
			font-size: 18px;
			font-weight: 600;
			color: #374151;
		}
		.detail-row {
			display: flex;
			justify-content: space-between;
			margin-bottom: 8px;
			padding: 8px 0;
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
			font-size: 20px;
			color: #059669;
		}
		.status {
			background: #d1fae5;
			color: #059669;
			padding: 4px 12px;
			border-radius: 4px;
			font-size: 14px;
		}
		.payment-method {
			background: #f9fafb;
			padding: 16px;
			border-radius: 8px;
			display: flex;
			align-items: center;
			gap: 16px;
		}
		.footer {
			background: #f9fafb;
			padding: 30px;
			text-align: center;
			color: #6b7280;
			font-size: 14px;
		}
		@media (max-width: 600px) {
			.detail-row {
				flex-direction: column;
				gap: 4px;
			}
		}
	</style>
</head>
<body>
	<div class="container">
		<div class="header">
			<div class="success-icon">✅</div>
			<h1>Payment Successful!</h1>
			<p>Your payment has been processed successfully.</p>
		</div>
		
		<div class="content">
			<div class="section">
				<h3>Payment Information</h3>
				<div class="detail-row">
					<span class="label">Payment ID:</span>
					<span class="value">${paymentIntent.id}</span>
				</div>
				<div class="detail-row">
					<span class="label">Date:</span>
					<span class="value">${formatDate(paymentIntent.created)}</span>
				</div>
				<div class="detail-row">
					<span class="label">Amount:</span>
					<span class="value amount">$${formatAmount(paymentIntent.amount)}</span>
				</div>
				<div class="detail-row">
					<span class="label">Status:</span>
					<span class="status">${paymentIntent.status.toUpperCase()}</span>
				</div>
			</div>

			<div class="section">
				<h3>Billing Information</h3>
				<div class="detail-row">
					<span class="label">Name:</span>
					<span class="value">${paymentData.firstName} ${paymentData.lastName}</span>
				</div>
				<div class="detail-row">
					<span class="label">Email:</span>
					<span class="value">${paymentData.email}</span>
				</div>
				${paymentData.phone ? `
				<div class="detail-row">
					<span class="label">Phone:</span>
					<span class="value">${paymentData.phone}</span>
				</div>
				` : ''}
			</div>

			<div class="section">
				<h3>Billing Address</h3>
				<div style="line-height: 1.5;">
					<div>${paymentData.address}</div>
					<div>${paymentData.city}, ${paymentData.state} ${paymentData.zipCode}</div>
					<div>${paymentData.country}</div>
				</div>
			</div>

			${paymentIntent.payment_method?.card ? `
			<div class="section">
				<h3>Payment Method</h3>
				<div class="payment-method">
					<span style="font-weight: 600;">${paymentIntent.payment_method.card.brand.toUpperCase()}</span>
					<span style="font-family: monospace;">****${paymentIntent.payment_method.card.last4}</span>
				</div>
			</div>
			` : ''}
		</div>

		<div class="footer">
			<p><strong>Thank you for choosing TributeStream!</strong></p>
			<p>If you have any questions about this payment, please contact our support team.</p>
		</div>
	</div>
</body>
</html>
	`.trim();
}
