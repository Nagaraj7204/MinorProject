// c:/Users/misba/OneDrive/Documents/workopoly1_proj/backend/controllers/rewardController.js
import User from '../models/User.js';

// Define rewards server-side to validate costs (or fetch from a DB)
// Ensure IDs match the frontend `availableRewards`
const rewardsData = {
    'theme_dark': { cost: 100, type: 'theme' },
    'theme_ocean': { cost: 250, type: 'theme' },
    'username_custom': { cost: 50, type: 'feature' }, // Note: Username unlock might be handled differently (just check points)
    'avatar_cat': { cost: 75, type: 'avatar' },
    'avatar_robot': { cost: 75, type: 'avatar' },
};

// @desc    Unlock a reward
// @route   POST /api/rewards/unlock
// @access  Private
export const unlockReward = async (req, res) => {
    const { rewardId } = req.body;
    const userId = req.user._id;

    const reward = rewardsData[rewardId];

    if (!reward) {
        return res.status(404).json({ message: 'Reward not found.' });
    }

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Check if already unlocked
        if (user.unlockedRewardIds.includes(rewardId)) {
            return res.status(400).json({ message: 'Reward already unlocked.' });
        }

        // Check points
        if (user.points < reward.cost) {
            return res.status(400).json({ message: 'Insufficient points.' });
        }

        // Deduct points and add reward ID using $addToSet for safety
        const updateResult = await User.updateOne(
            { _id: userId },
            {
                $inc: { points: -reward.cost },
                $addToSet: { unlockedRewardIds: rewardId }
            }
        );

        if (updateResult.modifiedCount === 0 && updateResult.matchedCount === 1) {
             // This might happen if the reward was somehow added between the check and update
             console.warn(`Unlock attempt for ${rewardId} by ${user.email} matched but didn't modify.`);
             // Re-fetch user to send current state
        }

        const updatedUser = await User.findById(userId).select('points unlockedRewardIds'); // Fetch only needed fields

        console.log(`User ${user.email} unlocked reward ${rewardId}. Points remaining: ${updatedUser.points}`);
        // Return updated relevant info
        res.status(200).json({
            points: updatedUser.points,
            unlockedRewardIds: updatedUser.unlockedRewardIds,
        });

    } catch (error) {
        console.error(`Error unlocking reward ${rewardId} for user ${userId}:`, error);
        res.status(500).json({ message: 'Server error unlocking reward.' });
    }
};

// @desc    Equip a reward (Theme or Avatar)
// @route   POST /api/rewards/equip
// @access  Private
export const equipReward = async (req, res) => {
    const { rewardId } = req.body; // Frontend sends the ID of the reward to equip
    const userId = req.user._id;

    const reward = rewardsData[rewardId];

    if (!reward || (reward.type !== 'theme' && reward.type !== 'avatar')) {
         // Only allow equipping themes or avatars via this endpoint
        return res.status(400).json({ message: 'Reward not found or cannot be equipped.' });
    }

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Check if unlocked
        if (!user.unlockedRewardIds.includes(rewardId)) {
            return res.status(400).json({ message: 'Reward must be unlocked before equipping.' });
        }

        // Update based on type
        let update = {};
        if (reward.type === 'theme') {
            update.theme = rewardId; // Store the theme ID (e.g., 'theme_dark')
        } else if (reward.type === 'avatar') {
            update.equippedAvatarId = rewardId; // Store the avatar ID
        }

        const updatedUser = await User.findByIdAndUpdate(userId, update, { new: true }).select('theme equippedAvatarId');

        console.log(`User ${user.email} equipped ${reward.type}: ${rewardId}`);
        res.status(200).json({ // Return updated relevant fields
            theme: updatedUser.theme,
            equippedAvatarId: updatedUser.equippedAvatarId,
        });

    } catch (error) {
        console.error(`Error equipping reward ${rewardId} for user ${userId}:`, error);
        res.status(500).json({ message: 'Server error equipping reward.' });
    }
};
