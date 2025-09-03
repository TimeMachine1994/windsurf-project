import { json } from '@sveltejs/kit';
import sgMail from '@sendgrid/mail';
import { SENDGRID_API_KEY, SENDGRID_FROM_EMAIL, SENDGRID_FROM_NAME } from '$env/static/private';
import type { RequestHandler } from './$types';

// Initialize SendGrid
console.log('🔧 [SERVER] Initializing SendGrid...');
console.log('🔧 [SERVER] SendGrid API key configured:', !!SENDGRID_API_KEY);
console.log('🔧 [SERVER] SendGrid from email:', SENDGRID_FROM_EMAIL || 'not configured');
console.log('🔧 [SERVER] SendGrid from name:', SENDGRID_FROM_NAME || 'not configured');

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
  console.log('✅ [SERVER] SendGrid initialized successfully');
} else {
  console.log('⚠️ [SERVER] SendGrid API key not found - emails will be logged only');
}

export const POST: RequestHandler = async ({ request }) => {
  console.log('📧 [SERVER] Email API endpoint called');
  try {
    console.log('📄 [SERVER] Parsing request body...');
    const { email, password, memorialUrl, lovedOneName } = await request.json();
    console.log('📧 [SERVER] Email request data:', { email, memorialUrl, lovedOneName, passwordLength: password?.length });

    if (!email || !password || !memorialUrl || !lovedOneName) {
      console.error('❌ [SERVER] Missing required fields:', { email: !!email, password: !!password, memorialUrl: !!memorialUrl, lovedOneName: !!lovedOneName });
      return json({ error: 'Missing required fields' }, { status: 400 });
    }

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #667eea; margin: 0;">Welcome to Your Memorial</h1>
        </div>
        
        <p style="font-size: 16px; line-height: 1.6; color: #333;">
          Thank you for creating a memorial for <strong>${lovedOneName}</strong>.
        </p>
        
        <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #667eea;">
          <h3 style="color: #667eea; margin: 0 0 15px 0;">Your Account Details:</h3>
          <p style="margin: 8px 0; color: #333;"><strong>Email:</strong> ${email}</p>
          <p style="margin: 8px 0; color: #333;"><strong>Temporary Password:</strong></p>
          <div style="background: #fff; padding: 12px; border-radius: 6px; font-family: monospace; font-size: 18px; font-weight: bold; color: #667eea; border: 2px dashed #667eea; margin: 10px 0;">${password}</div>
          <p style="margin: 8px 0; color: #333;"><strong>Memorial URL:</strong></p>
          <a href="${memorialUrl}" style="color: #667eea; text-decoration: none; font-weight: bold; display: inline-block; padding: 10px 20px; background: #fff; border-radius: 6px; border: 2px solid #667eea; margin: 5px 0;">${memorialUrl}</a>
        </div>
        
        <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 20px 0;">
          <p style="margin: 0; color: #856404; font-size: 14px;">
            <strong>Important:</strong> Please save this information securely and consider changing your password after logging in for security.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #666; font-style: italic;">With love,<br><strong>The Memorial Team</strong></p>
        </div>
      </div>
    `;

    const textContent = `
Welcome to Your Memorial

Thank you for creating a memorial for ${lovedOneName}.

Your Account Details:
Email: ${email}
Temporary Password: ${password}
Memorial URL: ${memorialUrl}

Please save this information securely and consider changing your password after logging in.

With love,
The Memorial Team
    `;

    const emailData = {
      to: email,
      subject: `Your Memorial Account - ${lovedOneName}`,
      textContent,
      htmlContent
    };
    console.log(' [SERVER] Email data prepared:', { to: emailData.to, subject: emailData.subject });

    if (!SENDGRID_API_KEY) {
      console.log(' [SERVER] SendGrid not configured. Email would be sent to:', emailData.to);
      console.log(' [SERVER] Email content preview:', { subject: emailData.subject, to: emailData.to });
      return json({ success: true, message: 'Email logged (SendGrid not configured)' });
    }
    
    console.log(' [SERVER] SendGrid configured, preparing to send email...');

    const msg = {
      to: emailData.to,
      from: {
        email: SENDGRID_FROM_EMAIL || 'tributestream@tributestream.com',
        name: SENDGRID_FROM_NAME || 'TributeStream'
      },
      subject: emailData.subject,
      text: emailData.textContent,
      html: emailData.htmlContent,
    };
    console.log(' [SERVER] SendGrid message prepared:', { to: msg.to, from: msg.from, subject: msg.subject });

    console.log(' [SERVER] Sending email via SendGrid...');
    await sgMail.send(msg);
    console.log(' [SERVER] Email sent successfully to:', email);
    
    return json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error(' [SERVER] Error in email API:', error);
    console.error(' [SERVER] Email error details:', { errorMessage: error.message, errorCode: error.code, stack: error.stack });
    return json({ error: 'Failed to send email' }, { status: 500 });
  }
};
