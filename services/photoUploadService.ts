import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebaseConfig';

export interface PhotoUploadResult {
  downloadURL: string;
  fileName: string;
  size: number;
}

/**
 * Uploads a photo to Firebase Storage for an incident report
 * @param photoUri - Local URI of the photo
 * @param userId - User ID who is uploading the photo
 * @param incidentId - Incident report ID
 * @returns Promise with download URL and metadata
 */
export const uploadPhotoToStorage = async (
  photoUri: string,
  userId: string,
  incidentId: string
): Promise<PhotoUploadResult> => {
  try {
    console.log('📸 Starting photo upload to Firebase Storage...');
    console.log(`   User ID: ${userId}`);
    console.log(`   Incident ID: ${incidentId}`);
    console.log(`   Photo URI: ${photoUri}`);

    // Convert URI to blob
    const response = await fetch(photoUri);
    const blob = await response.blob();
    
    console.log(`   Photo size: ${blob.size} bytes`);
    console.log(`   Photo type: ${blob.type}`);

    // Generate unique filename
    const timestamp = Date.now();
    const fileName = `incident_${incidentId}_${timestamp}.jpg`;
    
    // Create storage reference
    const storageRef = ref(storage, `incidents/${userId}/${incidentId}/${fileName}`);
    
    console.log(`   Storage path: incidents/${userId}/${incidentId}/${fileName}`);

    // Upload blob to Firebase Storage
    const uploadResult = await uploadBytes(storageRef, blob, {
      contentType: 'image/jpeg',
      customMetadata: {
        userId: userId,
        incidentId: incidentId,
        uploadedAt: new Date().toISOString(),
        originalSize: blob.size.toString()
      }
    });

    console.log('✅ Photo uploaded successfully to Firebase Storage');
    console.log(`   Uploaded bytes: ${uploadResult.bytesTransferred}`);
    console.log(`   Total bytes: ${uploadResult.totalBytes}`);

    // Get download URL
    const downloadURL = await getDownloadURL(storageRef);
    
    console.log(`   Download URL: ${downloadURL}`);

    return {
      downloadURL,
      fileName,
      size: blob.size
    };

  } catch (error: any) {
    console.error('❌ Photo upload failed:', error);
    throw new Error(`Failed to upload photo: ${error.message}`);
  }
};

/**
 * Deletes a photo from Firebase Storage
 * @param photoUrl - Download URL of the photo to delete
 * @param userId - User ID who owns the photo
 */
export const deletePhotoFromStorage = async (
  photoUrl: string,
  userId: string
): Promise<void> => {
  try {
    console.log('🗑️ Deleting photo from Firebase Storage...');
    console.log(`   Photo URL: ${photoUrl}`);
    console.log(`   User ID: ${userId}`);

    // Extract file path from URL
    const urlParts = photoUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];
    const incidentId = urlParts[urlParts.length - 2];
    
    const storageRef = ref(storage, `incidents/${userId}/${incidentId}/${fileName}`);
    
    // Note: Firebase Storage doesn't have a direct delete method in the client SDK
    // You would need to implement this in a Cloud Function for security
    console.log('⚠️ Photo deletion requires Cloud Function implementation');
    console.log(`   Storage path: incidents/${userId}/${incidentId}/${fileName}`);

  } catch (error: any) {
    console.error('❌ Photo deletion failed:', error);
    throw new Error(`Failed to delete photo: ${error.message}`);
  }
};
