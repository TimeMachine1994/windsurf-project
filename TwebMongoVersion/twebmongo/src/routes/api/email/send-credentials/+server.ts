import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { email, name, password, memorialUrl, lovedOneName, funeralHomeName, funeralDirectorName } = await request.json();

		// Validation
		if (!email || !name || !password || !memorialUrl || !lovedOneName) {
			return json({ error: 'Missing required fields' }, { status: 400 });
		}

		// Check if SendGrid is configured
		const sendGridApiKey = process.env.SENDGRID_API_KEY;
		const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@tributestream.com';

		if (!sendGridApiKey) {
			console.warn('SendGrid not configured - credentials email not sent');
			return json({ 
				success: false, 
				message: 'Email service not configured' 
			});
		}

		// Prepare email content
		const subject = `Your TributeStream Memorial Account - ${lovedOneName}`;
		const funeralHomeSection = funeralHomeName ? `
			<div style="background: #e0f2fe; padding: 15px; border-radius: 5px; margin: 20px 0;">
				<h3 style="margin: 0 0 10px 0; color: #0277bd;">Professional Service</h3>
				<p style="margin: 0;"><strong>Funeral Home:</strong> ${funeralHomeName}</p>
				${funeralDirectorName ? `<p style="margin: 5px 0 0 0;"><strong>Funeral Director:</strong> ${funeralDirectorName}</p>` : ''}
			</div>
		` : '';
		
		const htmlContent = `
			<!DOCTYPE html>
			<html>
			<head>
				<meta charset="utf-8">
				<title>Your TributeStream Account</title>
				<style>
					body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
					.container { max-width: 600px; margin: 0 auto; padding: 20px; }
					.header { background: #1e40af; color: white; padding: 20px; text-align: center; }
					.content { padding: 20px; background: #f9f9f9; }
					.credentials { background: white; padding: 15px; border-left: 4px solid #1e40af; margin: 20px 0; }
					.button { display: inline-block; background: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
					.footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
				</style>
			</head>
			<body>
				<div class="container">
					<div class="header">
						<h1>🏠 TributeStream</h1>
						<p>Your Memorial Account is Ready</p>
					</div>
					
					<div class="content">
						<h2>Hello ${name},</h2>
						
						<p>Thank you for creating a memorial for <strong>${lovedOneName}</strong> on TributeStream. Your memorial has been successfully created and is now live.</p>
						
						${funeralHomeSection}
						
						<div class="credentials">
							<h3>Your Account Details:</h3>
							<p><strong>Email:</strong> ${email}</p>
							<p><strong>Password:</strong> <code>${password}</code></p>
							<p><strong>Memorial URL:</strong> <br>
							<a href="https://tributestream.com/${memorialUrl}">tributestream.com/${memorialUrl}</a></p>
						</div>
						
						<p><strong>Important:</strong> Please save your password securely. You can use these credentials to:</p>
						<ul>
							<li>Log in to manage your memorial</li>
							<li>Upload photos and memories</li>
							<li>Update memorial information</li>
							<li>View memorial statistics</li>
						</ul>
						
						<p style="text-align: center;">
							<a href="https://tributestream.com/${memorialUrl}" class="button">View Your Memorial</a>
						</p>
						
						<p>If you have any questions or need assistance, please don't hesitate to contact our support team at <a href="mailto:support@tributestream.com">support@tributestream.com</a> or call 1-800-TRIBUTE.</p>
						
						<p>With sympathy and support,<br>
						The TributeStream Team</p>
					</div>
					
					<div class="footer">
						<p>© ${new Date().getFullYear()} TributeStream, LLC. All rights reserved.</p>
						<p>123 Memorial Drive, Suite 100, Boston, MA 02101</p>
						<p>If you did not create this account, please contact us immediately.</p>
					</div>
				</div>
			</body>
			</html>
		`;

		const textContent = `
Hello ${name},

Thank you for creating a memorial for ${lovedOneName} on TributeStream. Your memorial has been successfully created and is now live.

Your Account Details:
Email: ${email}
Password: ${password}
Memorial URL: https://tributestream.com/${memorialUrl}

Important: Please save your password securely. You can use these credentials to:
- Log in to manage your memorial
- Upload photos and memories  
- Update memorial information
- View memorial statistics

View your memorial: https://tributestream.com/${memorialUrl}

If you have any questions or need assistance, please contact our support team at support@tributestream.com or call 1-800-TRIBUTE.

With sympathy and support,
The TributeStream Team

© ${new Date().getFullYear()} TributeStream, LLC. All rights reserved.
123 Memorial Drive, Suite 100, Boston, MA 02101

If you did not create this account, please contact us immediately.
		`;

		// Send email via SendGrid
		const sendGridResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${sendGridApiKey}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				personalizations: [{
					to: [{ email, name }],
					subject
				}],
				from: { 
					email: fromEmail, 
					name: 'TributeStream' 
				},
				content: [
					{
						type: 'text/plain',
						value: textContent
					},
					{
						type: 'text/html',
						value: htmlContent
					}
				]
			})
		});

		if (!sendGridResponse.ok) {
			const errorText = await sendGridResponse.text();
			console.error('SendGrid error:', errorText);
			return json({ 
				success: false, 
				error: 'Failed to send email' 
			}, { status: 500 });
		}

		return json({ 
			success: true, 
			message: 'Credentials email sent successfully' 
		});

	} catch (error) {
		console.error('Email sending error:', error);
		return json({ 
			success: false, 
			error: 'Internal server error' 
		}, { status: 500 });
	}
};
