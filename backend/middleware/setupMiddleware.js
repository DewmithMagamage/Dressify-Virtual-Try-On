import cors from 'cors';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fsSync from 'fs';
import { CONFIG } from '../config/config.js';
import { getContentType } from '../utils/fileUtils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const setupMiddleware = (app) => {
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

  // Get absolute path to uploads directory (this needs to be the same path used in tryOnRoutes.js)
  const uploadsPath = path.join(dirname(dirname(__dirname)), 'uploads');
  
  // Create uploads directory if it doesn't exist
  if (!fsSync.existsSync(uploadsPath)) {
    fsSync.mkdirSync(uploadsPath, { recursive: true });
    console.log(`Created uploads directory at: ${uploadsPath}`);
  }

  // Set up static file serving with proper MIME types
  app.use('/uploads', express.static(uploadsPath, {
    setHeaders: (res, filePath) => {
      res.setHeader('Content-Type', getContentType(filePath));
      res.setHeader('Access-Control-Allow-Origin', CONFIG.FRONTEND_URL);
      res.setHeader('Access-Control-Allow-Methods', 'GET');
    }
  }));
  
  console.log(`Static file serving configured for uploads directory: ${uploadsPath}`);
};