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

// Configure CORS for frontend
const corsOptions = {
  origin: 'null',  // Allow requests from local files
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors({
  origin: "http://localhost:5500", // Change this to match your frontend URL
  credentials: true
}));

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
  DENOISING_STEPS: 20,
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

// Function to process images using Gradio client with retries
const processImages = async (files) => {
  let retries = 0;
  
  while (retries < CONFIG.MAX_RETRIES) {
    try {
      console.log(`Processing attempt ${retries + 1}/${CONFIG.MAX_RETRIES}`);
      
      const gradioApp = await client("yisol/IDM-VTON");
      console.log('Gradio client initialized successfully');
      
      const frontBlob = await fileToBlob(files.front[0].path);
      const garmentBlob = await fileToBlob(files.garment[0].path);
      
      const result = await gradioApp.predict("/tryon", [
        {
          background: frontBlob,
          layers: [],
          composite: null
        },
        garmentBlob,
        "",
        true,
        true,
        CONFIG.DENOISING_STEPS,
        CONFIG.SEED
      ]);

      console.log('Image processing successful');
      return result.data;
      
    } catch (error) {
      retries++;
      console.error(`Attempt ${retries} failed:`, error);
      
      if (retries === CONFIG.MAX_RETRIES) {
        throw new Error(`Failed to process images after ${CONFIG.MAX_RETRIES} attempts: ${error.message}`);
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, CONFIG.RETRY_DELAY));
    }
  }
};

// Clean up uploaded files
const cleanupFiles = (files) => {
  Object.values(files).forEach(fileArray => {
    fileArray.forEach(file => {
      try {
        fs.unlinkSync(file.path);
        console.error(`Error cleaning up file ${file.path}:`, error);
      } catch (error) {
        console.log(`Cleaned up file: ${file.path}`);
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
    console.log("Received file upload request from frontend");

    // Add CORS headers for specific endpoint
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.header('Access-Control-Allow-Credentials', true);

    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ 
        error: "No files were uploaded.",
        success: false
      });
    }

    const { front, garment } = req.files;

    if (!front || !garment) {
      return res.status(400).json({ 
        error: "Missing files. Please upload both front view and garment images.",
        success: false
      });
    }

    try {
      validateImage(front[0]);
      validateImage(garment[0]);
    } catch (error) {
      cleanupFiles(req.files);
      return res.status(400).json({ 
        error: error.message,
        success: false
      });
    }

    console.log("Processing files:", {
      front: front[0].originalname,
      garment: garment[0].originalname
    });

    const result = await processImages(req.files);
    cleanupFiles(req.files);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error("Error processing request:", error);
    
    if (req.files) {
      cleanupFiles(req.files);
    }

    res.status(500).json({ 
      error: error.message || "An unexpected error occurred while processing your request.",
      success: false
    });
  }
});

// Health check endpoint with CORS support
app.get("/health", (req, res) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.json({ 
    status: "healthy", 
    timestamp: new Date().toISOString(),
    corsStatus: "enabled"
  });
});

// Welcome route
app.get("/", (req, res) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.send("Welcome to the Virtual Try-On Backend!");
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/health`);
  console.log(`Frontend URL: http://localhost:3000`);
});

// Error handling
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Log the error but don't exit in production
  if (process.env.NODE_ENV === 'production') {
    console.error('Production mode - continuing despite error');
  } else {
    process.exit(1);
  }
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Log the error but don't exit in production
  if (process.env.NODE_ENV === 'production') {
    console.error('Production mode - continuing despite rejection');
  } else {
    process.exit(1);
  }
});