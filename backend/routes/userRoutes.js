// c:/Users/misba/OneDrive/Documents/workopoly1_proj/backend/routes/userRoutes.js
import express from "express";
import {
  registerUser,
  loginUser,
  verifyOtp, // Import the new controller function
  getAllUsers,
  getUserById,
  updateUser, // Keep for potential admin updates by ID
  deleteUser, // Keep for potential admin deletes by ID
  getUserProfile, // Import the new controller function
  updateUserProfile, // Import new controller
  uploadProfilePicture, // Import new controller
  deleteUserProfile, // Import new controller
  upgradeUserTier, // Import the new tier upgrade controller
  // Make sure you also import resendOtpHandler if you have that route
  // resendOtpHandler
} from "../controllers/userController.js";
import { protect, admin } from '../middleware/authMiddleware.js'; // Import protect middleware
import upload from '../middleware/uploadMiddleware.js'; // Import multer middleware

const router = express.Router();

// --- Public Routes ---
router.post("/signup", registerUser);
router.post("/verify-otp", verifyOtp);
router.post("/login", loginUser);
// router.post("/resend-otp", resendOtpHandler); // Uncomment if you implement resend

// --- Private Routes (Require Authentication via 'protect' middleware) ---

// Routes for the logged-in user's own profile
router.route('/profile')
    .get(protect, getUserProfile)       // Get own profile
    .put(protect, updateUserProfile)    // Update own profile
    .delete(protect, deleteUserProfile); // Delete own profile

// Upload profile picture for current user
// The 'profilePicture' string MUST match the key used in FormData on the frontend
// Use the imported middleware directly, as it handles upload.single internally
router.post('/profile/picture', protect, upload, uploadProfilePicture);

// Route to upgrade user's subscription tier
router.put('/profile/upgrade-tier', protect, upgradeUserTier);


// --- Routes operating on specific user IDs (Mainly for Admin) ---

// Get all users (Admin only)
router.get("/", protect, admin, getAllUsers);

// Get, Update, Delete user by ID (Admin or specific checks needed)
router.route('/:id')
    .get(protect, admin, getUserById)      // Admin gets user by ID
    .put(protect, admin, updateUser)       // Admin updates user by ID
    .delete(protect, admin, deleteUser);    // Admin deletes user by ID


export default router;
