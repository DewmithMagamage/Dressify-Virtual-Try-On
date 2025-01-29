// const express = require("express");
// const multer = require("multer");
// const axios = require("axios");
// const FormData = require("form-data");
// const fs = require("fs");
// const cors = require("cors");

// const app = express();
// const upload = multer({ dest: "uploads/" });

// // Enable CORS
// app.use(cors());

// // Hugging Face IDM-VTON API details
// const HF_API_URL = "https://api-inference.huggingface.co/models/yisol/IDM-VTON"; // Replace with the correct API URL
// const HF_API_TOKEN = "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"; // Replace with your actual token

// // Retry delay for Hugging Face API (in milliseconds)
// const RETRY_DELAY = 5000; // 5 seconds

// // Function to send request to Hugging Face API with retry logic
// const sendRequestToHF = async (formData) => {
//   try {
//     const response = await axios.post(HF_API_URL, formData, {
//       headers: {
//         ...formData.getHeaders(),
//         Authorization: `Bearer ${HF_API_TOKEN}`,
//       },
//     });
//     return response.data;
//   } catch (error) {
//     if (error.response && error.response.status === 503) {
//       console.log("Model is loading. Retrying in 5 seconds...");
//       await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
//       return sendRequestToHF(formData); // Retry the request
//     }
//     throw error; // Re-throw other errors
//   }
// };

// // API endpoint to handle image uploads
// app.post("/api/upload", upload.fields([
//   { name: "front", maxCount: 1 },
//   { name: "right", maxCount: 1 },
//   { name: "back", maxCount: 1 },
//   { name: "left", maxCount: 1 },
// ]), async (req, res) => {
//   try {
//     console.log("Request files:", req.files); // Debugging: Log the files

//     const { front, right, back, left } = req.files;

//     // Check if all files are present
//     if (!front || !right || !back || !left) {
//       return res.status(400).json({ error: "Missing files. Please upload all four images." });
//     }

//     // Log file details
//     console.log("Front file:", front[0]);
//     console.log("Right file:", right[0]);
//     console.log("Back file:", back[0]);
//     console.log("Left file:", left[0]);

//     // Create FormData to send to IDM-VTON API
//     const formData = new FormData();
//     formData.append("front", fs.createReadStream(front[0].path), { filename: "front.jpg" });
//     formData.append("right", fs.createReadStream(right[0].path), { filename: "right.jpg" });
//     formData.append("back", fs.createReadStream(back[0].path), { filename: "back.jpg" });
//     formData.append("left", fs.createReadStream(left[0].path), { filename: "left.jpg" });

//     // Send request to IDM-VTON API with retry logic
//     const response = await sendRequestToHF(formData);

//     // Clean up uploaded files
//     [front, right, back, left].forEach((file) => {
//       fs.unlinkSync(file[0].path);
//     });

//     // Send the result back to the client
//     res.json(response);
//   } catch (error) {
//     console.error("Error processing images:", error);
//     res.status(500).json({ error: "Failed to process images" });
//   }
// });

// // Root route
// app.get("/", (req, res) => {
//   res.send("Welcome to the Virtual Try-On Backend!");
// });

// // Start the server
// const PORT = 5000;
// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });

// const express = require("express");
// const multer = require("multer");
// const axios = require("axios");
// const FormData = require("form-data");
// const fs = require("fs");
// const cors = require("cors");
// const path = require("path");
// const { client } = require("@gradio/client");

// // Initialize express app
// const app = express();

// // Configure multer for file uploads
// const storage = multer.diskStorage({
//   destination: "uploads/",
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//     cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
//   }
// });

// const upload = multer({ 
//   storage: storage,
//   limits: {
//     fileSize: 5 * 1024 * 1024 // 5MB limit
//   }
// });

// // Enable CORS
// app.use(cors());

// // Create uploads directory if it doesn't exist
// if (!fs.existsSync('uploads')) {
//   fs.mkdirSync('uploads');
// }

// // Configuration
// const CONFIG = {
//   MAX_RETRIES: 3,
//   RETRY_DELAY: 5000,
//   MAX_FILE_SIZE: 5 * 1024 * 1024,
//   ALLOWED_MIME_TYPES: ['image/jpeg', 'image/jpg', 'image/png'],
//   DENOISING_STEPS: 3,
//   SEED: 3
// };

// // Image validation function
// const validateImage = (file) => {
//   if (!file) {
//     throw new Error('File is required');
//   }

