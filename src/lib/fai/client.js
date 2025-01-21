import { fal } from "@fal-ai/client";
import { auth } from '../firebase/config';

fal.config({
  credentials: import.meta.env.VITE_FAL_API_KEY,
});

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

export const trainModel = async (zipUrl, prompt) => {
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