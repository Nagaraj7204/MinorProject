import axios from 'axios';

// Ensure you have REACT_APP_API_BASE_URL defined in your .env file
// Example: REACT_APP_API_BASE_URL=http://localhost:5000
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

if (!API_BASE_URL) {
  console.warn(
    'Warning: REACT_APP_API_BASE_URL environment variable is not set. Defaulting to http://localhost:5000'
  );
}

const apiClient = axios.create({
  baseURL: API_BASE_URL || 'http://localhost:5000', // Use env variable or fallback
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to automatically add the Authorization header for requests
apiClient.interceptors.request.use(
  (config) => {
    // Retrieve the stored user info object
    const userInfo = localStorage.getItem('userInfo');
    let token = null;
    if (userInfo) {
      try {
        // Extract token from the parsed object
        token = JSON.parse(userInfo).token;
      } catch (e) {
        console.error("axiosConfig: Failed to parse userInfo from localStorage", e);
        // Handle error appropriately, maybe clear invalid storage item
        // localStorage.removeItem('userInfo');
      }
    }

    // If a token exists, add it to the Authorization header
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config; // Continue with the modified request config
  },
  (error) => {
    // Handle request configuration errors
    console.error('Axios request interceptor error:', error);
    return Promise.reject(error);
  }
);

// --- Optional: Response Interceptor (Example) ---
// Handles errors globally, especially 401 Unauthorized
apiClient.interceptors.response.use(
  (response) => {
    // Any status code within the range of 2xx causes this function to trigger
    // Return the response data directly for convenience
    return response; // Return the full response object or response.data as needed
  },
  (error) => {
    // Any status codes outside the range of 2xx cause this function to trigger
    console.error('API Error Response (Interceptor):', error.response || error.message);

    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      if (error.response.status === 401) {
        // Handle Unauthorized error (e.g., token expired)
        console.error("Unauthorized access - 401. Potentially redirecting to login or refreshing token.");
        // Example: Trigger logout or redirect
        // localStorage.removeItem('userInfo'); // Clear invalid token info
        // window.location.href = '/login'; // Simple redirect (consider using react-router's navigate)
      }
      // Extract backend error message if available
      const message = error.response.data?.message || error.message || 'An unexpected error occurred';
      // Reject with an error object that contains the response for more context
      return Promise.reject({ ...error, message });

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
