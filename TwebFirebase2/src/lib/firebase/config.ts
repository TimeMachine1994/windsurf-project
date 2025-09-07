import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { dev } from '$app/environment';
import { browser } from '$app/environment';

// Check if Firebase environment variables are configured
const hasFirebaseConfig = !!(
  import.meta.env.PUBLIC_FIREBASE_API_KEY &&
  import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN &&
  import.meta.env.PUBLIC_FIREBASE_PROJECT_ID &&
  import.meta.env.PUBLIC_FIREBASE_STORAGE_BUCKET &&
  import.meta.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID &&
  import.meta.env.PUBLIC_FIREBASE_APP_ID
);

// Default demo configuration for development when real config is missing
const demoConfig = {
  apiKey: "demo-api-key",
  authDomain: "demo-project.firebaseapp.com",
  projectId: "demo-project",
  storageBucket: "demo-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:demo"
};

// Firebase configuration using environment variables with fallback
const firebaseConfig = hasFirebaseConfig ? {
  apiKey: import.meta.env.PUBLIC_FIREBASE_API_KEY,
  authDomain: import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.PUBLIC_FIREBASE_APP_ID
} : demoConfig;

// Initialize Firebase (prevent duplicate app initialization)
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Firestore
export const db = getFirestore(app);

// Connect to emulators in development or when using demo config
const useEmulators = dev && (import.meta.env.PUBLIC_USE_FIREBASE_EMULATOR === 'true' || !hasFirebaseConfig);

if (useEmulators && browser) {
  try {
    connectAuthEmulator(auth, 'http://localhost:9099');
    connectFirestoreEmulator(db, 'localhost', 8081);
    console.log('🔧 Connected to Firebase emulators');
  } catch (error) {
    console.log('⚠️ Emulators already connected or not available');
  }
}

// Log configuration status
if (dev) {
  if (hasFirebaseConfig) {
    console.log('🔥 Using live Firebase configuration');
  } else {
    console.log('⚠️ Using demo Firebase configuration - please set up your .env file');
  }
}
