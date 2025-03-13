// import fs from 'fs/promises';
// import path from 'path';
// import { fileURLToPath } from 'url';
// import { dirname } from 'path';
// import { client } from '@gradio/client';
// import { CONFIG } from '../config/config.js';
// import { fileToBlob, downloadImage } from '../utils/fileUtils.js';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// export const processImages = async (files) => {
//   let retries = 0;
  
//   while (retries < CONFIG.MAX_RETRIES) {
//     try {
//       console.log(`Processing attempt ${retries + 1}/${CONFIG.MAX_RETRIES}`);
      
//       // Initialize Gradio client with timeout
//       const gradioApp = await Promise.race([
//         client(CONFIG.GRADIO_URL, {
//           hf_token: CONFIG.HF_TOKEN
//         }),
//         new Promise((_, reject) => 
//           setTimeout(() => reject(new Error('Gradio client initialization timeout')), CONFIG.REQUEST_TIMEOUT)
//         )
//       ]);
      
//       console.log('Gradio client initialized successfully');
      
//       // Convert files to blobs
//       const [frontBlob, garmentBlob] = await Promise.all([
//         fileToBlob(files.front[0].path),
//         fileToBlob(files.garment[0].path)
//       ]);

//       // Make prediction with timeout
//       const result = await Promise.race([
//         gradioApp.predict("/tryon", [
//           {
//             background: frontBlob,
//             layers: [],
//             composite: null
//           },
//           garmentBlob,
//           "",
//           true,
//           true,
//           CONFIG.DENOISING_STEPS,
//           CONFIG.SEED
//         ]),
//         new Promise((_, reject) => 
//           setTimeout(() => reject(new Error('Prediction timeout')), CONFIG.REQUEST_TIMEOUT * 2)
//         )
//       ]);

//       if (!result || !result.data) {
//         throw new Error("Invalid result data received from Gradio");
//       }

//       // Handle array result
//       if (Array.isArray(result.data) && result.data.length > 0) {
//         const firstItem = result.data[0];
//         if (firstItem && firstItem.url) {
//           const imageBuffer = await Promise.race([
//             downloadImage(firstItem.url),
//             new Promise((_, reject) => 
//               setTimeout(() => reject(new Error('Download timeout')), CONFIG.REQUEST_TIMEOUT)
//             )
//           ]);
//           return imageBuffer.toString('base64');
//         }
//       }
      
//       // Handle direct base64 string
//       if (typeof result.data === 'string' && result.data.match(/^[A-Za-z0-9+/=]+$/)) {
//         return result.data;
//       }

//       throw new Error("Unexpected result format");
      
//     } catch (error) {
//       retries++;
//       console.error(`Attempt ${retries} failed:`, error);
      
//       if (retries === CONFIG.MAX_RETRIES) {
//         throw new Error(`Failed to process images after ${CONFIG.MAX_RETRIES} attempts: ${error.message}`);
//       }
      
//       // Exponential backoff
//       const delay = Math.min(CONFIG.RETRY_DELAY * Math.pow(2, retries - 1), 30000);
//       await new Promise(resolve => setTimeout(resolve, delay));
//     }
//   }
// };