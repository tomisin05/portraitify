import { auth } from '../firebase/config';

// Function to generate a portrait prompt based on an image and context
// This simulates a Gemini API integration
export const generatePromptFromImage = async (imageDataUrl, userContext = '') => {
  try {
    // In a real implementation, this would call a backend API that interfaces with Gemini
    // For now, we'll simulate a response
    
    // Create a prompt based on the image and user context
    let prompt = '';
    
    if (userContext && userContext.trim()) {
      prompt = `A professional portrait with ${userContext.trim()}`;
    } else {
      // Default prompt elements if no context is provided
      const styles = ['professional', 'artistic', 'dramatic', 'minimalist', 'vintage', 'modern'];
      const lighting = ['soft natural', 'dramatic', 'studio', 'high contrast', 'moody', 'bright'];
      const poses = ['confident', 'relaxed', 'professional', 'thoughtful', 'engaging', 'natural'];
      
      const style = styles[Math.floor(Math.random() * styles.length)];
      const light = lighting[Math.floor(Math.random() * lighting.length)];
      const pose = poses[Math.floor(Math.random() * poses.length)];
      
      prompt = `A ${style} portrait with ${light} lighting and a ${pose} pose. The image should have professional quality suitable for business profiles.`;
    }
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return prompt;
  } catch (error) {
    console.error('Error generating prompt from image:', error);
    throw error;
  }
};

// export const trainModel = async (zipUrl, prompt) => {

//     const userId = auth.currentUser.uid;
//   try {
//     const result = await fal.subscribe('flux-lora-fast-training', {
//       input: {
//         image_data_url: zipUrl,
//         steps: 1000,
//         prompt: prompt,
//         num_images: 1,
//         seed: 12345,
//         triggerWord: userId,
//       },
//       logs: true,
//       onQueueUpdate: (update) => {
//         if (update.status === 'IN_PROGRESS') {
//           console.log(`Training progress: ${update.logs.map((log) => log.message).join(', ')}`);
//         }
//       },
//       onResult: (result) => {
//         console.log('Training complete:', result);
//       },
//     });
//     return result;
//   } catch (error) {
//     console.error('Error training model:', error);
//     throw error;
//   }
// };

export const trainModel = async (zipUrl) => {
    const userId = auth.currentUser.uid;
    try {
      const result = await fal.subscribe('fal-ai/flux-lora-fast-training', {
        input: {
          images_data_url: zipUrl, // This should now be the URL of the zip file
          trigger_word: userId, 
          create_masks: true,          
          steps: 1000,
          is_style: true,
          is_input_format_already_processed: false,
        },
        logs: true,
        onQueueUpdate: (update) => {
          if (update.status === 'IN_PROGRESS') {
            console.log(`Training progress: ${update.logs.map((log) => log.message).join(', ')}`);
          }
        },
        onResult: (result) => {
          console.log('Training complete:', result);
        },
      });
      return result;
    } catch (error) {
      console.error('Error training model:', error);
      throw error;
    }
  };

export const generateImage = async (modelId, prompt, loraWeightsUrl) => {
  try {
    const result = await fal.subscribe('fal-ai/flux-lora', {
      input: {
        prompt: prompt,
        model_name: modelId || null,
        loras: [{
            path: loraWeightsUrl,
            scale: 1
        }],
        embeddings: [],
        num_inference_steps: 28,
        guidance_scale: 3.5,
        image_size: "square_hd",
        seed: Math.floor(Math.random() * 1000000),
        output_format: "png",
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === 'IN_PROGRESS') {
          console.log(`Generation progress: ${update.logs.map((log) => log.message).join(', ')}`);
        }
      },
      onResult: (result) => {
        console.log('Generation complete:', result);
    ;  },
    });
    console.log('Image generation complete:', result);
    return result;
  } catch (error) {
    console.error('Error generating image:', error);
    throw error;
  }
};