// import React, { useState } from 'react';
// import { storage } from '../lib/firebase/config';
// import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// const ImageUpload = ({ onImageUpload }) => {
//   const [uploading, setUploading] = useState(false);

//   const handleFileChange = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     try {
//       setUploading(true);
//       const storageRef = ref(storage, `uploads/${Date.now()}_${file.name}`);
//       await uploadBytes(storageRef, file);
//       const url = await getDownloadURL(storageRef);
//       onImageUpload(url);
//     } catch (error) {
//       console.error('Error uploading image:', error);
//       alert('Failed to upload image');
//     } finally {
//       setUploading(false);
//     }
//   };

//   return (
//     <div className="w-full">
//       <label className="block w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-purple-500">
//         <input
//           type="file"
//           className="hidden"
//           accept="image/*"
//           onChange={handleFileChange}
//           disabled={uploading}
//         />
//         {uploading ? (
//           <span>Uploading...</span>
//         ) : (
//           <span>Click or drag to upload your photo</span>
//         )}
//       </label>
//     </div>
//   );
// };

// export default ImageUpload;

import React, { useState, useCallback } from 'react';
import { storage } from '../lib/firebase/config';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

const ImageUpload = ({ onImageUpload }) => {
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [dragOver, setDragOver] = useState(false);

  const validateFile = (file) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      alert(`${file.name} is not a valid image type`);
      return false;
    }
    if (file.size > maxSize) {
      alert(`${file.name} is too large (max 5MB)`);
      return false; 
    }
    return true;
  };

  const uploadFile = async (file) => {
    try {
      const storageRef = ref(storage, `uploads/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress((prev) => ({
            ...prev,
            [file.name]: progress,
          }));
        },
        (error) => {
          console.error('Error uploading:', error);
          alert(`Failed to upload ${file.name}`);
        },
        async () => {
          const url = await getDownloadURL(storageRef);
          onImageUpload(url);
          setUploadProgress((prev) => ({
            ...prev,
            [file.name]: 100,
          }));
        }
      );
    } catch (error) {
      console.error('Error:', error);
      alert(`Failed to upload ${file.name}`);
    }
  };

  const handleFiles = async (files) => {
    const validFiles = Array.from(files).filter(validateFile);
    
    if (validFiles.length === 0) return;

    setSelectedFiles((prev) => [...prev, ...validFiles]);
    setUploading(true);

    // Upload all files
    await Promise.all(validFiles.map(file => uploadFile(file)));
    
    setUploading(false);
  };

  const handleFileChange = (e) => {
    handleFiles(e.target.files);
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  }, []);

  const removeFile = (fileToRemove) => {
    setSelectedFiles(files => files.filter(file => file !== fileToRemove));
    setUploadProgress(progress => {
      const newProgress = { ...progress };
      delete newProgress[fileToRemove.name];
      return newProgress;
    });
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`w-full p-4 border-2 border-dashed rounded-lg text-center cursor-pointer
          ${dragOver ? 'border-purple-500 bg-purple-50' : 'border-gray-300'}
          ${uploading ? 'opacity-50' : 'hover:border-purple-500'}`}
        onDragEnter={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={(e) => { e.preventDefault(); setDragOver(false); }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <label className="cursor-pointer w-full h-full">
          <input
            type="file"
            className="hidden"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            disabled={uploading}
          />
          <div className="space-y-2">
            <p className="text-lg">Click or drag images here</p>
            <p className="text-sm text-gray-500">Support: JPG, PNG (max 5MB)</p>
          </div>
        </label>
      </div>

      {/* Image Grid */}
      {selectedFiles.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {selectedFiles.map((file, index) => (
            <div key={`${file.name}-${index}`} className="relative">
              <div className="aspect-square relative border rounded-lg overflow-hidden">
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="w-full h-full object-cover"
                />
                
                {/* Progress Overlay */}
                {uploadProgress[file.name] && uploadProgress[file.name] < 100 && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="text-white text-center">
                      <div className="mb-1">{Math.round(uploadProgress[file.name])}%</div>
                      <div className="w-20 h-1 bg-gray-200 rounded-full">
                        <div
                          className="h-full bg-white rounded-full"
                          style={{ width: `${uploadProgress[file.name]}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Remove Button */}
                <button
                  onClick={() => removeFile(file)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                  type="button"
                >
                  ×
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500 truncate">{file.name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUpload; 




