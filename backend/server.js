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
  REQUEST_TIMEOUT: 30000,
  MAX_FILE_SIZE: 5 * 1024 * 1024,
  ALLOWED_MIME_TYPES: ['image/jpeg', 'image/jpg', 'image/png'],
  DENOISING_STEPS: 20,
  SEED: 3,
  HF_TOKEN: "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",
  GRADIO_URL: "yisol/IDM-VTON"
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
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
  }
}));

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