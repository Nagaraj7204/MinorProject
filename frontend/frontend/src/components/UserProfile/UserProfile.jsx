// c:/Users/misba/OneDrive/Documents/workopoly1_proj/frontend/src/components/UserProfile/UserProfile.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext'; // Keep for theme context, even if selector is removed from this page
import styles from './UserProfile.module.css';
import { FaUserCircle, FaPlusCircle, FaLock, FaEdit, FaSave, FaTimes, FaInfoCircle } from 'react-icons/fa';
import {
  getUserProfile,
  updateUserProfile,
  uploadProfilePicture
} from '../../api/userApi';
// ThemeSelector import is removed as the section is removed from this page.
// If you want to place ThemeSelector elsewhere or bring it back, you'd re-add it.

// --- TierBadge Component ---
const TierBadge = ({ tier }) => {
  if (!tier) return null;

  let badgeContent = null;
  let badgeClass = '';

  switch (tier.toLowerCase()) {
    case 'silver':
      badgeContent = '🥈 Silver';
      badgeClass = styles.silverBadge;
      break;
    case 'gold':
      badgeContent = '🥇 Gold';
      badgeClass = styles.goldBadge;
      break;
    case 'diamond':
      badgeContent = '💎 Diamond';
      badgeClass = styles.diamondBadge;
      break;
    default:
      return null;
  }
  return <span className={`${styles.tierBadge} ${badgeClass}`}>{badgeContent}</span>;
};

