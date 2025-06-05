// src/api/leaderboardApi.js
import api from './axiosConfig'; // Assuming you have a configured Axios instance

/**
 * Fetches leaderboard data from the backend.
 * @param {string} filter - The time filter ('daily', 'weekly', 'all-time').
 * @returns {Promise<object>} - A promise that resolves to the leaderboard data object
 *                              (e.g., { leaderboard: [], currentUserRank: {} }).
 * @throws {Error} - Throws an error if the API request fails.
 */
export const getLeaderboard = async (filter = 'all-time') => {
  try {
    // Adjust the endpoint '/api/leaderboard' and query parameter 'filter'
    // based on your actual backend API route.
    const response = await api.get('/api/leaderboard', {
      params: { filter } // Pass the filter as a query parameter
    });

    // Assuming the backend returns data in the format:
    // {
    //   leaderboard: [ { _id: '...', username: '...', points: ..., ... }, ... ],
    //   currentUserRank: { rank: ..., username: '...', points: ..., _id: '...' } // Optional, if backend provides it
    // }
    if (response.data && Array.isArray(response.data.leaderboard)) {
      return response.data;
    } else {
      console.error("Invalid leaderboard data format received:", response.data);
      throw new Error('Invalid data format received from server.');
    }
  } catch (error) {
    console.error('Error fetching leaderboard:', error.response?.data || error.message);
    // Throw a more specific error message if available from the backend
    throw new Error(error.response?.data?.message || 'Failed to fetch leaderboard data.');
  }
};
