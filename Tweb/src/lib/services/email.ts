// Client-side email service that calls the server API
export async function sendPasswordEmail(
  email: string, 
  password: string, 
  memorialUrl: string, 
  lovedOneName: string
): Promise<void> {
  console.log('📧 Starting email send process...');
  console.log('📧 Email details:', { email, memorialUrl, lovedOneName, passwordLength: password.length });
  
  try {
    console.log('🌐 Making API call to /api/send-email...');
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        memorialUrl,
        lovedOneName
      })
    });
    console.log('📡 API response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ API returned error:', errorData);
      throw new Error(errorData.error || 'Failed to send email');
    }

    const result = await response.json();
    console.log('✅ Email API success:', result.message);
  } catch (error: any) {
    console.error('❌ Error in sendPasswordEmail:', error);
    console.error('Email error details:', { email, errorMessage: error?.message });
    throw new Error('Failed to send email');
  }
}
