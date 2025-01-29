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