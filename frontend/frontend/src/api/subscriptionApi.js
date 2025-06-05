import apiClient from './axiosConfig'; // Assuming you have this configured

/**
 * Upgrades the user's subscription tier.
 * @param {string} targetTierId - The ID of the tier to upgrade to (e.g., 'silver', 'gold').
 * @returns {Promise<object>} - The updated user object from the server.
 */
export const upgradeSubscriptionTier = async (targetTierId) => {
  try {
    const response = await apiClient.put('/api/users/profile/upgrade-tier', { targetTierId });
    return response.data; // Expected: updated user object
  } catch (error) {
    console.error("Upgrade Subscription API error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to upgrade subscription.');
  }
};