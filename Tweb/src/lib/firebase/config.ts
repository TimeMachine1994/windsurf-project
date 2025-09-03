import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { dev } from '$app/environment';

// Firebase configuration - replace with your actual config
const firebaseConfig = {
  apiKey: "AIzaSyAXmTxzYRc-LhMEW75nZjjjQCZov1gpiw0",
  authDomain: "fir-tweb.firebaseapp.com",
  projectId: "fir-tweb",
  storageBucket: "fir-tweb.firebasestorage.app",
  messagingSenderId: "509455146790",
  appId: "1:509455146790:web:7ec99527214b05d7b9ebe7",
  measurementId: "G-NLY7K5GGYQ"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Firestore
export const db = getFirestore(app);

// Connect to emulators in development
if (dev) {
  try {
    connectAuthEmulator(auth, 'http://localhost:9099');
    connectFirestoreEmulator(db, 'localhost', 8081);
  } catch (error) {
    console.log('Emulators already connected or not available');
  }
}
