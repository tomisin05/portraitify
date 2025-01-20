import React, { useState } from 'react';
import ImageUpload from '../components/ImageUpload';
import { trainModel, generateImage } from '../lib/fai/client';
import { db } from '../lib/firebase/config';
import { collection, addDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

const Create = () => {
  const { user } = useAuth();
  const [uploadedImage, setUploadedImage] = useState(null);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    attire: '',
    setting: '',
    style: '',
    lighting: '',
    additional: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (url) => {
    setUploadedImage(url);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!uploadedImage || !user) return;

    try {
      setLoading(true);
      
      // Generate prompt from form data
      const prompt = `Professional portrait photo of a person wearing ${formData.attire} in a ${formData.setting} setting. 
        Style: ${formData.style}. Lighting: ${formData.lighting}. ${formData.additional}`;

      // Train model
      const trainResult = await trainModel(uploadedImage, prompt);
      
      // Generate image
      const generateResult = await generateImage(trainResult.model_id, prompt);
      
      setGeneratedImage(generateResult.image_url);

      // Save to Firebase
      await addDoc(collection(db, 'portraits'), {
        userId: user.uid,
        originalImage: uploadedImage,
        generatedImage: generateResult.image_url,
        prompt,
        createdAt: new Date().toISOString(),
      });

    } catch (error) {
      console.error('Error:', error);
      alert('Failed to generate portrait');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Create Your Professional Portrait</h1>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">1. Upload Your Photo</h2>
          <ImageUpload onImageUpload={handleImageUpload} />
          
          {uploadedImage && (
            <div className="mt-4">
              <img src={uploadedImage} alt="Uploaded" className="max-w-full rounded-lg" />
            </div>
          )}
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">2. Customize Your Portrait</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Desired Attire</label>
              <input
                type="text"
                name="attire"
                value={formData.attire}
                onChange={handleInputChange}
                placeholder="e.g., Business suit, Casual professional"
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Setting</label>
              <input
                type="text"
                name="setting"
                value={formData.setting}
                onChange={handleInputChange}
                placeholder="e.g., Office, Studio, Natural outdoors"
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Style</label>
              <select
                name="style"
                value={formData.style}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Select style</option>
                <option value="professional">Professional</option>
                <option value="creative">Creative</option>
                <option value="casual">Casual Professional</option>
                <option value="formal">Formal</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Lighting</label>
              <select
                name="lighting"
                value={formData.lighting}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Select lighting</option>
                <option value="natural">Natural</option>
                <option value="studio">Studio</option>
                <option value="dramatic">Dramatic</option>
                <option value="soft">Soft</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Additional Details</label>
              <textarea
                name="additional"
                value={formData.additional}
                onChange={handleInputChange}
                placeholder="Any additional details or preferences"
                className="w-full p-2 border rounded"
                rows="3"
              />
            </div>

            <button
              type="submit"
              disabled={!uploadedImage || loading}
              className={`w-full p-3 rounded-lg text-white font-semibold ${
                !uploadedImage || loading
                  ? 'bg-gray-400'
                  : 'bg-purple-600 hover:bg-purple-700'
              }`}
            >
              {loading ? 'Generating...' : 'Generate Portrait'}
            </button>
          </form>
        </div>
      </div>

      {generatedImage && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Your Generated Portrait</h2>
          <img src={generatedImage} alt="Generated Portrait" className="max-w-full rounded-lg" />
        </div>
      )}
    </div>
  );
};

export default Create;