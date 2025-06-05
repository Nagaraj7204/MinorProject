// controllers/bonusController.js
import User from '../models/User.js';

// Configuration for the bonus
const DAILY_BONUS_AMOUNT = 10; // Points awarded for daily bonus

// @desc    Claim the daily bonus
// @route   POST /api/bonuses/claim
// @access  Private
export const claimDailyBonus = async (req, res) => {
    try {
        const userId = req.user._id; // Get user ID from protect middleware

        // Find the user
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // --- Check Bonus Eligibility ---
        const now = new Date();
        const todayStart = new Date(new Date().setHours(0, 0, 0, 0)); // Start of today

        // Check if user.lastBonusClaim exists and if it's before the start of today
        if (user.lastBonusClaim && user.lastBonusClaim >= todayStart) {
            // Already claimed today
            return res.status(400).json({
                message: 'Daily bonus already claimed today.',
                alreadyClaimed: true,
                lastClaimTimestamp: user.lastBonusClaim // Send back the last claim time
            });
        }

        // --- Award Bonus ---
        user.points += DAILY_BONUS_AMOUNT;
        user.lastBonusClaim = now; // Record the current time as the last claim time

        // Save the updated user document
        const updatedUser = await user.save();

        console.log(`User ${user.email} claimed daily bonus of ${DAILY_BONUS_AMOUNT} points.`);

        // Respond with success and updated info
        res.status(200).json({
            success: true,
            message: `Daily bonus of ${DAILY_BONUS_AMOUNT} points claimed!`,
            newTotalPoints: updatedUser.points,
            lastClaimTimestamp: updatedUser.lastBonusClaim
        });

    } catch (error) {
        console.error('Error claiming daily bonus:', error);
        res.status(500).json({ message: 'Server Error claiming daily bonus' });
    }
};

// Optional: Add a controller to just get the bonus status if needed later
// export const getBonusStatus = async (req, res) => { ... };