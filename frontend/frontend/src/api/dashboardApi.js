import apiClient from './axiosConfig'; // Import the configured Axios instance from axiosConfig.js

// Note: Base URL is handled by apiClient (from axiosConfig.js)
// Note: Token is handled by the interceptor in apiClient (from axiosConfig.js)
// Note: Basic error logging and response data extraction might be handled by interceptors if configured there.

/**
 * Fetches the profile data for the currently logged-in user.
 * @returns {Promise<object>} - A promise that resolves to the user profile data.
 */
export const getUserProfile = async () => {
    // Assuming your baseURL in axiosConfig is 'http://localhost:5000' or similar,
    // and your backend route is '/api/users/profile'
    const endpoint = '/api/users/profile'; // Relative path to the base URL + API prefix if needed

    console.log(`Fetching user profile from: ${endpoint}`);
    try {
        const response = await apiClient.get(endpoint);
        return response.data; // Axios automatically extracts data
    } catch (error) {
        console.error("Get User Profile API error:", error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Failed to fetch user profile.');
    }
};

/**
 * Fetches task statistics for the currently logged-in user.
 * @returns {Promise<object>} - A promise that resolves to the task statistics.
 */
export const getTaskStats = async () => {
    const endpoint = '/api/tasks/stats'; // Relative path

    console.log(`Fetching task stats from: ${endpoint}`);
    try {
        const response = await apiClient.get(endpoint);
        return response.data;
    } catch (error) {
        console.error("Get Task Stats API error:", error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Failed to fetch task statistics.');
    }
};

/**
 * Fetches tasks based on filter options (e.g., due tasks).
 * @param {object} [filterOptions] - Optional filters (e.g., { status: 'due' })
 * @returns {Promise<Array<object>>} - A promise that resolves to an array of task objects.
 */
export const getDueTasks = async (filterOptions = { status: 'due' }) => { // Default filter here if needed
    const endpoint = '/api/tasks'; // Relative path

    console.log(`Fetching due tasks from: ${endpoint} with filters:`, filterOptions);
    try {
        // Pass filterOptions directly to the params config
        const response = await apiClient.get(endpoint, { params: filterOptions });
        return response.data;
    } catch (error) {
        console.error("Get Due Tasks API error:", error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Failed to fetch due tasks.');
    }
};

/**
 * Sends a request to claim the daily bonus.
 * @param {number} amount - The amount of the bonus being claimed (optional, backend might determine this).
 * @returns {Promise<object>} - A promise that resolves to the result of the claim (e.g., new point total, timestamp).
 */
export const claimBonus = async (amount) => {
    const endpoint = '/api/bonuses/claim'; // Relative path

    console.log(`Claiming bonus via: ${endpoint}`);
    try {
        // Send data in the second argument for POST requests
        const response = await apiClient.post(endpoint, { amount }); // Send amount in request body
        return response.data;
    } catch (error) {
        console.error("Claim Bonus API error:", error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Failed to claim daily bonus.');
    }
};

/**
 * Fetches the timestamp of the last bonus claim for the user.
 * (Optional: Only needed if you move away from localStorage for this)
 * @returns {Promise<object>} - A promise that resolves to an object containing the last claim time.
 */
export const getLastBonusClaim = async () => {
    const endpoint = '/api/bonuses/status'; // Relative path

    console.log(`Fetching bonus status from: ${endpoint}`);
    try {
        const response = await apiClient.get(endpoint);
        return response.data;
    } catch (error) {
        console.error("Get Last Bonus Claim API error:", error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Failed to fetch bonus status.');
    }
};
