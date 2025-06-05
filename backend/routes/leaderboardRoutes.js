// c:/Users/misba/OneDrive/Documents/workopoly1_proj/backend/routes/leaderboardRoutes.js
import express from 'express';
import { getLeaderboardData } from '../controllers/leaderboardController.js';
import { protect } from '../middleware/authMiddleware.js'; // Your authentication middleware

const router = express.Router();

// GET /api/leaderboard?filter=all-time (or daily, weekly)
// Apply protect middleware to get req.user for currentUserRank calculation
router.get('/', protect, getLeaderboardData);

export default router;