const UserProfile = () => {
  const usernameUnlockCost = 100; // Username editing unlocks at 100 points

  const [userData, setUserData] = useState({
    name: '',
    username: '',
    email: '',
    role: '',
    createdAt: '',
    profilePictureUrl: null,
    points: 0,
    tier: '',
    // Removed: tasksCompleted, badges, level, currentXP, xpForNextLevel as they are not displayed here
  });

  const [originalUserData, setOriginalUserData] = useState(null);
  const [profileDataLoaded, setProfileDataLoaded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // For save/upload operations
  const [isFetchingProfile, setIsFetchingProfile] = useState(true); // For initial profile load
  const [error, setError] = useState(null);
  const [showUnlockInfo, setShowUnlockInfo] = useState(null); // For username lock tooltip

  const { user: authUser, isAuthLoading, login: updateUserInAuthContext } = useAuth(); // Get login to update context
  const { setTheme } = useTheme(); // Keep if theme is still synced from profile

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!authUser) {
        setError("User not logged in.");
        setIsFetchingProfile(false);
        setProfileDataLoaded(true);
        return;
      }

      setIsFetchingProfile(true);
      setError(null);

      try {
        const profileDataFromApi = await getUserProfile();
        const fetchedUserData = {
          name: profileDataFromApi.name || '',
          username: profileDataFromApi.username || '',
          email: profileDataFromApi.email || '',
          role: profileDataFromApi.role || 'user',
          createdAt: profileDataFromApi.createdAt || '',
          profilePictureUrl: profileDataFromApi.profilePictureUrl || null,
          points: profileDataFromApi.points || 0,
          tier: profileDataFromApi.tier || '',
          // Sync theme if it's part of profileDataFromApi and you want to keep this behavior
          // theme: profileDataFromApi.theme || 'light',
        };
        setUserData(fetchedUserData);
        setOriginalUserData(fetchedUserData);

        // Set theme from backend if it's part of the profile data
        if (profileDataFromApi.theme) {
          setTheme(profileDataFromApi.theme, "UserProfileInitialLoad");
        }

      } catch (err) {
        console.error("Error fetching profile data:", err);
        setError(err.message || "Failed to load profile data.");
      } finally {
        setIsFetchingProfile(false);
        setProfileDataLoaded(true);
      }
    };

    if (!isAuthLoading && authUser) { // Ensure authUser is available before fetching
      fetchProfileData();
    } else if (!isAuthLoading && !authUser) {
        setError("User not logged in.");
        setIsFetchingProfile(false);
        setProfileDataLoaded(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser, isAuthLoading, setTheme]); // Added setTheme to dependencies

  const canEditUsername = userData.points >= usernameUnlockCost;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'username' && isEditing && canEditUsername) {
      setUserData(prevData => ({ ...prevData, [name]: value }));
    }
  };

  const handleEditToggle = () => {
    if (isEditing && originalUserData) {
      setUserData(originalUserData); // Reset to original data on cancel
    }
    setIsEditing(!isEditing);
    setError(null);
  };

  const handleProfileUpdate = (e) => {
      e.preventDefault();
      setIsLoading(true);
      setError(null);

      const dataToUpdate = {};
      // Only include username in the update if it's editable, has changed, and is not empty
      if (canEditUsername && userData.username !== originalUserData?.username) {
        if (userData.username.trim() === '' && originalUserData?.username) {
            // If user clears an existing username, send null or handle as per backend logic
            // For now, let's assume backend handles empty string as "remove username" or validates it
            dataToUpdate.username = userData.username.trim(); // Send trimmed or null
        } else if (userData.username.trim() !== '') {
            dataToUpdate.username = userData.username.trim();
        }
      }
      // Note: Name and Email are not editable in this version.
      // Theme is handled by ThemeSelector, not directly in this form submission.

      if (Object.keys(dataToUpdate).length === 0) {
        setIsEditing(false); // Exit edit mode if nothing changed
        setIsLoading(false);
        return;
      }

      updateUserProfile(dataToUpdate)
        .then(updatedUserFromApi => {
            // The backend should return the full updated user object
            const newUserDataState = {
                ...userData, // Keep existing non-updated fields
                username: updatedUserFromApi.username !== undefined ? updatedUserFromApi.username : userData.username,
                points: updatedUserFromApi.points !== undefined ? updatedUserFromApi.points : userData.points,
                tier: updatedUserFromApi.tier || userData.tier,
                // Update other fields if the backend returns them and they are part of userData state
                name: updatedUserFromApi.name || userData.name,
                email: updatedUserFromApi.email || userData.email,
                profilePictureUrl: updatedUserFromApi.profilePictureUrl !== undefined ? updatedUserFromApi.profilePictureUrl : userData.profilePictureUrl,
            };
            setUserData(newUserDataState);
            setOriginalUserData(newUserDataState); // Update original data to reflect saved changes
            setIsEditing(false);
            alert("Profile updated successfully!");

            // Update AuthContext if username or other critical authUser fields changed
            if (authUser && (updatedUserFromApi.username !== authUser.username || updatedUserFromApi.points !== authUser.points)) {
                updateUserInAuthContext(authUser.token, { ...authUser, ...updatedUserFromApi });
            }
        })
        .catch(err => {
            setError(err.message || "Failed to update profile.");
            // Optionally revert userData to originalUserData if save fails
            // setUserData(originalUserData);
        })
        .finally(() => {
           setIsLoading(false);
        });
  };

  const handlePictureUpload = (event) => {
      const file = event.target.files[0];
      if (!file) return;

      setIsLoading(true);
      setError(null);
      const formData = new FormData();
      formData.append('profilePicture', file);

      uploadProfilePicture(formData)
        .then(response => {
            // Assuming backend returns { profilePictureUrl: 'new_url' } or { user: { ..., profilePictureUrl: 'new_url' } }
            const newUrl = response.profilePictureUrl || response.user?.profilePictureUrl;
            if (newUrl) {
                const updatedData = { ...userData, profilePictureUrl: newUrl };
                setUserData(updatedData);
                setOriginalUserData(updatedData); // Update original data
                alert("Profile picture updated!");

                // Update AuthContext if profile picture URL is part of authUser
                if (authUser) {
                    updateUserInAuthContext(authUser.token, { ...authUser, profilePictureUrl: newUrl });
                }
            } else {
                throw new Error("Profile picture URL not found in response.");
            }
        })
        .catch(err => {
            setError(err.message || "Failed to upload picture.");
        })
        .finally(() => {
            setIsLoading(false);
        });
  };

  const handleShowUnlockInfo = (type) => {
      setShowUnlockInfo({ type });
  };

  const handleHideUnlockInfo = () => {
      setShowUnlockInfo(null);
  };

  if (isAuthLoading || (isFetchingProfile && !profileDataLoaded) ) {
      return <div className={styles.userProfilePage}><p>Loading profile...</p></div>;
  }
  if (!authUser && profileDataLoaded && !isFetchingProfile) { // Check !isFetchingProfile here
      return <div className={styles.userProfilePage}><p>Please log in to view your profile.</p></div>;
  }
   // This check might be redundant if the one above catches it, but good for safety
  if (!authUser) {
      return <div className={styles.userProfilePage}><p>Please log in to view your profile.</p></div>;
  }
  // Show error only if not fetching and an error exists
  if (error && !isFetchingProfile) {
      return <div className={styles.userProfilePage}><p className={styles.errorMessage}>Error loading profile: {error}</p></div>;
  }


  return (
    <div className={styles.userProfilePage}>
      <h1>User Profile</h1>

      {error && !isFetchingProfile && ( // Display error if it occurred outside initial fetch
        <p className={styles.errorMessage}>{error}</p>
      )}

      <div className={styles.profileContentGrid}>
        <aside className={styles.profileSidebar}>
          <div className={styles.profilePictureContainer}>
             {userData.profilePictureUrl ? (
                 <img
                    src={userData.profilePictureUrl?.startsWith('/') ? `${BACKEND_URL}${userData.profilePictureUrl}` : userData.profilePictureUrl}
                    alt="Profile"
                    className={styles.profilePicture}
                    onError={(e) => { e.target.onerror = null; e.target.src="https://via.placeholder.com/200?text=Error"; }}
                 />
             ) : (
                 <FaUserCircle className={`${styles.profilePicture} ${styles.defaultProfileIcon}`} />
             )}
             <label htmlFor="profile-picture-upload" className={styles.uploadIconLabel} title="Change profile picture">
                 {isLoading && !isEditing ? '...' : <FaPlusCircle className={styles.uploadIcon} />}
             </label>
             <input
                id="profile-picture-upload" type="file" accept="image/*"
                onChange={handlePictureUpload} style={{ display: 'none' }}
                disabled={isLoading} // Disable while any loading operation is in progress
             />
          </div>
          <div className={styles.profileActions}>
            {!isEditing ? (
               <button
                 type="button"
                 onClick={handleEditToggle}
                 className={styles.buttonPrimary}
                 disabled={isLoading || isFetchingProfile || !canEditUsername}
                 title={!canEditUsername ? `Unlock username editing at ${usernameUnlockCost} points. You have ${userData.points} points.` : "Edit Username"}
               >
                 <FaEdit style={{ marginRight: '8px' }} /> Edit Username
               </button>
            ) : (
              <>
               <button type="submit" form="userProfileForm" className={styles.buttonPrimary} disabled={isLoading}>
                 {isLoading ? 'Saving...' : <><FaSave style={{ marginRight: '8px' }} /> Save Changes</>}
               </button>
               <button type="button" onClick={handleEditToggle} className={styles.buttonSecondary} disabled={isLoading}>
                 <FaTimes style={{ marginRight: '8px' }} /> Cancel
               </button>
              </>
            )}
          </div>
        </aside>

        <main className={styles.profileMainContent}>
          <form id="userProfileForm" onSubmit={handleProfileUpdate}>
            <section className={`${styles.profileSection} ${styles.basicInfo}`}>
              <h2>Basic Info</h2>
              <div className={styles.infoGrid}>
                <label htmlFor="points">Points:</label>
                <span id="points" className={styles.pointsBalance}>{userData.points} ✨</span>

                <label htmlFor="name">Full Name:</label>
                <span>{userData.name || '-'} <TierBadge tier={userData.tier} /></span>

                <label htmlFor="username">Username:</label>
                {isEditing && canEditUsername ? (
                    <input id="username" type="text" name="username" value={userData.username || ''} onChange={handleInputChange} disabled={isLoading} placeholder="Enter username" className={styles.editableField} />
                ) : isEditing && !canEditUsername ? ( // In edit mode, but username cannot be changed
                    <span className={styles.usernameDisplay}>
                        {userData.username || '(Not Set)'}
                        <span className={styles.lockIconContainer} title={`Requires ${usernameUnlockCost} points to edit. You have ${userData.points} points.`}>
                            <FaLock className={styles.lockIcon} />
                        </span>
                    </span>
                ) : ( // Not in edit mode
                    <span className={styles.usernameDisplay}>
                        {userData.username || '(Not Set)'}
                        {!canEditUsername && ( // Show lock icon if username editing is generally locked
                            <span className={styles.lockIconContainer} onMouseEnter={() => handleShowUnlockInfo('username')} onMouseLeave={handleHideUnlockInfo}>
                                <FaLock className={styles.lockIcon} />
                                {showUnlockInfo?.type === 'username' && <div className={styles.unlockTooltip}>Unlock username editing at {usernameUnlockCost} points. You have {userData.points} points.</div>}
                            </span>
                        )}
                    </span>
                )}

                <label htmlFor="email">Email:</label>
                <span>{userData.email || '-'}</span>

                <label>Role:</label>
                <span>{userData.role || '-'}</span>

                <label>Current Tier:</label>
                <span>
                  {userData.tier ? userData.tier.charAt(0).toUpperCase() + userData.tier.slice(1) : 'N/A'}
                </span>
                <label>Joined On:</label>
                <span>{userData.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'N/A'}</span>
              </div>
            </section>
            {/* Sections for Appearance, Stats, Badges are removed as per request */}
          </form>
        </main>
      </div>
    </div>
  );
};

export default UserProfile;
