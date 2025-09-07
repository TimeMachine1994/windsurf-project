import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  type User 
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './config';

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  phone?: string;
  bio?: string;
  role: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

// Register new user with email and password
export async function registerUser(email: string, password: string, displayName?: string): Promise<UserProfile> {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update the user's display name in Firebase Auth
    if (displayName) {
      await updateProfile(user, { displayName });
    }
    
    // Create user profile in Firestore
    const userProfile: UserProfile = {
      uid: user.uid,
      email: user.email!,
      displayName: displayName || '',
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await setDoc(doc(db, 'users', user.uid), userProfile);
    
    return userProfile;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

// Sign in existing user
export async function signInUser(email: string, password: string): Promise<User> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

// Sign out current user
export async function signOutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error: any) {
    throw new Error(error.message);
  }
}

// Get user profile from Firestore
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    } else {
      return null;
    }
  } catch (error: any) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

// Update user profile
export async function updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: new Date()
    });
    
    // Update display name in Firebase Auth if provided
    if (updates.displayName && auth.currentUser) {
      await updateProfile(auth.currentUser, { displayName: updates.displayName });
    }
  } catch (error: any) {
    throw new Error(error.message);
  }
}

// Auth state observer
export function onAuthStateChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}
