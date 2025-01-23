import React, { useState, useEffect } from 'react';
import ImageUpload from '../components/ImageUpload';
import { trainModel, generateImage } from '../lib/fai/client';
import { db } from '../lib/firebase/config';
import { collection, addDoc, query,where, getDocs, getDoc, doc, setDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { createZipFromImages, uploadZipToStorage } from '../utils/zipHandler';
import { auth } from '../lib/firebase/config';




const Create = () => {
  const { user } = useAuth();
  const [uploadedImages, setUploadedImages] = useState([]);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedModelId, setSelectedModelId] = useState(null);
  const [userModels, setUserModels] = useState([]);
  const [modelName, setModelName] = useState('');
  const [credits, setCredits] = useState(0);
  const trainingCost = 2.50; // Cost to train a model
  const generationCost = 0.25; // Cost to generate a portrait

  const userId = auth.currentUser.uid;
  const [formData, setFormData] = useState({
    attire: '',
    setting: '',
    style: '',
    lighting: '',
    pose: '',
    additional: ''
  });

  const [activeModel, setActiveModel] = useState(null); // Add this state

  // Update the model selection handler
  const handleModelSelect = (e) => {
    const modelId = e.target.value;
    setSelectedModelId(modelId);
    // Find and set the active model details
    const selected = userModels.find(model => model.modelId === modelId);
    setActiveModel(selected);
  };

  useEffect(() => {
    if (user) {
      fetchUserModels();
    }
    const fetchUserCredits = async () => {
        if (user) {
            const userRef = doc(db, 'users', user.uid); // Assuming user data is stored in 'users' collection
            const userDoc = await getDoc(userRef);
            if (userDoc.exists()) {
                setCredits(userDoc.data().credits || 0);
            }
        }
    };

    fetchUserCredits();
  }, [user]);

  const fetchUserModels = async () => {
    try {
      const modelsRef = collection(db, 'models');
      const q = query(modelsRef, where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      
      const models = [];
      querySnapshot.forEach((doc) => {
        models.push({ id: doc.id, ...doc.data() });
      });
      
      setUserModels(models);
      return models;
    } catch (error) {
      console.error('Error fetching models:', error);
    }
  };

  // Fetch user's portraits
const fetchUserPortraits = async () => {

    try {
      const portraitsRef = collection(db, 'portraits');
      const q = query(
        portraitsRef,
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const portraits = [];
      
      querySnapshot.forEach((doc) => {
        portraits.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return portraits;
    } catch (error) {
      console.error('Error fetching portraits:', error);
      throw error;
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (url) => {
    setUploadedImages(prev => [...prev, url]);
  };

const handleTrain = async () => {
    if (credits < trainingCost) {
        alert('Insufficient credits to train a model.');
        return;
    }
    if (!uploadedImages || !user || !modelName.trim()) {
        alert('Please upload an image and provide a model name');
        return;
    }

    try {
        setLoading(true);
        const zipBlob = await createZipFromImages(uploadedImages);
        console.log('Zip file created successfully.');

        // Upload the zip and get the URL
        const zipUrl = await uploadZipToStorage(zipBlob, user.uid);
        console.log('Zip file uploaded successfully. Zip URL:', zipUrl); // Log the URL of the uploaded zip file

        // Train model with the zip URL
        const trainResult = await trainModel(zipUrl, prompt);

        // Extract the LoRA weights URL from the training result
        const loraWeightsUrl = trainResult.diffusers_lora_file.url;   
        const model_id = trainResult.config_file.url;

        // Save model information to Firestore
        await addDoc(collection(db, 'models'), {
            userId: user.uid,
            name: modelName,
            modelId: model_id,
            // originalImage: uploadedImages,
            loraWeightsUrl: loraWeightsUrl, // Store the LoRA weights URL
            createdAt: new Date().toISOString(),
        });

        // Refresh the models list
        await fetchUserModels();
        setSelectedModelId(model_id);

        await updateDoc(doc(db, 'users', user.uid), {
            credits: credits - trainingCost,
        });
        setCredits(prev => prev - trainingCost);
        alert('Training completed successfully!');
    } catch (error) {
        console.error('Error training model:', error);
        alert('Failed to train model');
    } finally {
        setLoading(false);
    }
};

  const handleGenerate = async () => {
    if (credits < generationCost) {
        alert('Insufficient credits to generate a portrait.');
        return;
    }

    if (!selectedModelId || !user) {
      alert('Please select a model first');
      return;
    }

    try {
      setLoading(true);
      
      const prompt = `${userId} A highly professional portrait photo of ${userId} wearing ${formData.attire || "business casual"} in a ${formData.setting || "neutral studio background"} setting. 
      The style is ${formData.style || "modern and clean"}. 
      Lighting is ${formData.lighting || "soft natural light"}.
      The photo should feature a ${formData.pose || "confident and approachable"} pose. 
      Include ${formData.additional || "minimalistic and clean details, with a shallow depth of field for a blurred background."}`;

      const loraWeightsUrl = activeModel.loraWeightsUrl;
      
      const generateResult = await generateImage(selectedModelId, prompt, loraWeightsUrl);
      
      const newImageUrl = generateResult.data.images[0].url;

        // Fetch the existing portrait document
        const portraitRef = doc(db, 'portraits', user.uid); // Assuming user.uid is used as the document ID
        const portraitDoc = await getDoc(portraitRef);

        if (portraitDoc.exists()) {
            const portraitData = portraitDoc.data();
            const updatedImages = portraitData.generatedImages ? [...portraitData.generatedImages, newImageUrl] : [newImageUrl];

            // Update the portrait document with the new image URL
            await updateDoc(portraitRef, {
                generatedImages: updatedImages,
            });
            
            await updateDoc(doc(db, 'users', user.uid), {
                credits: credits - generationCost,
            });
            setCredits(prev => prev - generationCost);
            alert('Portrait generated successfully!');
        } else {
            // If the document does not exist, create it with the new image URL
            await setDoc(portraitRef, {
                userId: user.uid,
                generatedImages: [newImageUrl],
                createdAt: new Date().toISOString(),
            });
        }

        setGeneratedImage(newImageUrl);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to generate portrait');
    } finally {
      setLoading(false);
    }
  };


const paymentLink = 'https://buy.stripe.com/test_6oEeXC7nIeQXdA4144' // 'https://buy.stripe.com/00g7ws6B06Hz7lKfYY'; // 'https://buy.stripe.com/test_6oEeXC7nIeQXdA4144'; 

    const handleCheckout = () => {
        window.open(paymentLink, '_blank', 'noopener,noreferrer'); 
    };

// return (
//     <div className="container mx-auto px-4 py-8">
//       <h1 className="text-3xl font-bold mb-8">Create Your Professional Portrait</h1>
//       <p className="font-medium ">Your current credits: ${credits.toFixed(2)}</p>
//       <div>
//             <button 
//             className="bg-blue-500 text-white px-4 py-2 rounded"
//             onClick={handleCheckout}>
//                 Add more credits
//             </button>
//         </div>
      
     

//         {/* Training Section */}
//         <div className="mt-6 p-4 bg-white rounded-lg border">

//          {/* Model Selection Section with Active Model Display */}
//       <div className="mb-6">
//         <h2 className="text-xl font-bold mb-4">Select or Train New Model</h2>
        
//         {userModels.length >= 0 && (
//           <div className="mb-4">
//             <label className="block mb-2">Choose Existing Model:</label>
//             <select
//               value={selectedModelId || ''}
//               onChange={handleModelSelect}
//               className="w-full p-2 border rounded"
//             >
//               <option value="">Select a model</option>
//               {userModels.map((model) => (
//                 <option key={model.id} value={model.modelId}>
//                   {model.name} - {new Date(model.createdAt).toLocaleDateString()}
//                 </option>
//               ))}
//             </select>

//             {/* Active Model Display */}
//             {activeModel && (
//               <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
//                 <h3 className="font-semibold text-lg mb-2">Active Model:</h3>
//                 <div className="flex items-start space-x-4">
//                   {/* <img 
//                     src={activeModel.originalImage} 
//                     alt="Training image"
//                     className="w-24 h-24 object-cover rounded"
//                   /> */}

//                   <div>
//                     <p className="font-medium">{activeModel.name}</p>
//                     <p className="text-sm text-gray-600">

//                       Created: {new Date(activeModel.createdAt).toLocaleDateString()}
//                     </p>
//                     <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
//                       Active
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         )}


            
//           <h3 className="text-lg font-semibold mb-2">Train New Model</h3>
//           <div className="mb-4">
//             <label className="block mb-2">Model Name:</label>
//             <input
//               type="text"
//               value={modelName}
//               onChange={(e) => setModelName(e.target.value)}
//               className="w-full p-2 border rounded"
//               placeholder="Enter a name for your new model"
//             />
//           </div>

//       <div className="grid md:grid-cols-2 gap-8">
//         {/* Section for Image Upload */}
//         <div>
//           <h2 className="text-xl font-semibold mb-4">1. Upload Your Photo</h2>
//           <ImageUpload onImageUpload={handleImageUpload} />
  
//           {uploadedImages && (
//             <div className="mb-6">
//               <img src={uploadedImages} alt="Uploaded" className="max-w-sm" />
//               <button
//                 onClick={handleTrain}
//                 disabled={loading}
//                 className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
//               >
//                 {loading ? 'Training...' : 'Train Model'}
//               </button>
//             </div>
//           )}
//         </div>
        
//         {/* Section for Form Inputs */}
//         {userId && (
//           <div>
//             <h2 className="text-xl font-semibold mb-4">2. Customize Your Portrait</h2>
//             <form className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium mb-1">Desired Attire</label>
//                 <input
//                   type="text"
//                   name="attire"
//                   value={formData.attire}
//                   onChange={handleInputChange}
//                   placeholder="e.g., Business suit, Casual professional"
//                   className="w-full p-2 border rounded"
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium mb-1">Setting</label>
//                 <input
//                   type="text"
//                   name="setting"
//                   value={formData.setting}
//                   onChange={handleInputChange}
//                   placeholder="e.g., Office, Studio, Natural outdoors"
//                   className="w-full p-2 border rounded"
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium mb-1">Style</label>
//                 <select
//                   name="style"
//                   value={formData.style}
//                   onChange={handleInputChange}
//                   className="w-full p-2 border rounded"
//                   required
//                 >
//                   <option value="">Select style</option>
//                   <option value="professional">Professional</option>
//                   <option value="creative">Creative</option>
//                   <option value="casual">Casual Professional</option>
//                   <option value="formal">Formal</option>
//                 </select>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium mb-1">Lighting</label>
//                 <select
//                   name="lighting"
//                   value={formData.lighting}
//                   onChange={handleInputChange}
//                   className="w-full p-2 border rounded"
//                   required
//                 >
//                   <option value="">Select lighting</option>
//                   <option value="natural">Natural</option>
//                   <option value="studio">Studio</option>
//                   <option value="dramatic">Dramatic</option>
//                   <option value="soft">Soft</option>
//                 </select>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium mb-1">Pose</label>
//                 <select
//                   name="pose"
//                   value={formData.pose}
//                   onChange={handleInputChange}
//                   className="w-full p-2 border rounded"
//                   required
//                 >
//                   <option value="">Select pose</option>
//                   <option value="confident">Confident</option>
//                   <option value="approachable">Approachable</option>
//                   <option value="casual">Casual</option>
//                   <option value="professional">Professional</option>
//                   <option value="crossed arms">Crossed Arms</option>
//                 </select>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium mb-1">Additional Details</label>
//                 <textarea
//                   name="additional"
//                   value={formData.additional}
//                   onChange={handleInputChange}
//                   placeholder="Any additional details or preferences"
//                   className="w-full p-2 border rounded"
//                   rows="3"
//                 />
//               </div>
//               <button
//                 type="button"
//                 onClick={handleGenerate}
//                 disabled={loading}
//                 className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:bg-gray-400"
//               >
//                 {loading ? 'Generating...' : 'Generate Portrait'}
//               </button>
//             </form>
//           </div>
//         )}
//       </div>
//     </div>
//     </div>
//     </div>
//   );
  

return (
  <div className="container mx-auto px-4 py-8">
    <h1 className="text-3xl font-bold mb-8">Create Your Professional Portrait</h1>
    <p className="font-medium">Your current credits: ${credits.toFixed(2)}</p>
    <div className="mb-6">
      <button 
        className="bg-blue-500 text-white px-4 py-2 rounded"
        onClick={handleCheckout}
      >
        Add more credits
      </button>
    </div>

    {/* Model Selection Section with Active Model Display */}
    <div className="mb-6">
      <h2 className="text-xl font-bold mb-4">Select or Train New Model</h2>
      {userModels.length > 0 && (
        <div className="mb-4">
          <label className="block mb-2">Choose Existing Model:</label>
          <select
            value={selectedModelId || ''}
            onChange={handleModelSelect}
            className="w-full p-2 border rounded"
          >
            <option value="">Select a model</option>
            {userModels.map((model) => (
              <option key={model.id} value={model.modelId}>
                {model.name} - {new Date(model.createdAt).toLocaleDateString()}
              </option>
            ))}
          </select>

          {/* Active Model Display */}
          {activeModel && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
              <h3 className="font-semibold text-lg mb-2">Active Model:</h3>
              <div className="flex items-start space-x-4">
                <div>
                  <p className="font-medium">{activeModel.name}</p>
                  <p className="text-sm text-gray-600">
                    Created: {new Date(activeModel.createdAt).toLocaleDateString()}
                  </p>
                  <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Training Section */}
      <div className="mt-6 p-4 bg-white rounded-lg border">
        <h3 className="text-lg font-semibold mb-2">Train New Model</h3>
        <div className="mb-4">
          <label className="block mb-2">Model Name:</label>
          <input
            type="text"
            value={modelName}
            onChange={(e) => setModelName(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter a name for your new model"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Section for Image Upload */}
          <div>
            <h2 className="text-xl font-semibold mb-4">1. Upload Your Photo</h2>
            <ImageUpload onImageUpload={handleImageUpload} />
            {uploadedImages.length > 0 && (
              <div className="mb-6">
                <img src={uploadedImages[0]} alt="Uploaded" className="max-w-sm" />
                <button
                  onClick={handleTrain}
                  disabled={loading}
                  className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {loading ? 'Training...' : 'Train Model'}
                </button>
              </div>
            )}
          </div>

          {/* Section for Form Inputs */}
          {userId && (
            <div>
              <h2 className="text-xl font-semibold mb-4">2. Customize Your Portrait</h2>
              <form className="space-y-4">
                {['attire', 'setting', 'style', 'lighting', 'pose', 'additional'].map((field, index) => (
                  <div key={index}>
                    <label className="block text-sm font-medium mb-1">
                      {field.charAt(0).toUpperCase() + field.slice(1)}
                    </label>
                    {field === 'style' || field === 'lighting' || field === 'pose' ? (
                      <select
                        name={field}
                        value={formData[field]}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                        required
                      >
                        <option value="">Select {field}</option>
                        {/* Add options based on the field type */}
                        {field === 'style' && (
                          <>
                            <option value="professional">Professional</option>
                            <option value="creative">Creative</option>
                            <option value="casual">Casual Professional</option>
                            <option value="formal">Formal</option>
                          </>
                        )}
                        {field === 'lighting' && (
                          <>
                            <option value="natural">Natural</option>
                            <option value="studio">Studio</option>
                            <option value="dramatic">Dramatic</option>
                            <option value="soft">Soft</option>
                          </>
                        )}
                        {field === 'pose' && (
                          <>
                            <option value="confident">Confident</option>
                            <option value="approachable">Approachable</option>
                            <option value="casual">Casual</option>
                            <option value="professional">Professional</option>
                            <option value="crossed arms">Crossed Arms</option>
                          </>
                        )}
                      </select>
                    ) : (
                      <input
                        type={field === 'additional' ? 'textarea' : 'text'}
                        name={field}
                        value={formData[field]}
                        onChange={handleInputChange}
                        placeholder={`e.g., ${field === 'attire' ? 'Business suit' : 'Details'}`}
                        className="w-full p-2 border rounded"
                        required
                      />
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={loading}
                  className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:bg-gray-400"
                >
                  {loading ? 'Generating...' : 'Generate Portrait'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);



};

export default Create;

