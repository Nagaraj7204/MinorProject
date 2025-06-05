// src/api/rewardApi.js
import api from './axiosConfig'; // Your configured axios instance

/**
 * Unlocks a specific reward for the user.
 * @param {string} rewardId - The ID of the reward to unlock.
 */
export const unlockReward = async (rewardId) => {
  try {
    const response = await api.post('/api/rewards/unlock', { rewardId });
    return response.data; // Expects { points: number, unlockedRewardIds: string[] }
  } catch (error) {
    console.error('Error unlocking reward:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to unlock reward.');
  }
};

/**
 * Equips a specific reward for the user.
 * @param {string} rewardId - The ID of the reward to equip.
 * @param {string} rewardType - The type of reward ('theme', 'avatar', etc.).
 */
export const equipReward = async (rewardId, rewardType) => {
    try {
      // Pass rewardType in body if needed by backend, otherwise just rewardId is fine based on current backend controller
      const response = await api.post('/api/rewards/equip', { rewardId });
      return response.data; // Expects { theme: string, equippedAvatarId: string | null }
    } catch (error) {
      console.error('Error equipping reward:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to equip reward.');
    }
  };
