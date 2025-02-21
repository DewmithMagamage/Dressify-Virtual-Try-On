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
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Type', 'Content-Disposition'],
  credentials: true
};

app.use(cors(corsOptions));

// Set up static file serving BEFORE defining routes
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, path) => {
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
  }
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

// Cleanup files function
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

// Function to download image from URL
const downloadImage = async (url) => {
  try {
    console.log(`Downloading image from: ${url}`);
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    
    if (response.status !== 200) {
      throw new Error(`Failed to download image, status: ${response.status}`);
    }
    
    return Buffer.from(response.data);
  } catch (error) {
    console.error('Download error:', error.message);
    throw new Error(`Failed to download result image: ${error.message}`);
  }
};

// Function to process images using Gradio client with retries
const processImages = async (files) => {
  let retries = 0;
  
  while (retries < CONFIG.MAX_RETRIES) {
    try {
      console.log(`Processing attempt ${retries + 1}/${CONFIG.MAX_RETRIES}`);
      
      const gradioApp = await client("yisol/IDM-VTON", { hf_token: "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" });
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
      console.log('Result data type:', typeof result.data);
      
      // Convert result to string for preview
      const preview = typeof result.data === 'object' 
        ? JSON.stringify(result.data).substring(0, 200) 
        : String(result.data).substring(0, 200);
      console.log('Result data preview:', preview);

      // Check if result data is valid
      if (!result || !result.data) {
        throw new Error("Invalid result data received from Gradio");
      }

      // Handle array result (which contains URL to generated image)
      if (Array.isArray(result.data) && result.data.length > 0) {
        const firstItem = result.data[0];
        
        // Check if the item has a URL property
        if (firstItem && firstItem.url) {
          console.log(`Found result image URL: ${firstItem.url}`);
          
          // Download the image from the URL
          const imageBuffer = await downloadImage(firstItem.url);
          console.log(`Successfully downloaded image, size: ${imageBuffer.length} bytes`);
          
          return imageBuffer.toString('base64');
        }
      }
      
      // Handle other data types
      if (Buffer.isBuffer(result.data)) {
        return result.data.toString('base64');
      } else if (typeof result.data === 'string') {
        // If it's already a string, return it directly if it looks like base64
        if (result.data.match(/^[A-Za-z0-9+/=]+$/)) {
          return result.data;
        }
        // Otherwise, it might be a URL
        try {
          const imageBuffer = await downloadImage(result.data);
          return imageBuffer.toString('base64');
        } catch (err) {
          console.error("Failed to download from string URL:", err);
          throw new Error("Invalid image URL in response");
        }
      } else if (result.data instanceof Blob) {
        // If it's a Blob, convert to base64
        const arrayBuffer = await result.data.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        return buffer.toString('base64');
      } else if (typeof result.data === 'object') {
        // If it's an object that contains image data
        if (result.data.image && Buffer.isBuffer(result.data.image)) {
          return result.data.image.toString('base64');
        } else if (result.data.data && Buffer.isBuffer(result.data.data)) {
          return result.data.data.toString('base64');
        } else if (result.data.url) {
          // If object has a URL property
          const imageBuffer = await downloadImage(result.data.url);
          return imageBuffer.toString('base64');
        }
      }
      
      // If we reach here, we couldn't handle the result format
      console.log("Unexpected data type:", typeof result.data);
      throw new Error("Unexpected result data format");
      
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

// API endpoint to handle image uploads
app.post("/api/tryon", upload.fields([
  { name: "front", maxCount: 1 },
  { name: "garment", maxCount: 1 }
]), async (req, res) => {
  try {
    console.log("Received file upload request from frontend");

    // Check if files are uploaded
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

    // Process images using Gradio
    const result = await processImages(req.files);
    
    // Verify base64 string
    if (!result || typeof result !== 'string') {
      throw new Error("Invalid image data received from model");
    }
    
    // Save the generated image with a more reliable filename
    const outputFilename = `generated-${Date.now()}.png`;
    const outputImagePath = path.join(__dirname, 'uploads', outputFilename);
    fs.writeFileSync(outputImagePath, Buffer.from(result, 'base64'));
    console.log(`Generated image saved to: ${outputImagePath}`);

    // Verify the file exists and can be read
    try {
      const fileExists = fs.existsSync(outputImagePath);
      console.log(`File exists check: ${fileExists}`);

      const stats = fs.statSync(outputImagePath);
      console.log(`File permissions: ${stats.mode}`);
      console.log(`File size: ${stats.size} bytes`);

      const testBuffer = fs.readFileSync(outputImagePath);
      console.log(`File can be read, size: ${testBuffer.length} bytes`);
    } catch (err) {
      console.error("File verification error:", err);
    }

    // Serve the generated image with the correct URL path
    res.json({
      success: true,
      imageUrl: `http://localhost:5000/uploads/${outputFilename}`,
      imageData: `data:image/png;base64,${result}` 
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
  if (process.env.NODE_ENV === 'production') {
    console.error('Production mode - continuing despite error');
  } else {
    process.exit(1);
  }
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  if (process.env.NODE_ENV === 'production') {
    console.error('Production mode - continuing despite rejection');
  } else {
    process.exit(1);
  }
});