//   if (!CONFIG.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
//     throw new Error(`${file.originalname} must be a JPEG or PNG image`);
//   }

//   if (file.size > CONFIG.MAX_FILE_SIZE) {
//     throw new Error(`${file.originalname} exceeds the 5MB size limit`);
//   }
// };

// // Function to convert file to blob
// const fileToBlob = async (filePath) => {
//   const buffer = await fs.promises.readFile(filePath);
//   return new Blob([buffer], { type: 'image/jpeg' });
// };

// // Function to process images using Gradio client
// const processImages = async (files) => {
//   try {
//     console.log('Initializing Gradio client...');
//     const gradioApp = await client("yisol/IDM-VTON");
    
//     console.log('Converting files to blobs...');
//     const frontBlob = await fileToBlob(files.front[0].path);
//     const garmentBlob = await fileToBlob(files.garment[0].path);

//     console.log('Sending request to IDM-VTON...');
//     const result = await gradioApp.predict("/tryon", [
//       {
//         background: frontBlob,
//         layers: [],
//         composite: null
//       },
//       garmentBlob,
//       "", // parameter_17 (empty string instead of "Hello!!")
//       true, // First checkbox
//       true, // Second checkbox
//       CONFIG.DENOISING_STEPS,
//       CONFIG.SEED
//     ]);

//     console.log('Received response from IDM-VTON');
//     return result.data;
//   } catch (error) {
//     console.error('Error in processImages:', error);
//     throw new Error(`Failed to process images: ${error.message}`);
//   }
// };

// // Clean up uploaded files
// const cleanupFiles = (files) => {
//   Object.values(files).forEach(fileArray => {
//     fileArray.forEach(file => {
//       try {
//         fs.unlinkSync(file.path);
//         console.log(`Cleaned up file: ${file.path}`);
//       } catch (error) {
//         console.error(`Error cleaning up file ${file.path}:`, error);
//       }
//     });
//   });
// };

// // API endpoint to handle image uploads
// app.post("/api/tryon", upload.fields([
//   { name: "front", maxCount: 1 },
//   { name: "garment", maxCount: 1 }
// ]), async (req, res) => {
//   try {
//     console.log("Received file upload request");

//     // Check if files exist
//     if (!req.files || Object.keys(req.files).length === 0) {
//       return res.status(400).json({ error: "No files were uploaded." });
//     }

//     const { front, garment } = req.files;

//     // Check if all required files are present
//     if (!front || !garment) {
//       return res.status(400).json({ 
//         error: "Missing files. Please upload both front view and garment images." 
//       });
//     }

//     // Validate each image
//     try {
//       validateImage(front[0]);
//       validateImage(garment[0]);
//     } catch (error) {
//       cleanupFiles(req.files);
//       return res.status(400).json({ error: error.message });
//     }

//     // Log received files
//     console.log("Received files:");
//     console.log("Front:", front[0].originalname);
//     console.log("Garment:", garment[0].originalname);

//     // Process images
//     const result = await processImages(req.files);

//     // Clean up uploaded files
//     cleanupFiles(req.files);

//     // Send response back to client
//     res.json(result);

//   } catch (error) {
//     console.error("Error processing request:", error);
    
//     // Clean up files if they exist
//     if (req.files) {
//       cleanupFiles(req.files);
//     }

//     // Send error response
//     res.status(500).json({ 
//       error: error.message || "An unexpected error occurred while processing your request." 
//     });
//   }
// });

// // Health check endpoint
// app.get("/health", (req, res) => {
//   res.json({ status: "healthy", timestamp: new Date().toISOString() });
// });

// // Welcome route
// app.get("/", (req, res) => {
//   res.send("Welcome to the Virtual Try-On Backend!");
// });

// // Start the server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
//   console.log(`Health check available at http://localhost:${PORT}/health`);
// });

// // Error handling
// process.on('uncaughtException', (error) => {
//   console.error('Uncaught Exception:', error);
//   process.exit(1);
// });

// process.on('unhandledRejection', (reason, promise) => {
//   console.error('Unhandled Rejection at:', promise, 'reason:', reason);
//   process.exit(1);
// });

// const express = require("express");
// const multer = require("multer");
// const axios = require("axios");
// const FormData = require("form-data");
// const fs = require("fs");
// const cors = require("cors");
// const path = require("path");
// const { client } = require("@gradio/client");
// const { Blob } = require('blob-polyfill');
// global.Blob = Blob;

// // Initialize express app
// const app = express();

