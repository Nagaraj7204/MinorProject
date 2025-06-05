// c:/Users/misba/OneDrive/Documents/workopoly1_proj/backend/utils/gamificationUtils.js
import User from '../models/User.js';

/**
 * Awards a badge to a user if they don't already have it.
 * @param {string} userId - The ID of the user to award the badge to.
 * @param {string} badgeName - The name (or emoji) of the badge to award.
 */
export const awardBadge = async (userId, badgeName) => {
    if (!userId || !badgeName) {
        console.error('awardBadge requires userId and badgeName');
        return;
    }
    try {
        // Use $addToSet to add the badge only if it doesn't already exist in the array
        const result = await User.findByIdAndUpdate(
            userId,
            { $addToSet: { badges: badgeName } },
            { new: true } // Optional: return updated user document
        );

        // Log if the user was found and the operation attempted (doesn't guarantee addition if badge already existed)
        if (result) {
            console.log(`Checked/Awarded badge "${badgeName}" for user ${userId}`);
        }
    } catch (error) {
        console.error(`Error awarding badge "${badgeName}" to user ${userId}:`, error);
    }
};