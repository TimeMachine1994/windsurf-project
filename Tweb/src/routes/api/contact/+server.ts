import { json } from '@sveltejs/kit';
import sgMail from '@sendgrid/mail';
import { SENDGRID_API_KEY, SENDGRID_FROM_EMAIL, SENDGRID_FROM_NAME } from '$env/static/private';
import type { RequestHandler } from './$types';

// Initialize SendGrid
sgMail.setApiKey(SENDGRID_API_KEY);

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { name, email, subject, message } = await request.json();

		// Validate required fields
		if (!name || !email || !subject || !message) {
			return json(
				{ error: 'All fields are required' },
				{ status: 400 }
			);
		}

		// Validate email format
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return json(
				{ error: 'Please enter a valid email address' },
				{ status: 400 }
			);
		}

		// Prepare email content
		const msg = {
			to: SENDGRID_FROM_EMAIL, // Your business email
			from: {
				email: SENDGRID_FROM_EMAIL,
				name: SENDGRID_FROM_NAME
			},
			replyTo: email, // User's email for easy replies
			subject: `Contact Form: ${subject}`,
			text: `
Name: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}
			`.trim(),
			html: `
				<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
					<h2 style="color: #333; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">
						New Contact Form Submission
					</h2>
					
					<div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
						<p style="margin: 0 0 10px 0;"><strong>Name:</strong> ${name}</p>
						<p style="margin: 0 0 10px 0;"><strong>Email:</strong> ${email}</p>
						<p style="margin: 0 0 10px 0;"><strong>Subject:</strong> ${subject}</p>
					</div>
					
					<div style="margin: 20px 0;">
						<h3 style="color: #555; margin-bottom: 10px;">Message:</h3>
						<div style="background: white; padding: 15px; border-left: 4px solid #3b82f6; border-radius: 4px;">
							${message.replace(/\n/g, '<br>')}
						</div>
					</div>
					
					<div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #666; font-size: 12px;">
						<p>This message was sent via the TributeStream contact form.</p>
					</div>
				</div>
			`
		};

		// Send email
		await sgMail.send(msg);

		return json({ success: true, message: 'Message sent successfully!' });
	} catch (error) {
		console.error('Contact form error:', error);
		
		// Handle SendGrid specific errors
		if (error.response) {
			console.error('SendGrid error:', error.response.body);
		}
		
		return json(
			{ error: 'Failed to send message. Please try again later.' },
			{ status: 500 }
		);
	}
};
