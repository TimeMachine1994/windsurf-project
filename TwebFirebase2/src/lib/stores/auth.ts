import { writable } from 'svelte/store';
import { onAuthStateChange, getUserProfile, type UserProfile } from '$lib/firebase/auth';
import type { User } from 'firebase/auth';

// Auth stores
export const user = writable<User | null>(null);
export const userProfile = writable<UserProfile | null>(null);
export const loading = writable<boolean>(true);

// Initialize auth state listener
export function initAuthStore() {
  onAuthStateChange(async (firebaseUser) => {
    user.set(firebaseUser);
    
    if (firebaseUser) {
      // Fetch user profile from Firestore
      const profile = await getUserProfile(firebaseUser.uid);
      userProfile.set(profile);
    } else {
      userProfile.set(null);
    }
    
    loading.set(false);
  });
}
