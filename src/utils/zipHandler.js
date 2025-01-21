// utils/zipHandler.js

import { ref, uploadBytes, getDownloadURL, getStorage } from 'firebase/storage';
import { storage } from '../lib/firebase/config';
import JSZip from 'jszip';



// export const createZipFromImages = async (imageFiles) => {
//   const zip = new JSZip();

//   // Add images to zip
//   for (let i = 0; i < imageFiles.length; i++) {
//     const file = imageFiles[i];
//     zip.file(`image_${i + 1}.jpg`, file);
//   }

//   // Generate zip file
//   const zipBlob = await zip.generateAsync({ type: 'blob' });
//   return zipBlob;
// };

export const createZipFromImages = async (images) => {
  const zip = new JSZip();
  const storage = getStorage();
  
  try {
    for (let i = 0; i < images.length; i++) {
      const imageRef = ref(storage, images[i]);
      const downloadURL = await getDownloadURL(imageRef);
      const response = await fetch(downloadURL);
      const blob = await response.blob();
      const extension = blob.type.split('/')[1] || 'jpg';
      zip.file(`image_${i + 1}.${extension}`, blob);
    }

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
