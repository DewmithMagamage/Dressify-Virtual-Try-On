import { tryOnRoutes } from './tryOnRoutes.js';
import { modelRoutes } from './modelRoutes.js';
import { utilityRoutes } from './utilityRoutes.js';

export const configureRoutes = (app) => {
  // Set up all routes
  tryOnRoutes(app);
  modelRoutes(app);
  utilityRoutes(app);
};