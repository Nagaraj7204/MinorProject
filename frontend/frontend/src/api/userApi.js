// src/api/userApi.js
import api from './axiosConfig'; // Your configured axios instance

/**
 * Fetches the logged-in user's profile data.
 */
export const getUserProfile = async () => {
  try {
    // Adjust endpoint if needed (e.g., /api/users/me)
    const response = await api.get('/api/users/profile');
    return response.data; // Assuming backend returns user object directly
  } catch (error) {
    console.error('Error fetching user profile:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to fetch profile data.');
  }
};

/**
 * Updates the logged-in user's profile data.
 * @param {object} updatedData - Object containing fields to update (e.g., { name, email, theme }).
 */
export const updateUserProfile = async (updatedData) => {
  try {
    const response = await api.put('/api/users/profile', updatedData);
    return response.data; // Assuming backend returns the updated user object
  } catch (error) {
    console.error('Error updating user profile:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to update profile.');
  }
};

/**
 * Uploads a new profile picture for the logged-in user.
 * @param {FormData} formData - FormData object containing the image file under the key 'profilePicture'.
 */
export const uploadProfilePicture = async (formData) => {
    try {
        // Adjust endpoint as needed
        const response = await api.post('/api/users/profile/picture', formData, {
            headers: {
                'Content-Type': 'multipart/form-data', // Important for file uploads
            },
        });
        // Assuming backend returns { profilePictureUrl: 'new_url' } or the updated user object
        return response.data;
    } catch (error) {
        console.error('Error uploading profile picture:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Failed to upload picture.');
    }
};


/**
 * Deletes the logged-in user's account.
 */
export const deleteUserAccount = async () => {
  try {
    const response = await api.delete('/api/users/profile');
    return response.data; // Assuming backend returns { message: 'Account deleted' }
  } catch (error) {
    console.error('Error deleting user account:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to delete account.');
  }
};

// --- Theme Preference ---
/**
 * Updates the user's theme preference on the server.
 * @param {string} theme - The theme to set (e.g., 'light', 'dark', 'soft-pastel').
 * @returns {Promise<object>} - The updated user object or a success message.
 */
export const updateUserThemePreference = async (theme) => {
  try {
    const response = await api.put('/api/users/profile/theme', { theme });
    return response.data; // Assuming backend returns the updated user or a success message
  } catch (error) {
    console.error('Error updating theme preference:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to update theme preference.');
  }
};

// --- Custom Task Categories ---
/**
 * Fetches the custom task categories for the logged-in user.
 */
export const fetchUserCustomCategories = async () => {
  try {
    // Adjust endpoint as per your backend API design, e.g., '/api/users/profile/categories'
    const response = await api.get('/api/users/profile/categories');
    // Assuming backend returns an object like { customCategories: [{ _id: '...', name: '...' }, ...] }
    // or just an array of categories. Adjust based on your backend response.
    return response.data.customCategories || response.data || [];
  } catch (error) {
    console.error('API Error fetching custom categories:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to fetch custom categories');
  }
};

/**
 * Adds a new custom task category for the logged-in user.
 * @param {{ name: string }} categoryData - The category data, e.g., { name: 'New Category' }
 */
export const addUserCustomCategory = async (categoryData) => {
  try {
    // Adjust endpoint as per your backend API design
    const response = await api.post('/api/users/profile/categories', categoryData);
    // Assuming backend returns the newly added category object or the updated list of categories
    return response.data.category || response.data.customCategories || response.data;
  } catch (error) {
    console.error('API Error adding custom category:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to add custom category');
  }
};

// Spin the wheel
export const spinUserWheel = async () => {
  try {
    const { data } = await api.post('/api/users/profile/spin-wheel');
    // The backend should return the prize info and updated user data
    // e.g., { message, prizeType, prizeLabel, prizeValue, user: { points, currentXP, ... } }
    return data;
  } catch (error) {
    console.error('Spin Wheel API error:', error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : new Error('Failed to spin the wheel');
  }
};

/**
 * Notifies the backend that a Pomodoro session has been completed.
 * The backend will handle awarding points/XP and updating user stats.
 */
export const completePomodoroSession = async () => {
  try {
    // The second argument to post is the body, send an empty object if no body is needed by the backend.
    // The token will be automatically included by the axios instance if it's configured with an interceptor.
    const response = await api.post('/api/users/profile/pomodoro-complete', {});
    return response.data; // Assuming backend returns the updated user object or relevant data
  } catch (error) {
    console.error('Error completing Pomodoro session:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to complete Pomodoro session.');
  }
};
// Add other user-related API functions as needed (e.g., changePassword)
