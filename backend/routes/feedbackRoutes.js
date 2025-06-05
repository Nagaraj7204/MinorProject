// backend/routes/feedbackRoutes.js
import express from 'express';
const router = express.Router();
import { protect } from '../middleware/authMiddleware.js'; // User authentication
import { submitFeedback } from '../controllers/feedbackController.js';

// @desc    Submit new feedback or bug report
// @route   POST /api/feedback
// @access  Private (User)
router.post('/', protect, submitFeedback);

export default router;
