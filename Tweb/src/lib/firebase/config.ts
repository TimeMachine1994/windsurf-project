import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { dev } from '$app/environment';

// Helper function to safely get environment variables
function getEnvVar(key: string, fallback: string = ''): string {
  if (typeof window !== 'undefined') {
    // Client-side: check for environment variables
    return (globalThis as any).__SVELTEKIT_ENV__?.[key] || fallback;
  }
  // Server-side: use process.env
  return process.env[key] || fallback;
}

// Firebase configuration using environment variables with fallbacks
const firebaseConfig = {
  apiKey: getEnvVar('PUBLIC_FIREBASE_API_KEY', "AIzaSyAXmTxzYRc-LhMEW75nZjjjQCZov1gpiw0"),
  authDomain: getEnvVar('PUBLIC_FIREBASE_AUTH_DOMAIN', "fir-tweb.firebaseapp.com"),
  projectId: getEnvVar('PUBLIC_FIREBASE_PROJECT_ID', "fir-tweb"),
  storageBucket: getEnvVar('PUBLIC_FIREBASE_STORAGE_BUCKET', "fir-tweb.firebasestorage.app"),
  messagingSenderId: getEnvVar('PUBLIC_FIREBASE_MESSAGING_SENDER_ID', "509455146790"),
  appId: getEnvVar('PUBLIC_FIREBASE_APP_ID', "1:509455146790:web:7ec99527214b05d7b9ebe7"),
  measurementId: getEnvVar('PUBLIC_FIREBASE_MEASUREMENT_ID', "G-NLY7K5GGYQ")
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Firebase Storage
export const storage = getStorage(app);

// Determine if we should use emulators
const useEmulators = dev && getEnvVar('PUBLIC_USE_FIREBASE_EMULATOR', 'true') === 'true';

// Connect to emulators if in development and emulator flag is set
if (useEmulators) {
  try {
    const authHost = getEnvVar('PUBLIC_FIREBASE_AUTH_EMULATOR_HOST', 'localhost:9099');
    const firestoreHost = getEnvVar('PUBLIC_FIREBASE_FIRESTORE_EMULATOR_HOST', 'localhost:8081');
    const storageHost = getEnvVar('PUBLIC_FIREBASE_STORAGE_EMULATOR_HOST', 'localhost:9199');
    
    connectAuthEmulator(auth, `http://${authHost}`);
    connectFirestoreEmulator(db, firestoreHost.split(':')[0], parseInt(firestoreHost.split(':')[1]));
    connectStorageEmulator(storage, storageHost.split(':')[0], parseInt(storageHost.split(':')[1]));
    
    console.log('🔧 Connected to Firebase emulators for development');
  } catch (error) {
    console.log('⚠️ Emulators already connected or not available');
  }
} else {
  console.log('🔥 Using live Firebase services');
}
