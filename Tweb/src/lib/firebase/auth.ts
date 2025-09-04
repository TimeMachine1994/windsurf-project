import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  type User 
} from 'firebase/auth';
import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from './config';

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  phone?: string;
  role: 'Viewer' | 'Owner' | 'Admin' | 'FuneralDirector';
  createdAt: Date | { toDate(): Date };
  updatedAt: Date | { toDate(): Date };
  // Funeral Director specific fields
  funeralHomeName?: string;
  funeralHomeAddress?: string;
  funeralHomeEmail?: string;
  funeralHomePhone?: string;
  personalPhone?: string;
  approved?: boolean; // For admin approval system
  approvedAt?: Date | { toDate(): Date };
  approvedBy?: string; // Admin UID who approved
}

// Register new user with email and password
export async function registerUser(email: string, password: string, displayName?: string): Promise<UserProfile> {
  console.log('🔐 Starting user registration for email:', email);
  try {
    console.log('👤 Creating Firebase user account...');
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log('✅ Firebase user created with UID:', user.uid);
    
    // Create user profile in Firestore with default "Viewer" role
    console.log('📝 Creating user profile with Viewer role...');
    const userProfile: UserProfile = {
      uid: user.uid,
      email: user.email!,
      displayName: displayName || '',
      role: 'Viewer', // Default role for new users
      createdAt: new Date(),
      updatedAt: new Date()
    };
    console.log('👤 User profile data:', userProfile);
    
    await setDoc(doc(db, 'users', user.uid), userProfile);
    console.log('✅ User profile saved to Firestore');
    
    return userProfile;
  } catch (error: any) {
    console.error('❌ Error in registerUser:', error);
    console.error('Registration error details:', { email, errorMessage: error.message, errorCode: error.code });
    throw new Error(error.message);
  }
}

// Register funeral director with additional information
export async function registerFuneralDirector(
  email: string, 
  password: string, 
  displayName: string,
  funeralHomeName: string,
  funeralHomeAddress: string,
  funeralHomeEmail: string,
  funeralHomePhone: string,
  personalPhone: string
): Promise<UserProfile> {
  console.log('🔐 Starting funeral director registration for email:', email);
  try {
    console.log('👤 Creating Firebase user account...');
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log('✅ Firebase user created with UID:', user.uid);
    
    // Create funeral director profile in Firestore
    console.log('📝 Creating funeral director profile...');
    const userProfile: UserProfile = {
      uid: user.uid,
      email: user.email!,
      displayName: displayName,
      role: 'FuneralDirector',
      funeralHomeName,
      funeralHomeAddress,
      funeralHomeEmail,
      funeralHomePhone,
      personalPhone,
      approved: false, // Requires admin approval
      createdAt: new Date(),
      updatedAt: new Date()
    };
    console.log('👤 Funeral director profile data:', userProfile);
    
    await setDoc(doc(db, 'users', user.uid), userProfile);
    console.log('✅ Funeral director profile saved to Firestore');
    
    return userProfile;
  } catch (error: any) {
    console.error('❌ Error in registerFuneralDirector:', error);
    console.error('Registration error details:', { email, errorMessage: error.message, errorCode: error.code });
    throw new Error(error.message);
  }
}

// Sign in existing user
export async function signInUser(email: string, password: string): Promise<User> {
  console.log('🔑 Attempting to sign in user:', email);
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('✅ User signed in successfully with UID:', userCredential.user.uid);
    return userCredential.user;
  } catch (error: any) {
    console.error('❌ Error signing in user:', error);
    console.error('Sign-in error details:', { email, errorMessage: error.message, errorCode: error.code });
    throw new Error(error.message);
  }
}

// Sign out current user
export async function signOutUser(): Promise<void> {
  console.log('🚪 Signing out current user...');
  try {
    await signOut(auth);
    console.log('✅ User signed out successfully');
  } catch (error: any) {
    console.error('❌ Error signing out user:', error);
    throw new Error(error.message);
  }
}

// Get user profile from Firestore
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  console.log('👤 Fetching user profile for UID:', uid);
  try {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const profile = docSnap.data() as UserProfile;
      console.log('✅ User profile found:', profile);
      return profile;
    } else {
      console.log('⚠️ No user profile found for UID:', uid);
      return null;
    }
  } catch (error: any) {
    console.error('❌ Error fetching user profile:', error);
    console.error('Profile fetch error details:', { uid, errorMessage: error.message, errorCode: error.code });
    return null;
  }
}

// Admin function to approve funeral director
export async function approveFuneralDirector(uid: string, adminUid: string): Promise<void> {
  console.log('👨‍💼 Admin approving funeral director:', uid);
  try {
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }
    
    const userData = userDoc.data() as UserProfile;
    if (userData.role !== 'FuneralDirector') {
      throw new Error('User is not a funeral director');
    }
    
    await setDoc(userRef, {
      ...userData,
      approved: true,
      approvedAt: new Date(),
      approvedBy: adminUid,
      updatedAt: new Date()
    });
    
    console.log('✅ Funeral director approved successfully');
  } catch (error: any) {
    console.error('❌ Error approving funeral director:', error);
    throw new Error(error.message);
  }
}

// Admin function to reject funeral director
export async function rejectFuneralDirector(uid: string, adminUid: string): Promise<void> {
  console.log('👨‍💼 Admin rejecting funeral director:', uid);
  try {
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }
    
    const userData = userDoc.data() as UserProfile;
    if (userData.role !== 'FuneralDirector') {
      throw new Error('User is not a funeral director');
    }
    
    await setDoc(userRef, {
      ...userData,
      approved: false,
      approvedAt: new Date(),
      approvedBy: adminUid,
      updatedAt: new Date()
    });
    
    console.log('✅ Funeral director rejected successfully');
  } catch (error: any) {
    console.error('❌ Error rejecting funeral director:', error);
    throw new Error(error.message);
  }
}

// Get pending funeral directors for admin approval
export async function getPendingFuneralDirectors(): Promise<UserProfile[]> {
  console.log('👨‍💼 Fetching pending funeral directors...');
  try {
    const usersRef = collection(db, 'users');
    const q = query(
      usersRef, 
      where('role', '==', 'FuneralDirector'),
      where('approved', '==', false)
    );
    
    const querySnapshot = await getDocs(q);
    const pendingDirectors: UserProfile[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data() as UserProfile;
      pendingDirectors.push(data);
    });
    
    console.log(`✅ Found ${pendingDirectors.length} pending funeral directors`);
    return pendingDirectors;
  } catch (error: any) {
    console.error('❌ Error fetching pending funeral directors:', error);
    throw new Error(error.message);
  }
}

// Auth state observer
export function onAuthStateChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}
