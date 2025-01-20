import React, { useState } from 'react';
import { storage } from '../lib/firebase/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const ImageUpload = ({ onImageUpload }) => {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const storageRef = ref(storage, `uploads/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      onImageUpload(url);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full">
      <label className="block w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-purple-500">
        <input
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
        />
        {uploading ? (
          <span>Uploading...</span>
        ) : (
          <span>Click or drag to upload your photo</span>
        )}
      </label>
    </div>
  );
};

export default ImageUpload;