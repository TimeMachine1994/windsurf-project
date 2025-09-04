import { ref, uploadBytes, getDownloadURL, deleteObject, listAll } from 'firebase/storage';
import { storage } from './config';
import { doc, setDoc, getDoc, collection, query, orderBy, getDocs, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from './config';

export interface SlideshowPhoto {
  id: string;
  memorialId: string;
  fileName: string;
  originalName: string;
  downloadUrl: string;
  order: number;
  uploadedAt: Date;
  uploadedBy: string;
  size: number;
  mimeType: string;
}

// Upload photo to Firebase Storage and save metadata to Firestore
export async function uploadSlideshowPhoto(
  memorialId: string,
  file: File,
  userUid: string
): Promise<SlideshowPhoto> {
  console.log('📸 Starting photo upload for memorial:', memorialId);
  
  try {
    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `${timestamp}_${Math.random().toString(36).substring(2)}.${fileExtension}`;
    
    // Create storage reference
    const storageRef = ref(storage, `memorials/${memorialId}/slideshow/${fileName}`);
    
    console.log('⬆️ Uploading file to storage:', fileName);
    
    // Upload file
    const snapshot = await uploadBytes(storageRef, file);
    console.log('✅ File uploaded successfully');
    
    // Get download URL
    const downloadUrl = await getDownloadURL(snapshot.ref);
    console.log('🔗 Download URL obtained:', downloadUrl);
    
    // Get current photo count to determine order
    const photosRef = collection(db, 'memorials', memorialId, 'slideshow');
    const photosQuery = query(photosRef, orderBy('order', 'desc'));
    const photosSnapshot = await getDocs(photosQuery);
    const nextOrder = photosSnapshot.empty ? 0 : (photosSnapshot.docs[0].data().order + 1);
    
    // Create photo metadata
    const photoId = `${timestamp}_${Math.random().toString(36).substring(2)}`;
    const photoData: SlideshowPhoto = {
      id: photoId,
      memorialId,
      fileName,
      originalName: file.name,
      downloadUrl,
      order: nextOrder,
      uploadedAt: new Date(),
      uploadedBy: userUid,
      size: file.size,
      mimeType: file.type
    };
    
    // Save metadata to Firestore
    await setDoc(doc(db, 'memorials', memorialId, 'slideshow', photoId), photoData);
    console.log('✅ Photo metadata saved to Firestore');
    
    return photoData;
  } catch (error: any) {
    console.error('❌ Error uploading photo:', error);
    throw new Error(`Failed to upload photo: ${error.message}`);
  }
}

// Get all slideshow photos for a memorial, ordered by their position
export async function getSlideshowPhotos(memorialId: string): Promise<SlideshowPhoto[]> {
  console.log('📷 Fetching slideshow photos for memorial:', memorialId);
  
  try {
    const photosRef = collection(db, 'memorials', memorialId, 'slideshow');
    const photosQuery = query(photosRef, orderBy('order', 'asc'));
    const photosSnapshot = await getDocs(photosQuery);
    
    const photos: SlideshowPhoto[] = [];
    photosSnapshot.forEach((doc) => {
      const data = doc.data() as SlideshowPhoto;
      // Convert Firestore timestamp to Date if needed
      if (data.uploadedAt && typeof data.uploadedAt === 'object' && 'toDate' in data.uploadedAt) {
        data.uploadedAt = (data.uploadedAt as any).toDate();
      }
      photos.push(data);
    });
    
    console.log(`✅ Found ${photos.length} slideshow photos`);
    return photos;
  } catch (error: any) {
    console.error('❌ Error fetching slideshow photos:', error);
    throw new Error(`Failed to fetch slideshow photos: ${error.message}`);
  }
}

// Update the order of slideshow photos
export async function updatePhotoOrder(
  memorialId: string,
  photoUpdates: { id: string; order: number }[]
): Promise<void> {
  console.log('🔄 Updating photo order for memorial:', memorialId);
  
  try {
    // Update each photo's order in Firestore
    const updatePromises = photoUpdates.map(async ({ id, order }) => {
      const photoRef = doc(db, 'memorials', memorialId, 'slideshow', id);
      await updateDoc(photoRef, { order });
    });
    
    await Promise.all(updatePromises);
    console.log('✅ Photo order updated successfully');
  } catch (error: any) {
    console.error('❌ Error updating photo order:', error);
    throw new Error(`Failed to update photo order: ${error.message}`);
  }
}

// Delete a slideshow photo
export async function deleteSlideshowPhoto(
  memorialId: string,
  photoId: string
): Promise<void> {
  console.log('🗑️ Deleting slideshow photo:', photoId);
  
  try {
    // Get photo metadata first
    const photoRef = doc(db, 'memorials', memorialId, 'slideshow', photoId);
    const photoDoc = await getDoc(photoRef);
    
    if (!photoDoc.exists()) {
      throw new Error('Photo not found');
    }
    
    const photoData = photoDoc.data() as SlideshowPhoto;
    
    // Delete from Firebase Storage
    const storageRef = ref(storage, `memorials/${memorialId}/slideshow/${photoData.fileName}`);
    await deleteObject(storageRef);
    console.log('✅ Photo deleted from storage');
    
    // Delete metadata from Firestore
    await deleteDoc(photoRef);
    console.log('✅ Photo metadata deleted from Firestore');
    
  } catch (error: any) {
    console.error('❌ Error deleting photo:', error);
    throw new Error(`Failed to delete photo: ${error.message}`);
  }
}

// Get photo by ID
export async function getSlideshowPhoto(
  memorialId: string,
  photoId: string
): Promise<SlideshowPhoto | null> {
  try {
    const photoRef = doc(db, 'memorials', memorialId, 'slideshow', photoId);
    const photoDoc = await getDoc(photoRef);
    
    if (!photoDoc.exists()) {
      return null;
    }
    
    const data = photoDoc.data() as SlideshowPhoto;
    // Convert Firestore timestamp to Date if needed
    if (data.uploadedAt && typeof data.uploadedAt === 'object' && 'toDate' in data.uploadedAt) {
      data.uploadedAt = (data.uploadedAt as any).toDate();
    }
    
    return data;
  } catch (error: any) {
    console.error('❌ Error fetching photo:', error);
    return null;
  }
}
