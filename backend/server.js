import express from 'express';
import multer from 'multer';
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs/promises';
import fsSync from 'fs';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { client } from '@gradio/client';
import { Blob } from 'blob-polyfill';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const CONFIG = {
  MAX_RETRIES: 3,
  RETRY_DELAY: 5000,
  REQUEST_TIMEOUT: 60000, // Increased timeout for 3D processing
  MAX_FILE_SIZE: 5 * 1024 * 1024,
  ALLOWED_MIME_TYPES: ['image/jpeg', 'image/jpg', 'image/png'],
  DENOISING_STEPS: 20,
  SEED: 3,
  HF_TOKEN: "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",
  GRADIO_URL: "yisol/IDM-VTON",
  GRADIO_3D_URL: "Wuvin/Unique3D",
  MODEL_3D_PARAMS: {
    REMOVE_BACKGROUND: true,
    SEED: -1,
    GENERATE_VIDEO: true,
    REFINE_MULTIVIEW: true,
    EXPANSION_WEIGHT: -1,
    MESH_INITIALIZATION: "std"
  }
};

// Initialize express app
const app = express();

// Configure CORS for frontend
const corsOptions = {
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Type', 'Content-Disposition'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Set up static file serving
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, path) => {
    res.setHeader('Content-Type', getContentType(path));
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
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
    throw new Error(`${file.originalname} exceeds the 5MB size limit`);
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

const generate3DModel = async (imageUrl) => {
  // Log system info for debugging
  logSystemInfo();

  try {
    console.log(`Processing 3D model attempt 1/1`);

    // Download the image
    console.log(`Downloading image from: ${imageUrl}`);
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      timeout: CONFIG.REQUEST_TIMEOUT
    });

    if (response.status !== 200) {
      throw new Error(`Failed to download image, status: ${response.status}`);
    }

    const imageBlob = new Blob([Buffer.from(response.data)], { type: 'image/png' });
    console.log('Image downloaded and converted to blob successfully');

    // Initialize Gradio client
    const gradioApp = await Promise.race([
      client(CONFIG.GRADIO_3D_URL, {
        hf_token: CONFIG.HF_TOKEN
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('3D Gradio client initialization timeout')), CONFIG.REQUEST_TIMEOUT)
      )
    ]);

    console.log('3D Gradio client initialized successfully');

    // Make prediction
    const result = await Promise.race([
      gradioApp.predict("/generate3dv2", [
        imageBlob,
        CONFIG.MODEL_3D_PARAMS.REMOVE_BACKGROUND,
        CONFIG.MODEL_3D_PARAMS.SEED,
        CONFIG.MODEL_3D_PARAMS.GENERATE_VIDEO,
        CONFIG.MODEL_3D_PARAMS.REFINE_MULTIVIEW,
        CONFIG.MODEL_3D_PARAMS.EXPANSION_WEIGHT,
        CONFIG.MODEL_3D_PARAMS.MESH_INITIALIZATION
      ]),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('3D prediction timeout')), CONFIG.REQUEST_TIMEOUT * 3)
      )
    ]);

    console.log("Full Gradio response:", JSON.stringify(result, null, 2));

    if (!result || !result.data) {
      throw new Error("Invalid 3D model result data received from Gradio");
    }

    // For the specific Gradio app we're using, we need to directly access the file URLs from the model
    // Get the app configuration to examine available endpoints
    const appConfig = await gradioApp.view_api();
    console.log("Gradio API configuration:", JSON.stringify(appConfig, null, 2));
    
    // Create a map to store our model files
    const modelFiles = {};
    
    // Try to get files from the result
    if (Array.isArray(result.data)) {
      const modelIndex = 0; // Model is typically the first item
      const videoIndex = 1; // Video is typically the second item
      
      // Process model file (GLB)
      if (result.data[modelIndex]) {
        const modelItem = result.data[modelIndex];
        console.log(`Processing model file:`, JSON.stringify(modelItem, null, 2));
        
        // Check if this is a file object with a path
        if (modelItem.path && modelItem.orig_name) {
          // Extract filename from path
          const filename = modelItem.orig_name;
          
          // Try to get the file using an API call to the Gradio server
          try {
            // The file should be available at a URL like:
            // https://wuvin-unique3d.hf.space/file=/tmp/gradio/generated_XXXXXX.glb
            // Construct that URL
            const baseUrl = CONFIG.GRADIO_3D_URL.includes('.hf.space') 
              ? `https://${CONFIG.GRADIO_3D_URL.split('/').pop()}.hf.space`
              : 'https://wuvin-unique3d.hf.space'; // Use known URL as fallback
              
            const fileUrl = `${baseUrl}/file=${modelItem.path}`;
            console.log(`Attempting to download model from: ${fileUrl}`);
            
            try {
              const fileResponse = await axios.get(fileUrl, {
                responseType: 'arraybuffer',
                timeout: CONFIG.REQUEST_TIMEOUT * 2,
                headers: {
                  'Authorization': `Bearer ${CONFIG.HF_TOKEN}`
                }
              });
              
              if (fileResponse.status === 200) {
                const base64Data = Buffer.from(fileResponse.data).toString('base64');
                modelFiles.model = `data:application/octet-stream;base64,${base64Data}`;
                console.log(`Successfully downloaded model file`);
              } else {
                console.error(`Failed to download model file, status: ${fileResponse.status}`);
              }
            } catch (downloadError) {
              console.error(`Error downloading model file:`, downloadError);
            }
          } catch (error) {
            console.error(`Failed to process model file:`, error);
          }
        }
      }
      
      // Process video file (MP4) if present
      if (result.data[videoIndex]) {
        const videoItem = result.data[videoIndex];
        if (videoItem && videoItem.path) {
          console.log(`Processing video file:`, JSON.stringify(videoItem, null, 2));
          
          // Similar approach for video
          try {
            const baseUrl = CONFIG.GRADIO_3D_URL.includes('.hf.space') 
              ? `https://${CONFIG.GRADIO_3D_URL.split('/').pop()}.hf.space`
              : 'https://wuvin-unique3d.hf.space';
              
            const fileUrl = `${baseUrl}/file=${videoItem.path}`;
            console.log(`Attempting to download video from: ${fileUrl}`);
            
            try {
              const fileResponse = await axios.get(fileUrl, {
                responseType: 'arraybuffer',
                timeout: CONFIG.REQUEST_TIMEOUT * 2,
                headers: {
                  'Authorization': `Bearer ${CONFIG.HF_TOKEN}`
                }
              });
              
              if (fileResponse.status === 200) {
                const base64Data = Buffer.from(fileResponse.data).toString('base64');
                modelFiles.video = `data:video/mp4;base64,${base64Data}`;
                console.log(`Successfully downloaded video file`);
              }
            } catch (downloadError) {
              console.error(`Error downloading video file:`, downloadError);
            }
          } catch (error) {
            console.error(`Failed to process video file:`, error);
          }
        }
      }
    }
    
    // If we couldn't get files through direct calls, provide a clear error
    if (Object.keys(modelFiles).length === 0) {
      // For development/testing, we can create a placeholder
      if (process.env.NODE_ENV === 'development') {
        console.log("WARNING: Creating placeholder data for testing purposes");
        modelFiles.model = `data:application/octet-stream;base64,${Buffer.from("Placeholder GLB data").toString('base64')}`;
      } else {
        throw new Error("Unable to retrieve 3D model files from Gradio. The API may have changed or files may be inaccessible.");
      }
    }

    return modelFiles;

  } catch (error) {
    console.error(`3D model generation failed:`, error);
    
    // Additional detailed error logging
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    }
    
    throw new Error(`Failed to generate 3D model: ${error.message}`);
  }
};

