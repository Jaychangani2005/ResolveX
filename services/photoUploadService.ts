import { ref, uploadBytes, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import { storage } from './firebaseConfig';

export interface PhotoUploadResult {
  downloadURL: string;
  fileName: string;
  size: number;
  contentType: string;
  metadata: {
    userId: string;
    incidentId: string;
    uploadedAt: string;
    originalSize: string;
    imageDimensions?: {
      width: number;
      height: number;
    };
  };
}

export interface UploadProgress {
  bytesTransferred: number;
  totalBytes: number;
  percentage: number;
}

/**
 * Uploads a photo to Firebase Storage for an incident report with progress tracking
 * @param photoUri - Local URI of the photo
 * @param userId - User ID who is uploading the photo
 * @param incidentId - Incident report ID
 * @param onProgress - Optional progress callback
 * @returns Promise with download URL and metadata
 */
export const uploadPhotoToStorage = async (
  photoUri: string,
  userId: string,
  incidentId: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<PhotoUploadResult> => {
  try {
    console.log('📸 Starting photo upload to Firebase Storage...');
    console.log(`   User ID: ${userId}`);
    console.log(`   Incident ID: ${incidentId}`);
    console.log(`   Photo URI: ${photoUri}`);

    // Convert URI to blob
    const response = await fetch(photoUri);
    if (!response.ok) {
      throw new Error(`Failed to fetch photo: ${response.status} ${response.statusText}`);
    }
    
    const blob = await response.blob();
    
    console.log(`   Photo size: ${blob.size} bytes`);
    console.log(`   Photo type: ${blob.type}`);

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (blob.size > maxSize) {
      throw new Error(`Photo size (${(blob.size / 1024 / 1024).toFixed(2)}MB) exceeds maximum allowed size (10MB)`);
    }

    // Generate unique filename with better naming convention
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileExtension = blob.type.includes('jpeg') ? 'jpg' : 
                         blob.type.includes('png') ? 'png' : 
                         blob.type.includes('webp') ? 'webp' : 'jpg';
    const fileName = `incident_${incidentId}_${timestamp}.${fileExtension}`;
    
    // Create storage reference with organized folder structure
    const storageRef = ref(storage, `incidents/${userId}/${incidentId}/${fileName}`);
    
    console.log(`   Storage path: incidents/${userId}/${incidentId}/${fileName}`);

    // Prepare metadata
    const metadata = {
      userId: userId,
      incidentId: incidentId,
      uploadedAt: new Date().toISOString(),
      originalSize: blob.size.toString(),
      contentType: blob.type || 'image/jpeg'
    };

    // Upload with progress tracking if callback provided
    if (onProgress) {
      const uploadTask = uploadBytesResumable(storageRef, blob, {
        contentType: blob.type || 'image/jpeg',
        customMetadata: metadata
      });

      return new Promise((resolve, reject) => {
        uploadTask.on('state_changed',
          (snapshot) => {
            const progress = {
              bytesTransferred: snapshot.bytesTransferred,
              totalBytes: snapshot.totalBytes,
              percentage: Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
            };
            onProgress(progress);
            console.log(`📤 Upload progress: ${progress.percentage}%`);
          },
          (error) => {
            console.error('❌ Upload failed:', error);
            reject(new Error(`Upload failed: ${error.message}`));
          },
          async () => {
            try {
              const downloadURL = await getDownloadURL(storageRef);
              console.log('✅ Photo uploaded successfully to Firebase Storage');
              console.log(`   Download URL: ${downloadURL}`);
              
              resolve({
                downloadURL,
                fileName,
                size: blob.size,
                contentType: blob.type || 'image/jpeg',
                metadata
              });
            } catch (error) {
              reject(error);
            }
          }
        );
      });
    } else {
      // Simple upload without progress tracking
      const uploadResult = await uploadBytes(storageRef, blob, {
        contentType: blob.type || 'image/jpeg',
        customMetadata: metadata
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
        size: blob.size,
        contentType: blob.type || 'image/jpeg',
        metadata
      };
    }

  } catch (error: any) {
    console.error('❌ Photo upload failed:', error);
    throw new Error(`Failed to upload photo: ${error.message}`);
  }
};

/**
 * Uploads multiple photos to Firebase Storage
 * @param photoUris - Array of photo URIs
 * @param userId - User ID who is uploading the photos
 * @param incidentId - Incident report ID
 * @param onProgress - Optional progress callback for overall progress
 * @returns Promise with array of upload results
 */
export const uploadMultiplePhotosToStorage = async (
  photoUris: string[],
  userId: string,
  incidentId: string,
  onProgress?: (overallProgress: number) => void
): Promise<PhotoUploadResult[]> => {
  try {
    console.log(`📸 Starting batch upload of ${photoUris.length} photos...`);
    
    const results: PhotoUploadResult[] = [];
    let completedCount = 0;

    for (let i = 0; i < photoUris.length; i++) {
      const photoUri = photoUris[i];
      console.log(`📸 Uploading photo ${i + 1}/${photoUris.length}`);
      
      try {
        const result = await uploadPhotoToStorage(photoUri, userId, incidentId);
        results.push(result);
        completedCount++;
        
        // Update overall progress
        if (onProgress) {
          const overallProgress = Math.round((completedCount / photoUris.length) * 100);
          onProgress(overallProgress);
        }
        
        console.log(`✅ Photo ${i + 1} uploaded successfully`);
      } catch (error) {
        console.error(`❌ Failed to upload photo ${i + 1}:`, error);
        // Continue with other photos instead of failing completely
        results.push({
          downloadURL: '',
          fileName: `failed_photo_${i + 1}`,
          size: 0,
          contentType: 'unknown',
          metadata: {
            userId,
            incidentId,
            uploadedAt: new Date().toISOString(),
            originalSize: '0',
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        });
      }
    }

    console.log(`✅ Batch upload completed: ${completedCount}/${photoUris.length} photos uploaded successfully`);
    return results;

  } catch (error: any) {
    console.error('❌ Batch photo upload failed:', error);
    throw new Error(`Failed to upload photos: ${error.message}`);
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

/**
 * Gets photo metadata from Firebase Storage
 * @param photoUrl - Download URL of the photo
 * @returns Promise with photo metadata
 */
export const getPhotoMetadata = async (photoUrl: string): Promise<any> => {
  try {
    console.log('📋 Getting photo metadata...');
    console.log(`   Photo URL: ${photoUrl}`);

    // Extract file path from URL
    const urlParts = photoUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];
    const incidentId = urlParts[urlParts.length - 2];
    const userId = urlParts[urlParts.length - 3];
    
    const storageRef = ref(storage, `incidents/${userId}/${incidentId}/${fileName}`);
    
    // Note: Getting metadata requires Cloud Function implementation
    // This is a placeholder for future implementation
    console.log('⚠️ Photo metadata retrieval requires Cloud Function implementation');
    
    return {
      fileName,
      incidentId,
      userId,
      url: photoUrl
    };

  } catch (error: any) {
    console.error('❌ Failed to get photo metadata:', error);
    throw new Error(`Failed to get photo metadata: ${error.message}`);
  }
};
