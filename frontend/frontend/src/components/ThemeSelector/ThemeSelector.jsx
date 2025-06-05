// c:/Users/misba/OneDrive/Documents/workopoly1_proj/frontend/src/components/ThemeSelector/ThemeSelector.jsx
import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext'; // For potential tier-based restrictions
import styles from './ThemeSelector.module.css';

const ThemeSelector = () => {
  const { currentTheme, setTheme } = useTheme();
  const { user: authUser } = useAuth(); // Get authenticated user details

  const handleThemeChange = (event) => {
    const newTheme = event.target.value;
    setTheme(newTheme);

    // Note: If you want to immediately save the theme preference to the backend
    // when the user selects it here (rather than only when they save the whole profile),
    // you would make an API call here. For example:
    // import { updateUserProfile } from '../../api/userApi';
    // updateUserProfile({ theme: newTheme }).catch(err => console.error("Failed to save theme", err));
    // However, typically this is saved when the user clicks "Save Changes" on their profile.
  };

  // Example: Determine if dark theme is a premium feature
  // This logic should align with your actual subscription tiers and features
  // For this example, let's assume 'basic' tier cannot permanently save 'dark' theme,
  // but 'standard' and 'premium' can.
  // The ThemeContext will still apply the theme visually for the session.
  // The backend would handle persistence based on tier when the profile is saved.
  
  let showUpgradeMessage = false;
  if (currentTheme === 'dark' && authUser) {
    // Example tier check:
    // Replace 'basic', 'standard', 'premium' with your actual tier identifiers
    if (authUser.subscriptionTier === 'basic') { 
      showUpgradeMessage = true;
    }
  }

  return (
    <div className={styles.themeSelectorContainer}>
      <label htmlFor="theme-select">Theme:</label>
      <select
        id="theme-select"
        value={currentTheme}
        onChange={handleThemeChange}
        // The select element will be styled by `.themeSelectorContainer select`
        // from your ThemeSelector.module.css
      >
        <option value="light">Light</option>
        <option value="dark">Dark</option>
        {/* You can add more theme options here if needed */}
        {/* e.g., <option value="system">System Preference</option> */}
      </select>
      {showUpgradeMessage && (
        <p className={styles.upgradeMessage}>
          Dark theme is a premium feature. Upgrade to save this preference.
        </p>
      )}
    </div>
  );
};

export default ThemeSelector;