// API endpoints
app.post("/api/tryon", upload.fields([
  { name: "front", maxCount: 1 },
  { name: "garment", maxCount: 1 }
]), async (req, res) => {
  try {
    console.log("Received file upload request from frontend");

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
    await fs.promises.writeFile(outputImagePath, Buffer.from(result, 'base64'));

    res.json({
      success: true,
      imageUrl: `http://localhost:5000/uploads/${outputFilename}`,
      imageData: `data:image/png;base64,${result}`
    });

  } catch (error) {
    console.error("Error processing request:", error);
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

    console.log(`Generating 3D model from image: ${imageUrl}`);

    const modelFiles = await generate3DModel(imageUrl);

    if (!modelFiles || Object.keys(modelFiles).length === 0) {
      throw new Error("Failed to generate 3D model files");
    }

    res.json({
      success: true,
      modelData: modelFiles
    });

  } catch (error) {
    console.error("Error processing 3D model request:", error);
    res.status(500).json({
      error: error.message || "An unexpected error occurred while generating the 3D model.",
      success: false
    });
  }
});

app.get("/api/test-hf-connection", async (req, res) => {
  try {
    // Test access to the Hugging Face Space
    const response = await axios.get(`https://wuvin-unique3d.hf.space/`, {
      headers: {
        'Authorization': `Bearer ${CONFIG.HF_TOKEN}`
      },
      timeout: 10000
    });
    
    res.json({
      success: true,
      status: response.status,
      message: "Successfully connected to Hugging Face Space"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to connect to Hugging Face Space",
      error: error.message
    });
  }
});

app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    corsStatus: "enabled"
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
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