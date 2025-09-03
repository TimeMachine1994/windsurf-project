# Firebase Authentication Setup Guide

This guide will help you configure Firebase authentication for your SvelteKit application.

## 1. Firebase Project Setup

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Enable Authentication in the Firebase console:
   - Go to Authentication > Sign-in method
   - Enable "Email/Password" provider

## 2. Get Firebase Configuration

1. In the Firebase console, go to Project Settings (gear icon)
2. Scroll down to "Your apps" section
3. Click "Add app" and select Web (</>) 
4. Register your app and copy the configuration object

## 3. Update Firebase Config

Replace the placeholder values in `/src/lib/firebase/config.ts` with your actual Firebase configuration:

```typescript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com", 
  projectId: "your-actual-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-actual-app-id"
};
```

## 4. Firestore Setup

1. In Firebase console, go to Firestore Database
2. Create database in production mode
3. The security rules are already configured in your `firestore.rules` file

## 5. Development with Emulators

The app is configured to use Firebase emulators in development mode. To start the emulators:

```bash
# In the root directory (not Tweb/)
firebase emulators:start
```

This will start:
- Auth emulator on port 9099
- Firestore emulator on port 8081
- Firebase UI on port 4000

## 6. User Roles

New users are automatically assigned the "Viewer" role. The system supports:
- **Viewer**: Default role for new registrations
- **Admin**: Can be assigned manually in Firestore

## 7. Available Routes

- `/login` - Sign in form
- `/register` - Registration form  
- `/profile` - User profile page (requires authentication)

## 8. Authentication Features

✅ Email/password registration and login
✅ User profile creation with default "Viewer" role
✅ Authentication state management
✅ Protected routes
✅ User menu with sign out
✅ Responsive design
✅ Firebase emulator support for development

## Troubleshooting

- Make sure Firebase configuration is correct
- Check that Authentication is enabled in Firebase console
- Verify Firestore rules are deployed
- For emulator issues, restart with `firebase emulators:start --only auth,firestore`
