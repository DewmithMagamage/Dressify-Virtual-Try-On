import express from 'express';
import dotenv from 'dotenv';
import { setupMiddleware } from './middleware/setupMiddleware.js';
import { configureRoutes } from './routes/index.js';
import { CONFIG } from './config/config.js';
import { setupErrorHandlers } from './utils/errorHandlers.js';

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Set up middleware (CORS, JSON parsing, etc.)
setupMiddleware(app);

// Configure all routes
configureRoutes(app);

// Set up error handling
setupErrorHandlers();

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`CORS configured for: ${CONFIG.FRONTEND_URL}`);
});

export default app;