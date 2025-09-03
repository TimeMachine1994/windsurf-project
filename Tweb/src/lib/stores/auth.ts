import { writable } from 'svelte/store';
import type { User } from 'firebase/auth';
import type { UserProfile } from '$lib/firebase/auth';
import { onAuthStateChange, getUserProfile } from '$lib/firebase/auth';

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  initialized: boolean;
}

const initialState: AuthState = {
  user: null,
  profile: null,
  loading: true,
  initialized: false
};

function createAuthStore() {
  const { subscribe, set, update } = writable<AuthState>(initialState);

  return {
    subscribe,
    
    // Initialize auth store
    init() {
      console.log(' [AUTH STORE] Initializing auth store...');
      update(state => ({ ...state, loading: true }));
      
      const unsubscribe = onAuthStateChange(async (firebaseUser) => {
        console.log(' [AUTH STORE] Auth state changed:', firebaseUser ? `User logged in (${firebaseUser.uid})` : 'User logged out');
        
        if (firebaseUser) {
          // User is signed in, get their profile
          console.log(' [AUTH STORE] Fetching user profile for UID:', firebaseUser.uid);
          const profile = await getUserProfile(firebaseUser.uid);
          if (profile) {
            console.log(' [AUTH STORE] User profile loaded:', profile.role, profile.email);
            update(state => ({ ...state, user: firebaseUser, profile, loading: false, initialized: true }));
          } else {
            // Handle case where Firebase user exists but no profile
            console.log(' [AUTH STORE] Firebase user exists but no profile found');
            update(state => ({ ...state, user: firebaseUser, profile: null, loading: false, initialized: true }));
          }
        } else {
          // User is signed out
          console.log(' [AUTH STORE] User signed out, clearing store');
          update(state => ({ ...state, user: null, profile: null, loading: false, initialized: true }));
        }
        console.log(' [AUTH STORE] Auth store state updated');
      });
      
      return unsubscribe;
    },

    // Set loading state
    setLoading(loading: boolean) {
      update(state => ({ ...state, loading }));
    },

    // Clear auth store
    clear() {
      console.log(' [AUTH STORE] Clearing auth store...');
      update(state => ({ ...state, user: null, profile: null, loading: false }));
      console.log(' [AUTH STORE] Auth store cleared');
    }
  };
}

export const authStore = createAuthStore();
