// c:/Users/misba/OneDrive/Documents/workopoly1_proj/backend/middleware/uploadMiddleware.js
import multer from 'multer';
import path from 'path';
// import { CloudinaryStorage } from 'multer-storage-cloudinary'; // Not needed for local storage
// import { v2 as cloudinary } from 'cloudinary'; // Not needed for local storage
// import dotenv from 'dotenv'; // Not needed unless other config uses it
import fs from 'fs'; // Import Node.js file system module

// dotenv.config(); // Load environment variables

// --- Local Disk Storage Configuration ---
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = 'uploads/profile_pics/'; // Define your upload directory relative to project root
        // Create the directory if it doesn't exist
        fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath); // Tell multer where to save the files
    },
    filename: function (req, file, cb) {
        // Create a unique filename: fieldname-timestamp.extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        // Use 'profilePicture' as fieldname part for consistency
        cb(null, 'profilePicture' + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});
// --- End Local Disk Storage Configuration ---


// --- Cloudinary Storage Configuration (Keep commented out or remove) ---
// const storage = new CloudinaryStorage({
//     cloudinary: cloudinary,
//     params: { /* ... Cloudinary params ... */ },
// });
// --- End Cloudinary Storage Configuration ---


// Multer filter to accept only images
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        // Reject file with a specific error message for the controller/middleware to catch
        // Use a standard Error object for better compatibility
        cb(new Error('Not an image! Please upload only images.'), false);
    }
};

// Configure Multer
// Increased file size limit slightly for flexibility
const upload = multer({
    storage: storage, // Use the diskStorage configuration
    fileFilter: fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Middleware to attach multer errors to the request object for easier handling in controller
const uploadMiddleware = (req, res, next) => {
    // Use the 'upload.single' middleware
    const uploader = upload.single('profilePicture');

    uploader(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading.
            console.error('Multer Error:', err.message);
            // Attach error to request for controller to handle
            req.multerError = err;
        } else if (err) {
            // An unknown error occurred when uploading.
            console.error('Unknown Upload Error:', err.message);
            req.multerError = new Error('File upload failed due to an unknown error.'); // Generic error
        }
        // Everything went fine or error is attached to req.
        next();
    });
};


export default uploadMiddleware; // Export the wrapper middleware
