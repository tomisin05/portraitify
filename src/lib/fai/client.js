import * as fal from '@fal-ai/serverless-client';

fal.config({
  credentials: import.meta.env.VITE_FAL_API_KEY,
});

export const trainModel = async (imageUrl, prompt) => {
  try {
    const result = await fal.subscribe('flux-lora-fast-training', {
      input: {
        image_url: imageUrl,
        prompt: prompt,
      },
    });
    return result;
  } catch (error) {
    console.error('Error training model:', error);
    throw error;
  }
};

export const generateImage = async (modelId, prompt) => {
  try {
    const result = await fal.subscribe('flux-lora-fast-training/inference', {
      input: {
        model_id: modelId,
        prompt: prompt,
      },
    });
    return result;
  } catch (error) {
    console.error('Error generating image:', error);
    throw error;
  }
};