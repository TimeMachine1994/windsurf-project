import { doc, setDoc, getDoc, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from './config';
import type { CalculatorFormData, BookingItem, LivestreamConfig } from '$lib/types/livestream';

export interface LivestreamConfigFirestore extends Omit<LivestreamConfig, 'createdAt' | 'updatedAt'> {
	createdAt: Timestamp;
	updatedAt: Timestamp;
}

// Save livestream configuration to Firestore
export async function saveLivestreamConfig(
	memorialId: string,
	formData: CalculatorFormData,
	bookingItems: BookingItem[],
	total: number,
	currentStep: 'tier' | 'details' | 'addons' | 'payment'
): Promise<{ success: boolean; configId: string; error?: string }> {
	try {
		console.log('💾 Saving livestream config to Firestore:', { memorialId, currentStep, total });
		
		const configRef = doc(db, 'livestreamConfigs', memorialId);
		
		const configData: Partial<LivestreamConfigFirestore> = {
			memorialId,
			formData,
			bookingItems,
			total,
			currentStep,
			updatedAt: serverTimestamp() as Timestamp
		};

		// Check if config already exists
		const existingDoc = await getDoc(configRef);
		
		if (existingDoc.exists()) {
			// Update existing config
			await updateDoc(configRef, configData);
			console.log('✅ Livestream config updated successfully');
		} else {
			// Create new config
			await setDoc(configRef, {
				...configData,
				createdAt: serverTimestamp() as Timestamp
			});
			console.log('✅ Livestream config created successfully');
		}

		return {
			success: true,
			configId: memorialId
		};
	} catch (error) {
		console.error('❌ Error saving livestream config:', error);
		return {
			success: false,
			configId: memorialId,
			error: error instanceof Error ? error.message : 'Unknown error'
		};
	}
}

// Load livestream configuration from Firestore
export async function getLivestreamConfig(memorialId: string): Promise<LivestreamConfig | null> {
	try {
		console.log('📖 Loading livestream config from Firestore:', memorialId);
		
		const configRef = doc(db, 'livestreamConfigs', memorialId);
		const configDoc = await getDoc(configRef);
		
		if (!configDoc.exists()) {
			console.log('📭 No livestream config found for memorial:', memorialId);
			return null;
		}

		const data = configDoc.data() as LivestreamConfigFirestore;
		
		// Convert Firestore timestamps to JavaScript Dates
		const config: LivestreamConfig = {
			...data,
			id: configDoc.id,
			createdAt: data.createdAt.toDate(),
			updatedAt: data.updatedAt.toDate()
		};

		console.log('✅ Livestream config loaded successfully:', config);
		return config;
	} catch (error) {
		console.error('❌ Error loading livestream config:', error);
		return null;
	}
}

// Delete livestream configuration
export async function deleteLivestreamConfig(memorialId: string): Promise<boolean> {
	try {
		console.log('🗑️ Deleting livestream config:', memorialId);
		
		const configRef = doc(db, 'livestreamConfigs', memorialId);
		await updateDoc(configRef, {
			updatedAt: serverTimestamp()
		});
		
		console.log('✅ Livestream config deleted successfully');
		return true;
	} catch (error) {
		console.error('❌ Error deleting livestream config:', error);
		return false;
	}
}

// Check if livestream config exists for memorial
export async function hasLivestreamConfig(memorialId: string): Promise<boolean> {
	try {
		const configRef = doc(db, 'livestreamConfigs', memorialId);
		const configDoc = await getDoc(configRef);
		return configDoc.exists();
	} catch (error) {
		console.error('❌ Error checking livestream config existence:', error);
		return false;
	}
}