// // Configure multer for file uploads
// const storage = multer.diskStorage({
//   destination: "uploads/",
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//     cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
//   }
// });

// const upload = multer({ 
//   storage: storage,
//   limits: {
//     fileSize: 5 * 1024 * 1024 // 5MB limit
//   }
// });

// // Enable CORS
// app.use(cors());

// // Create uploads directory if it doesn't exist
// if (!fs.existsSync('uploads')) {
//   fs.mkdirSync('uploads');
// }

// // Configuration
// const CONFIG = {
//   MAX_RETRIES: 3,
//   RETRY_DELAY: 5000,
//   MAX_FILE_SIZE: 5 * 1024 * 1024,
//   ALLOWED_MIME_TYPES: ['image/jpeg', 'image/jpg', 'image/png'],
//   DENOISING_STEPS: 3,
//   SEED: 3
// };

// // Image validation function
// const validateImage = (file) => {
//   if (!file) {
//     throw new Error('File is required');
//   }

//   if (!CONFIG.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
//     throw new Error(`${file.originalname} must be a JPEG or PNG image`);
//   }

//   if (file.size > CONFIG.MAX_FILE_SIZE) {
//     throw new Error(`${file.originalname} exceeds the 5MB size limit`);
//   }
// };

// // Function to convert file to blob
// const fileToBlob = async (filePath) => {
//   const buffer = await fs.promises.readFile(filePath);
//   return new Blob([buffer], { type: 'image/jpeg' });
// };

// // Function to process images using Gradio client
// const processImages = async (files) => {
//   try {
//     console.log('Initializing Gradio client...');
//     const gradioApp = await client("yisol/IDM-VTON");
    
//     console.log('Converting files to blobs...');
//     const frontBlob = await fileToBlob(files.front[0].path);
//     const garmentBlob = await fileToBlob(files.garment[0].path);

//     console.log('Sending request to IDM-VTON...');
//     const result = await gradioApp.predict("/tryon", [
//       {
//         background: frontBlob,
//         layers: [],
//         composite: null
//       },
//       garmentBlob,
//       "", // parameter_17 (empty string instead of "Hello!!")
//       true, // First checkbox
//       true, // Second checkbox
//       CONFIG.DENOISING_STEPS,
//       CONFIG.SEED
//     ]);

//     console.log('Received response from IDM-VTON');
//     return result.data;
//   } catch (error) {
//     console.error('Error in processImages:', error);
//     throw new Error(`Failed to process images: ${error.message}`);
//   }
// };

// // Clean up uploaded files
// const cleanupFiles = (files) => {
//   Object.values(files).forEach(fileArray => {
//     fileArray.forEach(file => {
//       try {
//         fs.unlinkSync(file.path);
//         console.log(`Cleaned up file: ${file.path}`);
//       } catch (error) {
//         console.error(`Error cleaning up file ${file.path}:`, error);
//       }
//     });
//   });
// };

// // API endpoint to handle image uploads
// app.post("/api/tryon", upload.fields([
//   { name: "front", maxCount: 1 },
//   { name: "garment", maxCount: 1 }
// ]), async (req, res) => {
//   try {
//     console.log("Received file upload request");

//     // Check if files exist
//     if (!req.files || Object.keys(req.files).length === 0) {
//       return res.status(400).json({ error: "No files were uploaded." });
//     }

//     const { front, garment } = req.files;

//     // Check if all required files are present
//     if (!front || !garment) {
//       return res.status(400).json({ 
//         error: "Missing files. Please upload both front view and garment images." 
//       });
//     }

//     // Validate each image
//     try {
//       validateImage(front[0]);
//       validateImage(garment[0]);
//     } catch (error) {
//       cleanupFiles(req.files);
//       return res.status(400).json({ error: error.message });
//     }

//     // Log received files
//     console.log("Received files:");
//     console.log("Front:", front[0].originalname);
//     console.log("Garment:", garment[0].originalname);

//     // Process images
//     const result = await processImages(req.files);

//     // Clean up uploaded files
//     cleanupFiles(req.files);

//     // Send response back to client
//     res.json(result);

//   } catch (error) {
//     console.error("Error processing request:", error);
    
//     // Clean up files if they exist
//     if (req.files) {
//       cleanupFiles(req.files);
//     }

//     // Send error response
//     res.status(500).json({ 
//       error: error.message || "An unexpected error occurred while processing your request." 
//     });
//   }
// });

// // Health check endpoint
// app.get("/health", (req, res) => {
//   res.json({ status: "healthy", timestamp: new Date().toISOString() });
// });

