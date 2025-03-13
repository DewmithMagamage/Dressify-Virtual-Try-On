// import path from 'path';
// import fs from 'fs/promises';
// import fsSync from 'fs';
// import { fileURLToPath } from 'url';
// import { dirname } from 'path';
// import { upload } from '../middleware/multerConfig.js';
// import { processImages } from '../services/tryOnService.js';
// import { validateImage, cleanupFiles } from '../utils/fileUtils.js';
// import { CONFIG } from '../config/config.js';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// // Ensure uploads directory exists
// const uploadsDir = path.join(dirname(dirname(__dirname)), 'uploads');
// if (!fsSync.existsSync(uploadsDir)) {
//   fsSync.mkdirSync(uploadsDir, { recursive: true });
// }

// export const tryOnRoutes = (app) => {
//   app.post("/api/tryon", upload.fields([
//     { name: "front", maxCount: 1 },
//     { name: "garment", maxCount: 1 }
//   ]), async (req, res) => {
//     try {
//       console.log("Received file upload request for virtual try-on");

//       if (!req.files || Object.keys(req.files).length === 0) {
//         return res.status(400).json({
//           error: "No files were uploaded.",
//           success: false
//         });
//       }

//       const { front, garment } = req.files;

//       if (!front || !garment) {
//         return res.status(400).json({
//           error: "Missing files. Please upload both front view and garment images.",
//           success: false
//         });
//       }

//       try {
//         validateImage(front[0]);
//         validateImage(garment[0]);
//       } catch (error) {
//         cleanupFiles(req.files);
//         return res.status(400).json({
//           error: error.message,
//           success: false
//         });
//       }

//       const result = await processImages(req.files);

//       if (!result || typeof result !== 'string') {
//         throw new Error("Invalid image data received from model");
//       }

//       const outputFilename = `generated-${Date.now()}.png`;
//       const outputImagePath = path.join(uploadsDir, outputFilename);
      
//       console.log(`Saving generated image to: ${outputImagePath}`);
//       await fs.writeFile(outputImagePath, Buffer.from(result, 'base64'));
      
//       res.json({
//         success: true,
//         imageUrl: `${CONFIG.BACKEND_URL}/uploads/${outputFilename}`,
//         imageData: `data:image/png;base64,${result}`
//       });

//     } catch (error) {
//       console.error("Error processing try-on request:", error);
//       if (req.files) cleanupFiles(req.files);
//       res.status(500).json({
//         error: error.message || "An unexpected error occurred while processing your request.",
//         success: false
//       });
//     }
//   });
// };