import React, { createContext, useState, useContext, useEffect } from 'react';
// We'll create a placeholder for this API call, assuming you'll implement it later
// import { updateUserThemePreference } from '../api/userApi'; // Example API call

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  // Renamed to avoid confusion with the exported setTheme function
  const [currentTheme, setCurrentThemeInternal] = useState(() => {
    // 1. Try to get theme from localStorage
    const storedTheme = localStorage.getItem('appTheme');
    // 2. If not found, default to 'light'
    return storedTheme || 'light';
  });

  // Effect to apply the theme to the document body
  useEffect(() => {
    const body = document.body;
    // Remove any existing theme classes to avoid conflicts
    // Be explicit about the theme classes you use (e.g., 'light-theme', 'dark-theme')
    body.classList.remove('light-theme', 'dark-theme'); // Add any other theme classes if you have more

    // Add the new theme class
    if (currentTheme) {
      body.classList.add(`${currentTheme}-theme`);
      // console.log(`Applied theme to body: ${currentTheme}-theme`); // For debugging
    }
  }, [currentTheme]); // Re-run when currentTheme changes

  const setTheme = async (theme) => {
    // Only update if the theme is actually changing
    if (theme !== currentTheme) {
      // console.log(`Setting theme from ${currentTheme} to ${theme}`); // For debugging
      // try {
      //   // Placeholder for API call to save theme preference to backend
      //   // await updateUserThemePreference(theme); // Example API call
      //   setCurrentThemeInternal(theme);
      //   localStorage.setItem('appTheme', theme);
      // } catch (error) {
      //   console.error('Failed to update theme preference on server:', error);
      //   // Optionally, revert or notify user if backend update fails
      // }

      // Simplified version (without backend call for now):
      setCurrentThemeInternal(theme);
      localStorage.setItem('appTheme', theme);
    }
  };

  // Effect to listen for theme changes in other tabs/windows (via localStorage)
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === 'appTheme') {
        const newTheme = event.newValue;
        if (newTheme && newTheme !== currentTheme) {
          // console.log(`Storage event: Theme changed in another tab to ${newTheme}`); // For debugging
          setCurrentThemeInternal(newTheme); // This will trigger the body class update via the other useEffect
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [currentTheme]); // currentTheme is needed to compare with newTheme from storage event

  return <ThemeContext.Provider value={{ currentTheme, setTheme }}>{children}</ThemeContext.Provider>;
};