// // Welcome route
// app.get("/", (req, res) => {
//   res.send("Welcome to the Virtual Try-On Backend!");
// });

// // Start the server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
//   console.log(`Health check available at http://localhost:${PORT}/health`);
// });

// // Error handling
// process.on('uncaughtException', (error) => {
//   console.error('Uncaught Exception:', error);
//   process.exit(1);
// });

// process.on('unhandledRejection', (reason, promise) => {
//   console.error('Unhandled Rejection at:', promise, 'reason:', reason);
//   process.exit(1);
// });

import express from 'express';
import multer from 'multer';
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { client } from '@gradio/client';
import { Blob } from 'blob-polyfill';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize express app
const app = express();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Enable CORS
app.use(cors());

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Configuration
const CONFIG = {
  MAX_RETRIES: 3,
  RETRY_DELAY: 5000,
  MAX_FILE_SIZE: 5 * 1024 * 1024,
  ALLOWED_MIME_TYPES: ['image/jpeg', 'image/jpg', 'image/png'],
  DENOISING_STEPS: 20,  // Changed from 3 to 20
  SEED: 3
};

// Image validation function
const validateImage = (file) => {
  if (!file) {
    throw new Error('File is required');
  }

  if (!CONFIG.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    throw new Error(`${file.originalname} must be a JPEG or PNG image`);
  }

  if (file.size > CONFIG.MAX_FILE_SIZE) {
    throw new Error(`${file.originalname} exceeds the 5MB size limit`);
  }
};

// Function to convert file to blob
const fileToBlob = async (filePath) => {
  const buffer = await fs.promises.readFile(filePath);
  return new Blob([buffer], { type: 'image/jpeg' });
};

// Function to process images using Gradio client
const processImages = async (files) => {
  try {
    console.log('Initializing Gradio client...');
    const gradioApp = await client("yisol/IDM-VTON");
    
    console.log('Converting files to blobs...');
    const frontBlob = await fileToBlob(files.front[0].path);
    const garmentBlob = await fileToBlob(files.garment[0].path);

    console.log('Sending request to IDM-VTON...');
    const result = await gradioApp.predict("/tryon", [
      {
        background: frontBlob,
        layers: [],
        composite: null
      },
      garmentBlob,
      "", // parameter_17 (empty string instead of "Hello!!")
      true, // First checkbox
      true, // Second checkbox
      CONFIG.DENOISING_STEPS,
      CONFIG.SEED
    ]);

    console.log('Received response from IDM-VTON');
    return result.data;
  } catch (error) {
    console.error('Error in processImages:', error);
    throw new Error(`Failed to process images: ${error.message}`);
  }
};

// Clean up uploaded files
const cleanupFiles = (files) => {
  Object.values(files).forEach(fileArray => {
    fileArray.forEach(file => {
      try {
        fs.unlinkSync(file.path);
        console.log(`Cleaned up file: ${file.path}`);
      } catch (error) {
        console.error(`Error cleaning up file ${file.path}:`, error);
      }
    });
  });
};

// API endpoint to handle image uploads
app.post("/api/tryon", upload.fields([
  { name: "front", maxCount: 1 },
  { name: "garment", maxCount: 1 }
]), async (req, res) => {
  try {
    console.log("Received file upload request");

    // Check if files exist
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ error: "No files were uploaded." });
    }

    const { front, garment } = req.files;

    // Check if all required files are present
    if (!front || !garment) {
      return res.status(400).json({ 
        error: "Missing files. Please upload both front view and garment images." 
      });
    }

    // Validate each image
    try {
      validateImage(front[0]);
      validateImage(garment[0]);
    } catch (error) {
      cleanupFiles(req.files);
      return res.status(400).json({ error: error.message });
    }

    // Log received files
    console.log("Received files:");
    console.log("Front:", front[0].originalname);
    console.log("Garment:", garment[0].originalname);

    // Process images
    const result = await processImages(req.files);

    // Clean up uploaded files
    cleanupFiles(req.files);

    // Send response back to client
    res.json(result);

  } catch (error) {
    console.error("Error processing request:", error);
    
    // Clean up files if they exist
    if (req.files) {
      cleanupFiles(req.files);
    }

    // Send error response
    res.status(500).json({ 
      error: error.message || "An unexpected error occurred while processing your request." 
    });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Welcome route
app.get("/", (req, res) => {
  res.send("Welcome to the Virtual Try-On Backend!");
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/health`);
});

// Error handling
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});