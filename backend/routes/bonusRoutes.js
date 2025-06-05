// routes/bonusRoutes.js
import express from 'express';
import { protect } from '../middleware/authMiddleware.js'; // Import protect middleware
import { claimDailyBonus } from '../controllers/bonusController.js'; // Import the controller

const router = express.Router();

// --- Protected Bonus Routes ---

// POST /api/bonuses/claim - Claim the daily bonus
router.post('/claim', protect, claimDailyBonus);

export default router;