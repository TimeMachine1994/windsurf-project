import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from './config';
import { generatePassword, generateMemorialSlug } from '$lib/utils/password';
import type { UserProfile } from './auth';

export interface Memorial {
  id: string;
  lovedOneName: string;
  customUrl: string;
  creatorUid: string;
  creatorName: string;
  creatorPhone: string;
  creatorEmail: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MemorialCreationData {
  lovedOneName: string;
  creatorName: string;
  creatorPhone: string;
  creatorEmail: string;
}

// Check if custom URL is available
export async function isUrlAvailable(customUrl: string): Promise<boolean> {
  console.log('🔍 Checking URL availability for:', customUrl);
  try {
    // Direct document check instead of query to avoid rules issues
    const docRef = doc(db, 'memorials', customUrl);
    console.log('📄 Getting document reference for:', customUrl);
    const docSnap = await getDoc(docRef);
    const isAvailable = !docSnap.exists();
    console.log('✅ URL availability result:', { customUrl, isAvailable, exists: docSnap.exists() });
    return isAvailable;
  } catch (error: any) {
    console.error('❌ Error checking URL availability:', error);
    console.error('Error details:', { customUrl, errorMessage: error.message, errorCode: error.code });
    
    // If we get a permission denied error, generate a random suffix to ensure uniqueness
    // This happens when Firestore rules block unauthenticated reads
    if (error.code === 'permission-denied') {
      console.log('⚠️ Permission denied - will add random suffix to ensure uniqueness:', customUrl);
      return false; // Force adding a random suffix
    }
    
    // For other errors, assume URL might be taken to be safe
    console.log('⚠️ Unknown error - assuming URL might be taken for safety:', customUrl);
    return false;
  }
}

// Create memorial and register user
export async function createMemorialAndUser(data: MemorialCreationData): Promise<{
  memorial: Memorial;
  user: UserProfile;
  generatedPassword: string;
  customUrl: string;
}> {
  console.log('🚀 Starting memorial creation process with data:', data);
  try {
    // Generate password and custom URL
    console.log('🔑 Generating password...');
    const generatedPassword = generatePassword(12);
    console.log('✅ Password generated successfully (length:', generatedPassword.length, ')');
    
    console.log('🔗 Generating custom URL from loved one name:', data.lovedOneName);
    let customUrl = generateMemorialSlug(data.lovedOneName);
    console.log('📝 Initial custom URL generated:', customUrl);
    
    // Ensure URL is unique by adding number or random suffix if needed
    let counter = 1;
    let baseUrl = customUrl;
    console.log('🔍 Checking URL uniqueness...');
    while (!(await isUrlAvailable(customUrl))) {
      if (counter <= 3) {
        console.log('⚠️ URL already exists, trying variant:', `${baseUrl}-${counter}`);
        customUrl = `${baseUrl}-${counter}`;
        counter++;
      } else {
        // After 3 attempts, add random suffix to ensure uniqueness
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        customUrl = `${baseUrl}-${randomSuffix}`;
        console.log('⚠️ Adding random suffix for uniqueness:', customUrl);
        break; // Exit loop since random suffix should be unique
      }
    }
    console.log('✅ Final unique URL confirmed:', customUrl);
    
    // Create user account
    console.log('👤 Creating user account for email:', data.creatorEmail);
    const userCredential = await createUserWithEmailAndPassword(auth, data.creatorEmail, generatedPassword);
    const user = userCredential.user;
    console.log('✅ User account created successfully with UID:', user.uid);
    
    // Wait for auth state to be properly set
    console.log('⏳ Waiting for authentication state to be established...');
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Verify user is authenticated
    if (!auth.currentUser) {
      throw new Error('User authentication failed - currentUser is null');
    }
    console.log('✅ User authentication confirmed, currentUser UID:', auth.currentUser.uid);
    
    // Create user profile in Firestore with Owner role
    console.log('📝 Creating user profile in Firestore...');
    const userProfile: UserProfile = {
      uid: user.uid,
      email: user.email!,
      displayName: data.creatorName,
      phone: data.creatorPhone,
      role: 'Owner',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    console.log('👤 User profile data:', userProfile);
    
    await setDoc(doc(db, 'users', user.uid), userProfile);
    console.log('✅ User profile saved to Firestore');
    
    // Create memorial document
    console.log('🕯️ Creating memorial document...');
    const memorial: Memorial = {
      id: customUrl, // Use custom URL as document ID
      lovedOneName: data.lovedOneName,
      customUrl: customUrl,
      creatorUid: user.uid,
      creatorName: data.creatorName,
      creatorPhone: data.creatorPhone,
      creatorEmail: data.creatorEmail,
      isPublic: false, // Default to private
      createdAt: new Date(),
      updatedAt: new Date()
    };
    console.log('📄 Memorial data:', memorial);
    
    try {
      await setDoc(doc(db, 'memorials', customUrl), memorial);
      console.log('✅ Memorial document saved to Firestore with ID:', customUrl);
    } catch (memorialError: any) {
      console.error('❌ Failed to create memorial document:', memorialError);
      console.error('Memorial creation error details:', {
        customUrl,
        userUid: user.uid,
        isAuthenticated: !!auth.currentUser,
        errorCode: memorialError.code,
        errorMessage: memorialError.message
      });
      throw new Error(`Failed to create memorial: ${memorialError.message}`);
    }
    
    console.log('🎉 Memorial creation process completed successfully!');
    return {
      memorial,
      user: userProfile,
      generatedPassword,
      customUrl
    };
  } catch (error: any) {
    console.error('❌ Error in createMemorialAndUser:', error);
    console.error('Error details:', { message: error.message, code: error.code, stack: error.stack });
    throw new Error(error.message);
  }
}

// Get memorial by custom URL
export async function getMemorialByUrl(customUrl: string): Promise<Memorial | null> {
  try {
    const docRef = doc(db, 'memorials', customUrl);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as Memorial;
    } else {
      return null;
    }
  } catch (error: any) {
    console.error('Error fetching memorial:', error);
    return null;
  }
}

// Get memorial by creator UID
export async function getMemorialByCreatorUid(creatorUid: string): Promise<Memorial | null> {
  try {
    console.log('🔍 Searching for memorial by creator UID:', creatorUid);
    const q = query(collection(db, 'memorials'), where('creatorUid', '==', creatorUid));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const memorial = querySnapshot.docs[0].data() as Memorial;
      console.log('✅ Memorial found for creator:', memorial);
      return memorial;
    } else {
      console.log('❌ No memorial found for creator UID:', creatorUid);
      return null;
    }
  } catch (error: any) {
    console.error('❌ Error fetching memorial by creator UID:', error);
    return null;
  }
}
