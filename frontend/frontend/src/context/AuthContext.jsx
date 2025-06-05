// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios'; // Import axios to set default header
import { getUserProfile } from '../api/userApi'; // Import API to fetch profile

// 1. Create the context
const AuthContext = createContext(null);

// 2. Create a provider component
export const AuthProvider = ({ children }) => {
  // State for the actual token
  const [token, setToken] = useState(null);
  // State to track if the initial auth check is done
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  // State for the authenticated user object
  const [user, setUser] = useState(null);

  // Effect to check localStorage for token on initial load AND validate it
  useEffect(() => {
    console.log("AuthProvider: Checking for existing token...");
    const validateToken = async () => {
      setIsLoadingAuth(true);
      const storedUserInfoString = localStorage.getItem('userInfo'); // Use 'userInfo'
      let storedToken = null;
      let storedUser = null;

      if (storedUserInfoString) {
        try {
          const storedUserInfo = JSON.parse(storedUserInfoString);
          storedToken = storedUserInfo.token;
          storedUser = storedUserInfo.user; // Assuming user object is stored
        } catch (e) {
          console.error("AuthProvider: Failed to parse stored userInfo", e);
          localStorage.removeItem('userInfo'); // Clear invalid item
        }
      }

      if (!storedToken || !storedUser) { // Check for both token and user
        console.log("AuthProvider: No valid token or user found in localStorage.");
        setToken(null);
        setUser(null);
        setIsLoadingAuth(false); // Finish loading
        return;
      }

      console.log("AuthProvider: Found token, attempting validation...");
      setToken(storedToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`; // Set default for future requests
      // Set user from localStorage initially, but be prepared for it to be overwritten or nulled
      // It's better to wait for API validation if possible, or ensure components handle isLoadingAuth
      // For now, setting it is fine, but the API call is the source of truth.
      setUser(storedUser); 

      try {
        // Call API to get profile, which implicitly validates the token
        // This call will use the token set by the interceptor from 'userInfo'
        const userDataFromApi = await getUserProfile(); // Renamed to avoid confusion with 'userData' in login
        console.log("AuthProvider: Token validation successful, user data:", userDataFromApi);
        setUser(userDataFromApi); // Set the user state with fresh data
        setToken(storedToken); // Ensure token state is also explicitly set
        // Update localStorage with potentially fresh user data from profile
        localStorage.setItem('userInfo', JSON.stringify({ token: storedToken, user: userDataFromApi })); // This is crucial
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`; // Re-affirm default header
      } catch (error) {
        console.error("AuthProvider: Token validation failed:", error.message);
        localStorage.removeItem('userInfo'); // Clear on validation failure
        setToken(null);
        setUser(null);
        delete axios.defaults.headers.common['Authorization']; // Clear default header
      } finally {
        setIsLoadingAuth(false); // Mark auth check as complete
        console.log("AuthProvider: Auth check complete.");
      }
    };

    validateToken();
  }, []); // Empty dependency array ensures this runs only once on mount

  // Login function: Sets state and stores token/user data.
  // Also used to update user data in context after operations like tier upgrade.
  const login = (tokenString, userData) => { // Accept userData from login response
    console.log("AuthContext: login function CALLED.");
    if (typeof tokenString !== 'string' || tokenString.trim().length === 0) {
      console.error("AuthContext login function received invalid token:", tokenString);
      return;
    }
    if (!userData || typeof userData !== 'object') {
      console.error("AuthContext login function received invalid userData:", userData);
      // Potentially fetch user data if only token is provided, or handle error
      return;
    }
    console.log("AuthContext: Attempting to set token:", tokenString);
    console.log("AuthContext: Attempting to set user data:", JSON.stringify(userData, null, 2));

    const userInfoToStore = { token: tokenString, user: userData };
    localStorage.setItem('userInfo', JSON.stringify(userInfoToStore)); // Store as 'userInfo' object
    setToken(tokenString);
    setUser(userData); // Set user state
    axios.defaults.headers.common['Authorization'] = `Bearer ${tokenString}`; // Set default header on login

    console.log("AuthContext: localStorage 'userInfo' AFTER setItem:", localStorage.getItem('userInfo'));
  };


  // Logout function: Clears state and removes token/user data
  const logout = () => {
    console.log("Logging out via context...");
    localStorage.removeItem('userInfo'); // Use 'userInfo'
    setToken(null);
    setUser(null); // Clear user state
    delete axios.defaults.headers.common['Authorization']; // Clear default header on logout
  };

  // Value provided to consuming components
  const value = {
    token, // Provide the actual token
    isLoggedIn: !!token && !!user, // User is logged in if token AND user object exist
    isLoadingAuth, // Provide the loading state
    login,
    logout,
    user, // Provide user info
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 3. Create a custom hook to use the context easily
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
