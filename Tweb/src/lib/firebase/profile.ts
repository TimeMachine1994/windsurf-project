import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { updateEmail, updatePassword, sendEmailVerification, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { db, auth } from './config';
import type { UserProfile } from './auth';

export interface ProfileUpdateData {
	displayName?: string;
	phone?: string;
}

export interface EmailUpdateRequest {
	newEmail: string;
	currentPassword: string;
}

export interface PasswordUpdateRequest {
	newPassword: string;
}

// Update profile information (name, phone)
export async function updateProfile(updates: ProfileUpdateData): Promise<{ success: boolean; error?: string }> {
	try {
		if (!auth.currentUser) {
			throw new Error('User not authenticated');
		}

		console.log('📝 Updating profile for user:', auth.currentUser.uid);
		
		const userRef = doc(db, 'users', auth.currentUser.uid);
		const updateData = {
			...updates,
			updatedAt: new Date()
		};

		await updateDoc(userRef, updateData);
		console.log('✅ Profile updated successfully');

		return { success: true };
	} catch (error: any) {
		console.error('❌ Error updating profile:', error);
		return { 
			success: false, 
			error: error.message || 'Failed to update profile'
		};
	}
}

// Request email change (requires password confirmation)
export async function requestEmailChange(request: EmailUpdateRequest): Promise<{ success: boolean; error?: string }> {
	try {
		if (!auth.currentUser || !auth.currentUser.email) {
			throw new Error('User not authenticated');
		}

		console.log('📧 Requesting email change for user:', auth.currentUser.uid);

		// Re-authenticate user with current password
		const credential = EmailAuthProvider.credential(auth.currentUser.email, request.currentPassword);
		await reauthenticateWithCredential(auth.currentUser, credential);
		console.log('✅ User re-authenticated successfully');

		// Update email in Firebase Auth
		await updateEmail(auth.currentUser, request.newEmail);
		console.log('✅ Email updated in Firebase Auth');

		// Send verification email to new address
		await sendEmailVerification(auth.currentUser);
		console.log('✅ Verification email sent to new address');

		// Update email in Firestore user profile
		const userRef = doc(db, 'users', auth.currentUser.uid);
		await updateDoc(userRef, {
			email: request.newEmail,
			emailVerified: false,
			updatedAt: new Date()
		});
		console.log('✅ Email updated in Firestore');

		return { success: true };
	} catch (error: any) {
		console.error('❌ Error updating email:', error);
		let errorMessage = 'Failed to update email';
		
		if (error.code === 'auth/wrong-password') {
			errorMessage = 'Current password is incorrect';
		} else if (error.code === 'auth/email-already-in-use') {
			errorMessage = 'This email is already in use by another account';
		} else if (error.code === 'auth/invalid-email') {
			errorMessage = 'Invalid email address';
		}

		return { 
			success: false, 
			error: errorMessage
		};
	}
}

// Update password (no current password required)
export async function updateUserPassword(request: PasswordUpdateRequest): Promise<{ success: boolean; error?: string }> {
	try {
		if (!auth.currentUser) {
			throw new Error('User not authenticated');
		}

		console.log('🔐 Updating password for user:', auth.currentUser.uid);

		// Update password directly
		await updatePassword(auth.currentUser, request.newPassword);
		console.log('✅ Password updated successfully');

		// Update timestamp in Firestore
		const userRef = doc(db, 'users', auth.currentUser.uid);
		await updateDoc(userRef, {
			updatedAt: new Date()
		});

		return { success: true };
	} catch (error: any) {
		console.error('❌ Error updating password:', error);
		let errorMessage = 'Failed to update password';
		
		if (error.code === 'auth/weak-password') {
			errorMessage = 'New password is too weak. Please choose a stronger password.';
		}

		return { 
			success: false, 
			error: errorMessage
		};
	}
}

// Get current user profile
export async function getCurrentUserProfile(): Promise<UserProfile | null> {
	try {
		if (!auth.currentUser) {
			return null;
		}

		const userRef = doc(db, 'users', auth.currentUser.uid);
		const userDoc = await getDoc(userRef);
		
		if (userDoc.exists()) {
			return userDoc.data() as UserProfile;
		}
		
		return null;
	} catch (error: any) {
		console.error('❌ Error getting user profile:', error);
		return null;
	}
}

// Refresh user profile in auth store
export async function refreshUserProfile(): Promise<UserProfile | null> {
	try {
		const profile = await getCurrentUserProfile();
		if (profile) {
			// Update the auth store with fresh profile data
			// This would typically be handled by your auth store
			console.log('✅ Profile refreshed:', profile);
		}
		return profile;
	} catch (error: any) {
		console.error('❌ Error refreshing profile:', error);
		return null;
	}
}
