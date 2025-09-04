# Memorial Registration Setup Guide

## Environment Variables Configuration

To fix the email sending and registration issues, you need to configure your environment variables properly.

### 1. Create `.env` file

Copy the `.env.example` file to `.env` in the `Tweb` directory:

```bash
cd Tweb
cp .env.example .env
```

### 2. Configure SendGrid (Required for Email Sending)

Edit your `.env` file and add your SendGrid credentials:

```env
# SendGrid Configuration
SENDGRID_API_KEY=your_actual_sendgrid_api_key_here
SENDGRID_FROM_EMAIL=contact@tributestream.com
SENDGRID_FROM_NAME=TributeStream Contact
```

**To get SendGrid credentials:**
1. Sign up at [SendGrid](https://sendgrid.com/)
2. Go to Settings > API Keys
3. Create a new API key with "Full Access" permissions
4. Copy the API key to your `.env` file

### 3. Configure Firebase (If using server-side Firebase)

```env
# Firebase Configuration (if needed for server-side)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour-private-key-here\n-----END PRIVATE KEY-----"
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
```

### 4. Configure Stripe (If using payments)

```env
# Stripe Configuration
PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
```

## Issues Fixed

### ✅ Registration Flow Issues
- **Email-already-in-use error**: Now shows detailed user-friendly explanations
- **Email sending failures**: Gracefully handled with fallback messages
- **Firestore permission errors**: URL generation uses random suffixes when needed
- **Profile page syntax**: Fixed Svelte template structure

### ✅ Error Handling Improvements
- Network connection issues
- Database permission problems
- Email service configuration issues
- User account conflicts

## Testing the Registration Flow

1. **Start your development server**:
   ```bash
   npm run dev
   ```

2. **Test registration with a new email**:
   - Go to your memorial creation page
   - Fill out the form with valid information
   - Submit and observe the process

3. **Expected behavior**:
   - If SendGrid is configured: Email will be sent with password
   - If SendGrid is NOT configured: Password will be logged to console
   - User will be automatically signed in
   - Redirect to memorial page after 3 seconds

## Troubleshooting

### Email Not Sending (500 Error)
- Check that `SENDGRID_API_KEY` is set in your `.env` file
- Verify the API key has proper permissions
- Check server console for detailed error messages

### User Already Exists Error
- The system now provides clear instructions to users
- Suggests using login page or different email
- Explains possible causes and solutions

### URL Generation Issues
- System now uses random suffixes when permission errors occur
- Ensures unique URLs even when Firestore rules block reads

### CSS/Dynamic Import Errors
- These are typically build/routing issues
- Try restarting your development server
- Clear browser cache and reload

## Next Steps

1. Configure your `.env` file with proper credentials
2. Restart your development server
3. Test the registration flow
4. Monitor console logs for any remaining issues

The registration flow should now work smoothly with proper error handling and user guidance!
