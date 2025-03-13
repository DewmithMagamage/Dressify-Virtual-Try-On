// import multer from 'multer';
// import path from 'path';
// import { CONFIG } from '../config/config.js';

// // Configure multer
// const storage = multer.diskStorage({
//   destination: "uploads/",
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//     cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
//   }
// });

// export const upload = multer({
//   storage: storage,
//   limits: { fileSize: CONFIG.MAX_FILE_SIZE }
// });