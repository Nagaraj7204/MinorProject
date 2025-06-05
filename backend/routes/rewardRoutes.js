// c:/Users/misba/OneDrive/Documents/workopoly1_proj/backend/routes/rewardRoutes.js
import express from 'express';
import { unlockReward, equipReward } from '../controllers/rewardController.js';
import { protect } from '../middleware/authMiddleware.js'; // Your authentication middleware

const router = express.Router();

// Unlock a reward
router.post('/unlock', protect, unlockReward);

// Equip a reward
router.post('/equip', protect, equipReward);

export default router;
