// src/api/apiClient.js
import axios from 'axios';

// Base URL for your backend API
const API_BASE_URL = 'http://localhost:5000/api'; // Use environment variable in production

// Create an Axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Request Interceptor ---
// This function runs before every request is sent
apiClient.interceptors.request.use(
  (config) => {
    // Retrieve the token (adjust storage key if needed)
    const userInfo = localStorage.getItem('userInfo'); // Or get from AuthContext if feasible/preferred
    let token = null;
    if (userInfo) {
        try {
            token = JSON.parse(userInfo).token;
        } catch (e) {
            console.error("Failed to parse user info for token", e);
        }
    }

    // If a token exists, add it to the Authorization header
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    // console.log('Sending request with config:', config); // Optional: Log outgoing requests
    return config; // Continue with the modified request config
  },
  (error) => {
    // Handle request configuration errors
    console.error('Axios request interceptor error:', error);
    return Promise.reject(error);
  }
);

// --- Response Interceptor (Optional but Recommended) ---
// Handles errors globally, especially 401 Unauthorized
apiClient.interceptors.response.use(
  (response) => {
    // Any status code within the range of 2xx causes this function to trigger
    // Return the response data directly for convenience
    return response.data;
  },
  (error) => {
    // Any status codes outside the range of 2xx cause this function to trigger
    console.error('API Error Response (Interceptor):', error.response || error.message);

    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      if (error.response.status === 401) {
        // Handle Unauthorized error (e.g., token expired)
        console.error("Unauthorized access - 401. Potentially redirecting to login.");
        // Example: Trigger logout or redirect
        // window.location.href = '/login'; // Simple redirect (consider using react-router's navigate)
        // Or call a logout function from your AuthContext
      }
      // Extract backend error message if available
      const message = error.response.data?.message || error.message || 'An unexpected error occurred';
      return Promise.reject(new Error(message));

    } else if (error.request) {
      // The request was made but no response was received
      console.error('API Error: No response received', error.request);
      return Promise.reject(new Error('Network error or server is down.'));
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('API Error: Request setup failed', error.message);
      return Promise.reject(new Error(error.message));
    }
  }
);


export default apiClient;
