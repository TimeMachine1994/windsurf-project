import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import sgMail from '@sendgrid/mail';
import { SENDGRID_API_KEY, SENDGRID_FROM_EMAIL } from '$env/static/private';

if (SENDGRID_API_KEY) {
	sgMail.setApiKey(SENDGRID_API_KEY);
}

export const POST: RequestHandler = async ({ request }) => {
	try {
		const paymentData = await request.json();
		
		if (!SENDGRID_API_KEY || !SENDGRID_FROM_EMAIL) {
			return json({ 
				success: false, 
				error: 'Email service not configured' 
			});
		}

		const { paymentIntentId, amount, customerInfo, bookingItems } = paymentData;
		
		const date = new Date().toLocaleDateString();
		const time = new Date().toLocaleTimeString();

		// Generate HTML receipt
		const receiptHTML = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>TributeStream Receipt</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 20px; 
            background-color: #f9fafb;
        }
        .container {
            background: white;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header { 
            text-align: center; 
            border-bottom: 2px solid #16a34a; 
            padding-bottom: 20px; 
            margin-bottom: 30px; 
        }
        .logo { 
            color: #16a34a; 
            font-size: 28px; 
            font-weight: bold; 
            margin-bottom: 10px;
        }
        .receipt-info { 
            background: #f9fafb; 
            padding: 20px; 
            border-radius: 8px; 
            margin-bottom: 30px; 
        }
        .receipt-info h3 {
            margin-top: 0;
            color: #374151;
        }
        .items { 
            margin-bottom: 30px; 
        }
        .items h3 {
            color: #374151;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 10px;
        }
        .item { 
            display: flex; 
            justify-content: space-between; 
            padding: 12px 0; 
            border-bottom: 1px solid #e5e7eb; 
        }
        .item:last-child {
            border-bottom: none;
        }
        .item-name {
            flex: 1;
            color: #374151;
        }
        .item-price {
            font-weight: 600;
            color: #111827;
        }
        .total { 
            font-size: 20px; 
            font-weight: bold; 
            color: #16a34a; 
            text-align: right; 
            padding: 20px 0; 
            border-top: 2px solid #16a34a; 
            margin-top: 20px;
        }
        .footer { 
            text-align: center; 
            margin-top: 40px; 
            color: #6b7280; 
            font-size: 14px;
        }
        .next-steps {
            background: #dbeafe;
            border: 1px solid #93c5fd;
            border-radius: 8px;
            padding: 20px;
            margin-top: 30px;
        }
        .next-steps h3 {
            color: #1e40af;
            margin-top: 0;
        }
        .next-steps ul {
            color: #1e40af;
            margin: 0;
            padding-left: 20px;
        }
        .next-steps li {
            margin-bottom: 8px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">TributeStream</div>
            <h2 style="margin: 0; color: #374151;">Payment Receipt</h2>
            <p style="margin: 10px 0 0 0; color: #6b7280;">Thank you for your purchase!</p>
        </div>
        
        <div class="receipt-info">
            <h3>Receipt Details</h3>
            <p><strong>Payment ID:</strong> ${paymentIntentId}</p>
            <p><strong>Date:</strong> ${date} at ${time}</p>
            <p><strong>Customer:</strong> ${customerInfo?.name}</p>
            <p><strong>Email:</strong> ${customerInfo?.email}</p>
            ${customerInfo?.phone ? `<p><strong>Phone:</strong> ${customerInfo.phone}</p>` : ''}
        </div>
        
        <div class="items">
            <h3>Services Ordered</h3>
            ${bookingItems?.map(item => `
                <div class="item">
                    <span class="item-name">${item.name}${item.quantity > 1 ? ` (${item.quantity}x $${item.price})` : ''}</span>
                    <span class="item-price">$${item.total}</span>
                </div>
            `).join('') || ''}
        </div>
        
        <div class="total">
            Total Paid: $${amount}
        </div>

        <div class="next-steps">
            <h3>What's Next?</h3>
            <ul>
                <li>Our team will contact you within 24 hours to schedule your service</li>
                <li>You'll receive a confirmation email with detailed next steps</li>
                <li>We'll coordinate all technical setup for your livestream</li>
                <li>A dedicated coordinator will be assigned to your event</li>
            </ul>
        </div>
        
        <div class="footer">
            <p><strong>Thank you for choosing TributeStream!</strong></p>
            <p>For support, contact us at support@tributestream.com</p>
            <p style="margin-top: 20px; font-size: 12px;">
                This is an automated receipt. Please keep this for your records.
            </p>
        </div>
    </div>
</body>
</html>`;

		// Send email
		const msg = {
			to: customerInfo?.email,
			from: SENDGRID_FROM_EMAIL,
			subject: `TributeStream Receipt - Payment Confirmation #${paymentIntentId.slice(-8)}`,
			html: receiptHTML,
			text: `
TributeStream Payment Receipt

Payment ID: ${paymentIntentId}
Date: ${date} at ${time}
Customer: ${customerInfo?.name}
Email: ${customerInfo?.email}
${customerInfo?.phone ? `Phone: ${customerInfo.phone}` : ''}

Services Ordered:
${bookingItems?.map(item => `${item.name}${item.quantity > 1 ? ` (${item.quantity}x $${item.price})` : ''}: $${item.total}`).join('\n') || ''}

Total Paid: $${amount}

What's Next?
- Our team will contact you within 24 hours to schedule your service
- You'll receive a confirmation email with detailed next steps
- We'll coordinate all technical setup for your livestream
- A dedicated coordinator will be assigned to your event

Thank you for choosing TributeStream!
For support, contact us at support@tributestream.com
			`
		};

		await sgMail.send(msg);

		return json({ success: true });
	} catch (error) {
		console.error('Error sending receipt email:', error);
		return json({ 
			success: false, 
			error: 'Failed to send receipt email' 
		});
	}
};
