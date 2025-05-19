// utils/zipHandler.js

import { ref, uploadBytes, getDownloadURL, getStorage } from 'firebase/storage';
import { storage } from '../lib/firebase/config';
import JSZip from 'jszip';

export const createZipFromImages = async (images) => {
  const zip = new JSZip();
  const storage = getStorage();
  
  try {
    // Validate images array
    if (!images || images.length === 0) {
      throw new Error('No images provided for zip creation');
    }
    
    console.log(`Creating zip with ${images.length} images:`, images);
    
    // Process each image URL
    for (let i = 0; i < images.length; i++) {
      try {
        const imageRef = ref(storage, images[i]);
        const downloadURL = await getDownloadURL(imageRef);
        const response = await fetch(downloadURL);
        
        if (!response.ok) {
          console.warn(`Skipping image ${i} - fetch failed for URL: ${images[i]}`);
          continue;
        }
        
        const blob = await response.blob();
        const extension = blob.type.split('/')[1] || 'jpg';
        zip.file(`image_${i + 1}.${extension}`, blob);
        console.log(`Added image ${i + 1} to zip`);
      } catch (error) {
        console.warn(`Error processing image ${i}:`, error);
        // Continue with next image
      }
    }

    // Check if any files were added to the zip
    if (Object.keys(zip.files).length === 0) {
      throw new Error('No valid images to include in zip');
    }

    console.log(`Generating zip with ${Object.keys(zip.files).length} files`);
    const zipBlob = await zip.generateAsync({type: "blob"});
    return zipBlob;
  } catch (error) {
    console.error('Error creating zip:', error);
    throw error;
  }
};

export const uploadZipToStorage = async (zipBlob, userId) => {
  const fileName = `training_images_${Date.now()}.zip`;
  const storageRef = ref(storage, `uploads/${userId}/${fileName}`);
  
  try {
    await uploadBytes(storageRef, zipBlob);
    const zipUrl = await getDownloadURL(storageRef);
    return zipUrl;
  } catch (error) {
    console.error('Error uploading zip:', error);
    throw error;
  }
};