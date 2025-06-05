// c:/Users/misba/OneDrive/Documents/workopoly1_proj/frontend/src/api/authApi.js
import apiClient from './axiosConfig';

/**
 * Registers a new user.
 * @param {object} userData - User data (e.g., { name, email, password })
 * @returns {Promise<object>} - The response data from the server (e.g., { message, user }) - Token might not be returned on signup if OTP is required first.
 */
export const signupUser = async (userData) => {
  try {
    // Adjust the endpoint '/api/users/signup' if your backend route is different
    const response = await apiClient.post('/api/users/signup', userData);
    // Don't store token here if OTP verification is the next step
    // Assuming the response data structure is correct from the backend
    return response.data;
  } catch (error) {
    console.error("Signup API error:", error.response?.data || error.message);
    // Re-throw a more specific error message if available from the backend response
    throw new Error(error.response?.data?.message || 'Signup failed. Please try again.');
  }
};

/**
 * Logs in a user.
 * @param {object} credentials - User credentials (e.g., { email, password })
 * @returns {Promise<object>} - The response data from the server (e.g., { user, token })
 */
export const loginUser = async (credentials) => {
  try {
    // Adjust the endpoint '/api/users/login' if your backend route is different
    const response = await apiClient.post('/api/users/login', credentials);
    // Store the entire user info object (which includes the token) upon successful login
    if (response.data?.token) { // Check if response.data and response.data.token exist
      // Assuming response.data contains { user: {...}, token: '...' } or similar
      // Store the whole object under 'userInfo'
      localStorage.setItem('userInfo', JSON.stringify(response.data));
      console.log("Stored userInfo in localStorage:", response.data); // Log what's stored
    } else {
      // Log a warning if the token is missing in the response
      console.warn("Login response did not contain a token:", response.data);
    }
    // Assuming the response data structure is correct from the backend
    return response.data;
  } catch (error) {
    console.error("Login API error:", error.response?.data || error.message);
    // Check for specific backend messages (like 'User not verified')
    if (error.response?.data?.message === 'User not verified. Please check your email for OTP.') {
         throw new Error(error.response.data.message); // Re-throw specific message
    }
    throw new Error(error.response?.data?.message || 'Login failed. Please check your credentials.');
  }
};

/**
 * Verifies the OTP for a user.
 * @param {object} verificationData - Data containing user identifier (e.g., email) and OTP.
 * @param {string} verificationData.email - The user's email.
 * @param {string} verificationData.otp - The OTP entered by the user.
 * @returns {Promise<object>} - The response data from the server (e.g., success message, maybe updated user/token).
 */
export const verifyOtp = async (verificationData) => {
  try {
    // Adjust the endpoint '/api/users/verify-otp' if your backend route is different
    const response = await apiClient.post('/api/users/verify-otp', verificationData);
    // If verification also logs the user in and returns a token/user object, store it:
    if (response.data?.token) { // Check if response.data and response.data.token exist
      // Store the whole object under 'userInfo' if verification returns it
      // Adjust if the structure is different after OTP verification
      localStorage.setItem('userInfo', JSON.stringify(response.data));
      console.log("Stored userInfo after OTP verification:", response.data); // Log what's stored
    }
    // Assuming the response data structure is correct from the backend
    return response.data;
  } catch (error) {
    console.error("OTP Verification API error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'OTP verification failed. Please check the code or try again.');
  }
};

/**
 * Requests the backend to resend the OTP for a user.
 * @param {object} identifier - Object containing the user identifier (e.g., { email: 'user@example.com' }).
 * @returns {Promise<object>} - The response data from the server (e.g., success message).
 */
export const resendOtp = async (identifier) => {
  try {
    // Adjust the endpoint '/api/users/resend-otp' if your backend route is different
    const response = await apiClient.post('/api/users/resend-otp', identifier);
    // Assuming the response data structure is correct from the backend
    return response.data; // Usually just a success message
  } catch (error) {
    console.error("Resend OTP API error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to resend OTP. Please try again later.');
  }
};

// You could add a logout function here too:
/**
 * Logs out the user by removing the user info from localStorage.
 */
export const logoutUser = () => {
    // Remove the user info object
    localStorage.removeItem('userInfo');
    // Optionally: Make an API call to invalidate the token on the backend if needed
    console.log("User logged out, userInfo removed from localStorage.");
};
