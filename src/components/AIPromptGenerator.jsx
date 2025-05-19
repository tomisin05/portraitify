import React, { useState } from "react";
import { db } from "../lib/firebase/config";
import { collection, addDoc } from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import { GoogleGenerativeAI } from "@google/generative-ai";

const AIPromptGenerator = ({ onPromptGenerated }) => {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [userContext, setUserContext] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();
  
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const generatePrompt = async () => {
    // Check if either image or context is provided
    if (!uploadedImage && !userContext.trim()) {
      alert("Please either upload an image or provide context details");
      return;
    }

    if (!API_KEY) {
      alert("Missing Gemini API key");
      return;
    }

    setIsGenerating(true);
    try {
      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-pro-latest",
      });

      let result;
      
      if (uploadedImage) {
        // If image is provided, use vision capabilities
        const systemPrompt = userContext
          ? `Analyze this image and create a detailed portrait prompt that describes the style, lighting, pose, and mood. 
             Include these additional details: ${userContext}
             
             IMPORTANT: Create a standalone prompt that does NOT mention "this image", "reference image", or any similar phrases. 
             The prompt should work on its own without seeing the original image.`
          
          : `Analyze this image and create a detailed portrait prompt that describes the style, lighting, pose, and mood.
             
             IMPORTANT: Create a standalone prompt that does NOT mention "this image", "reference image", or any similar phrases.
             The prompt should work on its own without seeing the original image.`;

        const imagePart = {
          inlineData: {
            data: uploadedImage.split(",")[1],
            mimeType: "image/jpeg",
          },
        };

        result = await model.generateContent({
          contents: [
            {
              role: "user",
              parts: [{ text: systemPrompt }, imagePart],
            },
          ],
        });
      } else {
        // Text-only prompt if no image is provided
        const textPrompt = `Create a detailed portrait prompt based on the following description: ${userContext}
          
          The prompt should describe style, lighting, pose, mood, and other visual elements for a professional portrait.
          Make it detailed and specific enough to guide an AI image generator.`;
          
        result = await model.generateContent({
          contents: [
            {
              role: "user",
              parts: [{ text: textPrompt }],
            },
          ],
        });
      }

      const response = await result.response;
      const text = await response.text();
      
      // Clean up the prompt to remove any remaining references to the image
      const cleanedPrompt = text
        .replace(/this (reference )?image/gi, "the portrait")
        .replace(/in the (reference )?image/gi, "in the portrait")
        .replace(/from the (reference )?image/gi, "in the portrait")
        .replace(/shown in the (reference )?image/gi, "");

      setGeneratedPrompt(cleanedPrompt);
      if (onPromptGenerated) onPromptGenerated(cleanedPrompt);
    } catch (error) {
      console.error("Error generating prompt:", error);
      const fallbackPrompt = `A professional portrait with ${
        userContext || "elegant lighting and composition"
      }`;
      setGeneratedPrompt(fallbackPrompt);
      if (onPromptGenerated) onPromptGenerated(fallbackPrompt);
      alert("Error connecting to Gemini API. Using fallback prompt instead.");
    } finally {
      setIsGenerating(false);
    }
  };

  const savePrompt = async () => {
    if (!generatedPrompt || !user) {
      alert("No prompt to save or user not logged in");
      return;
    }

    setIsSaving(true);
    try {
      await addDoc(collection(db, "savedPrompts"), {
        userId: user.uid,
        prompt: generatedPrompt,
        createdAt: new Date().toISOString(),
        imagePreview: uploadedImage,
      });
      alert("Prompt saved successfully!");
    } catch (error) {
      console.error("Error saving prompt:", error);
      alert("Failed to save prompt");
    } finally {
      setIsSaving(false);
    }
  };

  // Check if either image or text is provided
  const canGenerate = uploadedImage || userContext.trim().length > 0;

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">
          Upload a Reference Photo (Optional)
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="w-full p-2 border rounded"
        />
        {uploadedImage && (
          <div className="mt-2">
            <img
              src={uploadedImage}
              alt="Reference"
              className="max-h-40 rounded"
            />
          </div>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">
          Description or Context {!uploadedImage && "(Required if no image)"}
        </label>
        <textarea
          value={userContext}
          onChange={(e) => setUserContext(e.target.value)}
          placeholder="Describe the portrait you want to create..."
          className="w-full p-2 border rounded"
          rows="3"
        />
      </div>
      <button
        onClick={generatePrompt}
        disabled={!canGenerate || isGenerating}
        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
      >
        {isGenerating ? "Generating..." : "Generate with Gemini AI"}
      </button>
      {generatedPrompt && (
        <div className="mt-4">
          <label className="block text-sm font-medium mb-1">
            Generated Prompt
          </label>
          <textarea
            value={generatedPrompt}
            onChange={(e) => setGeneratedPrompt(e.target.value)}
            className="w-full p-2 border rounded min-h-[100px]"
            rows="4"
            readOnly={false}
          />
          <div className="flex space-x-2 mt-2">
            <button
              onClick={() => {
                navigator.clipboard.writeText(generatedPrompt);
                alert("Prompt copied to clipboard!");
              }}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
            >
              Copy
            </button>
            <button
              onClick={savePrompt}
              disabled={isSaving}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400"
            >
              {isSaving ? "Saving..." : "Save Prompt"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIPromptGenerator;