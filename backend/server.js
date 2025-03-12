import express from 'express';
import multer from 'multer';
import axios from 'axios';
import fs from 'fs/promises';
import fsSync from 'fs';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { client } from '@gradio/client';
import { Blob } from 'blob-polyfill';
import os from 'os';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const CONFIG = {
  MAX_RETRIES: parseInt(process.env.MAX_RETRIES || '3'),
  RETRY_DELAY: parseInt(process.env.RETRY_DELAY || '5000'),
  REQUEST_TIMEOUT: parseInt(process.env.REQUEST_TIMEOUT || '60000'),
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || '5242880'), // 5MB default
  ALLOWED_MIME_TYPES: (process.env.ALLOWED_MIME_TYPES || 'image/jpeg,image/jpg,image/png').split(','),
  DENOISING_STEPS: parseInt(process.env.DENOISING_STEPS || '20'),
  SEED: parseInt(process.env.SEED || '3'),
  HF_TOKEN: process.env.HF_TOKEN,
  GRADIO_URL: process.env.GRADIO_URL || "yisol/IDM-VTON",
  GRADIO_3D_URL: process.env.GRADIO_3D_URL || "Wuvin/Unique3D",
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:5000',
  MODEL_3D_PARAMS: {
    REMOVE_BACKGROUND: process.env.MODEL_3D_REMOVE_BACKGROUND === 'true',
    SEED: parseInt(process.env.MODEL_3D_SEED || '-1'),
    GENERATE_VIDEO: process.env.MODEL_3D_GENERATE_VIDEO === 'true',
    REFINE_MULTIVIEW: process.env.MODEL_3D_REFINE_MULTIVIEW === 'true',
    EXPANSION_WEIGHT: parseInt(process.env.MODEL_3D_EXPANSION_WEIGHT || '-1'),
    MESH_INITIALIZATION: process.env.MODEL_3D_MESH_INITIALIZATION || "std"
  }
};

// Verify essential configuration
if (!CONFIG.HF_TOKEN) {
  console.error("ERROR: Hugging Face token (HF_TOKEN) is not set in environment variables.");
  process.exit(1);
}

// Initialize express app
const app = express();

// Configure CORS for frontend
const corsOptions = {
  origin: CONFIG.FRONTEND_URL,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Type', 'Content-Disposition'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Set up static file serving
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, path) => {
    res.setHeader('Content-Type', getContentType(path));
    res.setHeader('Access-Control-Allow-Origin', CONFIG.FRONTEND_URL);
    res.setHeader('Access-Control-Allow-Methods', 'GET');
  }
}));

// Helper function to determine content type
function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.png': return 'image/png';
    case '.jpg':
    case '.jpeg': return 'image/jpeg';
    case '.glb': return 'model/gltf-binary';
    case '.mp4': return 'video/mp4';
    default: return 'application/octet-stream';
  }
}

// Configure multer
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: CONFIG.MAX_FILE_SIZE }
});

// Create uploads directory if it doesn't exist
if (!fsSync.existsSync('uploads')) {
  fsSync.mkdirSync('uploads');
}

// Utility functions
const cleanupFiles = (files) => {
  try {
    if (!files) return;
    Object.keys(files).forEach(fieldName => {
      files[fieldName].forEach(file => {
        if (fsSync.existsSync(file.path)) {
          fsSync.unlinkSync(file.path);
          console.log(`Cleaned up temporary file: ${file.path}`);
        }
      });
    });
  } catch (error) {
    console.error("Error during file cleanup:", error);
  }
};

const validateImage = (file) => {
  if (!file) throw new Error('File is required');
  if (!CONFIG.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    throw new Error(`${file.originalname} must be a JPEG or PNG image`);
  }
  if (file.size > CONFIG.MAX_FILE_SIZE) {
    throw new Error(`${file.originalname} exceeds the ${CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB size limit`);
  }
};

const fileToBlob = async (filePath) => {
  try {
    const buffer = await fs.readFile(filePath);
    return new Blob([buffer], { type: 'image/jpeg' });
  } catch (error) {
    throw new Error(`Failed to convert file to blob: ${error.message}`);
  }
};

const downloadImage = async (url) => {
  try {
    console.log(`Downloading image from: ${url}`);
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: CONFIG.REQUEST_TIMEOUT,
      maxContentLength: 10 * 1024 * 1024,
      headers: {
        'Accept': 'image/*, application/octet-stream'
      }
    });

    if (response.status !== 200) {
      throw new Error(`Failed to download image, status: ${response.status}`);
    }

    return Buffer.from(response.data);
  } catch (error) {
    throw new Error(`Failed to download result image: ${error.message}`);
  }
};

// Debugging utility functions
const logSystemInfo = () => {
  console.log('Current working directory:', process.cwd());
  console.log('Temp directory:', os.tmpdir());
  console.log('Platform:', process.platform);
};

const processImages = async (files) => {
  let retries = 0;
  
  while (retries < CONFIG.MAX_RETRIES) {
    try {
      console.log(`Processing attempt ${retries + 1}/${CONFIG.MAX_RETRIES}`);
      
      // Initialize Gradio client with timeout
      const gradioApp = await Promise.race([
        client(CONFIG.GRADIO_URL, {
          hf_token: CONFIG.HF_TOKEN
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Gradio client initialization timeout')), CONFIG.REQUEST_TIMEOUT)
        )
      ]);
      
      console.log('Gradio client initialized successfully');
      
      // Convert files to blobs
      const [frontBlob, garmentBlob] = await Promise.all([
        fileToBlob(files.front[0].path),
        fileToBlob(files.garment[0].path)
      ]);

      // Make prediction with timeout
      const result = await Promise.race([
        gradioApp.predict("/tryon", [
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
        ]),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Prediction timeout')), CONFIG.REQUEST_TIMEOUT * 2)
        )
      ]);

      if (!result || !result.data) {
        throw new Error("Invalid result data received from Gradio");
      }

      // Handle array result
      if (Array.isArray(result.data) && result.data.length > 0) {
        const firstItem = result.data[0];
        if (firstItem && firstItem.url) {
          const imageBuffer = await Promise.race([
            downloadImage(firstItem.url),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Download timeout')), CONFIG.REQUEST_TIMEOUT)
            )
          ]);
          return imageBuffer.toString('base64');
        }
      }
      
      // Handle direct base64 string
      if (typeof result.data === 'string' && result.data.match(/^[A-Za-z0-9+/=]+$/)) {
        return result.data;
      }

      throw new Error("Unexpected result format");
      
    } catch (error) {
      retries++;
      console.error(`Attempt ${retries} failed:`, error);
      
      if (retries === CONFIG.MAX_RETRIES) {
        throw new Error(`Failed to process images after ${CONFIG.MAX_RETRIES} attempts: ${error.message}`);
      }
      
      // Exponential backoff
      const delay = Math.min(CONFIG.RETRY_DELAY * Math.pow(2, retries - 1), 30000);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

const generate3DModel = async (imageUrl) => {
  // Log system info for debugging
  logSystemInfo();

  let imageBuffer;
  let gradioApp;

  try {
    console.log("Starting 3D model generation process");
    
    // Step 1: Handle the image URL
    try {
      if (imageUrl.startsWith('data:image/')) {
        // It's a base64 data URL
        console.log("Processing base64 image data");
        const base64Data = imageUrl.split(',')[1];
        imageBuffer = Buffer.from(base64Data, 'base64');
      } else {
        // It's a regular URL
        console.log(`Downloading image from URL: ${imageUrl}`);
        const response = await axios.get(imageUrl, {
          responseType: 'arraybuffer',
          timeout: CONFIG.REQUEST_TIMEOUT
        });
        imageBuffer = Buffer.from(response.data);
      }
      console.log("Image data prepared successfully");
    } catch (imageError) {
      console.error("Error processing image:", imageError);
      throw new Error(`Failed to process image: ${imageError.message}`);
    }

    // Step 2: Initialize the Gradio client
    try {
      console.log(`Initializing Gradio client: ${CONFIG.GRADIO_3D_URL}`);
      gradioApp = await client(CONFIG.GRADIO_3D_URL, {
        hf_token: CONFIG.HF_TOKEN
      });
      console.log("Gradio client initialized successfully");
    } catch (initError) {
      console.error("Error initializing Gradio client:", initError);
      throw new Error(`Failed to initialize Gradio client: ${initError.message}`);
    }

    // Step 3: Create and verify the image blob
    let imageBlob;
    try {
      imageBlob = new Blob([imageBuffer], { type: 'image/png' });
      console.log("Image blob created:", imageBlob.size, "bytes");
      
      if (imageBlob.size === 0) {
        throw new Error("Created image blob has zero size");
      }
    } catch (blobError) {
      console.error("Error creating image blob:", blobError);
      throw new Error(`Failed to create image blob: ${blobError.message}`);
    }

    // Step 4: Make the prediction
    let result;
    try {
      console.log("Sending prediction request to Gradio with params:", {
        removeBackground: CONFIG.MODEL_3D_PARAMS.REMOVE_BACKGROUND,
        seed: CONFIG.MODEL_3D_PARAMS.SEED,
        generateVideo: CONFIG.MODEL_3D_PARAMS.GENERATE_VIDEO
      });
      
      result = await gradioApp.predict("/generate3dv2", [
        imageBlob,
        CONFIG.MODEL_3D_PARAMS.REMOVE_BACKGROUND,
        CONFIG.MODEL_3D_PARAMS.SEED,
        CONFIG.MODEL_3D_PARAMS.GENERATE_VIDEO,
        CONFIG.MODEL_3D_PARAMS.REFINE_MULTIVIEW,
        CONFIG.MODEL_3D_PARAMS.EXPANSION_WEIGHT,
        CONFIG.MODEL_3D_PARAMS.MESH_INITIALIZATION
      ]);
      
      console.log("Prediction request completed");
    } catch (predictionError) {
      console.error("Error making prediction:", predictionError);
      throw new Error(`Failed to make prediction: ${predictionError.message}`);
    }

    // Step 5: Validate the result
    if (!result) {
      throw new Error("Received null result from Gradio");
    }
    
    console.log("Result received:", typeof result, "with keys:", Object.keys(result));
    
    if (!result.data) {
      throw new Error("Result does not contain 'data' property");
    }

    // Step 6: Process the result data
    const modelData = {};
    
    if (Array.isArray(result.data)) {
      console.log("Result.data is an array with length:", result.data.length);
      
      for (let i = 0; i < result.data.length; i++) {
        const item = result.data[i];
        console.log(`Result item ${i}:`, item);
        
        if (!item || typeof item !== 'object') {
          console.log(`Item ${i} is not an object, skipping`);
          continue;
        }
        
        if (!item.path) {
          console.log(`Item ${i} doesn't have a path property, skipping`);
          continue;
        }
        
        // Process the item based on its file extension
        const path = item.path;
        const isGlb = path.endsWith('.glb');
        const isMp4 = path.endsWith('.mp4');
        
        if (!isGlb && !isMp4) {
          console.log(`Skipping item with path ${path} - not a supported file type`);
          continue;
        }
        
        // Simplified approach: just use the direct URL to the file
        const fileUrl = `https://wuvin-unique3d.hf.space/file=${encodeURIComponent(path)}`;
        
        if (isGlb) {
          modelData.model = fileUrl;
          console.log(`Added model URL: ${fileUrl}`);
        } else if (isMp4) {
          modelData.video = fileUrl;
          console.log(`Added video URL: ${fileUrl}`);
        }
      }
    } else {
      console.log("Result.data is not an array:", typeof result.data);
      throw new Error("Expected result.data to be an array");
    }

    // Verify we have at least one file
    if (Object.keys(modelData).length === 0) {
      throw new Error("No valid files found in the result");
    }
    
    console.log("Successfully processed 3D generation result:", modelData);
    return modelData;

  } catch (error) {
    console.error("3D model generation failed:", error);
    throw new Error(`Failed to generate 3D model: ${error.message}`);
  }
};

// API endpoints
app.post("/api/tryon", upload.fields([
  { name: "front", maxCount: 1 },
  { name: "garment", maxCount: 1 }
]), async (req, res) => {
  try {
    console.log("Received file upload request for virtual try-on");

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

    const result = await processImages(req.files);

    if (!result || typeof result !== 'string') {
      throw new Error("Invalid image data received from model");
    }

    const outputFilename = `generated-${Date.now()}.png`;
    const outputImagePath = path.join(__dirname, 'uploads', outputFilename);
    
    await fs.writeFile(outputImagePath, Buffer.from(result, 'base64'));
    
    res.json({
      success: true,
      imageUrl: `${CONFIG.BACKEND_URL}/uploads/${outputFilename}`,
      imageData: `data:image/png;base64,${result}`
    });

  } catch (error) {
    console.error("Error processing try-on request:", error);
    if (req.files) cleanupFiles(req.files);
    res.status(500).json({
      error: error.message || "An unexpected error occurred while processing your request.",
      success: false
    });
  }
});

app.post("/api/generate3d", express.json(), async (req, res) => {
  try {
    console.log("Received 3D model generation request");

    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({
        error: "Missing imageUrl parameter",
        success: false
      });
    }

    console.log(`Processing 3D generation request for image`);

    try {
      const modelFiles = await generate3DModel(imageUrl);

      if (!modelFiles || Object.keys(modelFiles).length === 0) {
        throw new Error("Failed to generate 3D model files");
      }

      res.json({
        success: true,
        modelData: modelFiles
      });
    } catch (modelError) {
      console.error("Error in 3D model generation:", modelError);
      res.status(500).json({
        error: modelError.message || "Failed to generate 3D model",
        success: false
      });
    }

  } catch (error) {
    console.error("Error processing 3D model request:", error);
    res.status(500).json({
      error: error.message || "An unexpected error occurred while generating the 3D model.",
      success: false
    });
  }
});

app.get("/api/test-hf-token", async (req, res) => {
  try {
    console.log("Testing Hugging Face token");
    
    const response = await axios.get('https://huggingface.co/api/whoami', {
      headers: {
        'Authorization': `Bearer ${CONFIG.HF_TOKEN}`
      }
    });
    
    if (response.status === 200) {
      res.json({
        success: true,
        message: "Hugging Face token is valid",
        userData: response.data
      });
    } else {
      res.status(response.status).json({
        success: false,
        message: "Failed to validate Hugging Face token",
        status: response.status
      });
    }
  } catch (error) {
    console.error("Error testing Hugging Face token:", error);
    res.status(500).json({
      success: false,
      message: "Error testing Hugging Face token",
      error: error.message
    });
  }
});

app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    corsStatus: "enabled",
    config: {
      frontend: CONFIG.FRONTEND_URL,
      backend: CONFIG.BACKEND_URL,
      gradioUrl: CONFIG.GRADIO_URL,
      gradio3dUrl: CONFIG.GRADIO_3D_URL
    }
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`CORS configured for: ${CONFIG.FRONTEND_URL}`);
});

// Error handling
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  if (process.env.NODE_ENV !== 'production') process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  if (process.env.NODE_ENV !== 'production') process.exit(1);
});

export default app;