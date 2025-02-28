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
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Utility functions
const cleanupFiles = (files) => {
  try {
    if (!files) return;
    Object.keys(files).forEach(fieldName => {
      files[fieldName].forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
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
    const buffer = await fs.promises.readFile(filePath);
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

const downloadFile = async (url, outputPath) => {
  try {
    console.log(`Downloading file from: ${url}`);
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: CONFIG.REQUEST_TIMEOUT * 2, // Longer timeout for 3D files
      maxContentLength: 50 * 1024 * 1024, // Larger size limit for 3D files
      headers: {
        'Accept': '*/*'
      }
    });
    
    if (response.status !== 200) {
      throw new Error(`Failed to download file, status: ${response.status}`);
    }
    
    await fs.promises.writeFile(outputPath, Buffer.from(response.data));
    return outputPath;
  } catch (error) {
    throw new Error(`Failed to download file: ${error.message}`);
  }
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
  let retries = 0;
  
  while (retries < CONFIG.MAX_RETRIES) {
    try {
      console.log(`Processing 3D model attempt ${retries + 1}/${CONFIG.MAX_RETRIES}`);
      
      // First, download the image
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

      if (!result || !result.data || !Array.isArray(result.data)) {
        throw new Error("Invalid 3D model result data received from Gradio");
      }

      // Extract URLs from the response
      const modelFiles = {};
      const timestamp = Date.now();
      
      // Expected outputs: GLB model, video, front/back/side views
      const outputs = result.data;
      
      if (outputs.length >= 5) {
        // Download model file (GLB)
        if (outputs[0] && outputs[0].url) {
          const modelPath = path.join(__dirname, 'uploads', `model-${timestamp}.glb`);
          await downloadFile(outputs[0].url, modelPath);
          modelFiles.model = `http://localhost:5000/uploads/model-${timestamp}.glb`;
        }
        
        // Download video
        if (outputs[1] && outputs[1].url) {
          const videoPath = path.join(__dirname, 'uploads', `video-${timestamp}.mp4`);
          await downloadFile(outputs[1].url, videoPath);
          modelFiles.video = `http://localhost:5000/uploads/video-${timestamp}.mp4`;
        }
        
        // Download front, back, and side views
        for (let i = 2; i < 5 && i < outputs.length; i++) {
          if (outputs[i] && outputs[i].url) {
            const viewType = ['front', 'back', 'side'][i-2];
            const imagePath = path.join(__dirname, 'uploads', `${viewType}-${timestamp}.png`);
            await downloadFile(outputs[i].url, imagePath);
            modelFiles[viewType] = `http://localhost:5000/uploads/${viewType}-${timestamp}.png`;
          }
        }
      }
      
      return modelFiles;
      
    } catch (error) {
      retries++;
      console.error(`3D model attempt ${retries} failed:`, error);
      
      if (retries === CONFIG.MAX_RETRIES) {
        throw new Error(`Failed to generate 3D model after ${CONFIG.MAX_RETRIES} attempts: ${error.message}`);
      }
      
      // Exponential backoff
      const delay = Math.min(CONFIG.RETRY_DELAY * Math.pow(2, retries - 1), 30000);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
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