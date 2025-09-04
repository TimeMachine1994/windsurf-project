import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { dev } from '$app/environment';
import { 
  PUBLIC_FIREBASE_API_KEY,
  PUBLIC_FIREBASE_AUTH_DOMAIN,
  PUBLIC_FIREBASE_PROJECT_ID,
  PUBLIC_FIREBASE_STORAGE_BUCKET,
  PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  PUBLIC_FIREBASE_APP_ID,
  PUBLIC_FIREBASE_MEASUREMENT_ID,
  PUBLIC_USE_FIREBASE_EMULATOR,
  PUBLIC_FIREBASE_AUTH_EMULATOR_HOST,
  PUBLIC_FIREBASE_FIRESTORE_EMULATOR_HOST,
  PUBLIC_FIREBASE_STORAGE_EMULATOR_HOST
} from '$env/static/public';

// Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: PUBLIC_FIREBASE_API_KEY || "AIzaSyAXmTxzYRc-LhMEW75nZjjjQCZov1gpiw0",
  authDomain: PUBLIC_FIREBASE_AUTH_DOMAIN || "fir-tweb.firebaseapp.com",
  projectId: PUBLIC_FIREBASE_PROJECT_ID || "fir-tweb",
  storageBucket: PUBLIC_FIREBASE_STORAGE_BUCKET || "fir-tweb.firebasestorage.app",
  messagingSenderId: PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "509455146790",
  appId: PUBLIC_FIREBASE_APP_ID || "1:509455146790:web:7ec99527214b05d7b9ebe7",
  measurementId: PUBLIC_FIREBASE_MEASUREMENT_ID || "G-NLY7K5GGYQ"
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
const useEmulators = dev && PUBLIC_USE_FIREBASE_EMULATOR === 'true';

// Connect to emulators if in development and emulator flag is set
if (useEmulators) {
  try {
    const authHost = PUBLIC_FIREBASE_AUTH_EMULATOR_HOST || 'localhost:9099';
    const firestoreHost = PUBLIC_FIREBASE_FIRESTORE_EMULATOR_HOST || 'localhost:8081';
    const storageHost = PUBLIC_FIREBASE_STORAGE_EMULATOR_HOST || 'localhost:9199';
    
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
