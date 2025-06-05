// src/pages/CosmeticsStore/CosmeticsStore.jsx
import React, { useState, useContext } from 'react';
import styles from './CosmeticsStore.module.css';
import { UserContext } from '../../context/UserContext'; // Adjust path if needed
import { AVATARS, THEMES } from '../../data/cosmetics'; // ✅ no .jsx or .js extension needed



function CosmeticsStore() {
    // Get user data and functions to update it from context
    const { user, selectAvatar, selectTheme, unlockCosmetic } = useContext(UserContext);
    const [selectedTab, setSelectedTab] = useState('avatars'); // 'avatars' or 'themes'

    // Handle loading state while user data is fetched/initialized
    if (!user) {
        return (
            <div className={styles.storeContainer} style={{ textAlign: 'center' }}>
                Loading user data...
            </div>
        );
    }

    const handleSelect = (item) => {
        // Determine item type based on which array it's from
        const type = THEMES.some(t => t.id === item.id) ? 'theme' : 'avatar';

        if (type === 'avatar') {
            selectAvatar(item.url); // Update context/backend with URL
        } else if (type === 'theme') {
            selectTheme(item.id); // Update context/backend with ID
        }
    };

    const handleUnlock = (item) => {
        const type = THEMES.some(t => t.id === item.id) ? 'theme' : 'avatar';

        // --- Requirement Checks ---
        // 1. Check Points
        if (item.cost > user.points) {
            alert("Not enough points!"); // Replace with a nicer notification later
            return;
        }
        // 2. Check Level (if applicable)
        if (item.requiredLevel && item.requiredLevel > user.level) {
             alert(`Requires Level ${item.requiredLevel}!`);
             return;
        }
        // 3. Check Achievement (if applicable)
        if (item.requiredAchievementId && !user.achievements.includes(item.requiredAchievementId)) {
             // Find the achievement name for a better message
             // const achievement = achievementsList.find(a => a.id === item.requiredAchievementId);
             // const achievementName = achievement ? achievement.name : 'a specific achievement';
             alert(`Requires achievement: ${item.requiredAchievementId}!`); // Improve message
             return;
        }
        // --- End Requirement Checks ---


        // If all checks pass, call context/backend function to unlock
        // This function should handle deducting points and adding the item ID to the correct unlocked array
        unlockCosmetic(item.id, type, item.cost);
        alert(`${item.name} unlocked!`); // Replace with a nicer notification
    };

    // Determine which items to show based on the selected tab
    const itemsToDisplay = selectedTab === 'avatars' ? AVATARS : THEMES;
    // Get the list of unlocked IDs for the current tab
    const unlockedItems = selectedTab === 'avatars' ? (user.unlockedAvatars || []) : (user.unlockedThemes || []);
    // Get the currently selected item identifier
    const currentSelection = selectedTab === 'avatars' ? user.avatarUrl : user.selectedTheme;

    return (
        <div className={styles.storeContainer}>
            <h1>Customize Your Look</h1>
            <p className={styles.pointsDisplay}>Your Points: {user.points} ✨</p>

            {/* Tabs for switching between Avatars and Themes */}
            <div className={styles.tabs}>
                <button
                    className={selectedTab === 'avatars' ? styles.activeTab : ''}
                    onClick={() => setSelectedTab('avatars')}
                    aria-pressed={selectedTab === 'avatars'}
                >
                    Avatars
                </button>
                <button
                    className={selectedTab === 'themes' ? styles.activeTab : ''}
                    onClick={() => setSelectedTab('themes')}
                    aria-pressed={selectedTab === 'themes'}
                >
                    Themes
                </button>
            </div>

            {/* Grid to display the cosmetic items */}
            <div className={styles.itemsGrid}>
                {itemsToDisplay.map(item => {
                    const isUnlocked = unlockedItems.includes(item.id);
                    // Check if the current item is the selected one
                    const isSelected = (selectedTab === 'avatars' && item.url === currentSelection) ||
                                       (selectedTab === 'themes' && item.id === currentSelection);

                    // Determine if the user meets the requirements to unlock (if not already unlocked)
                    const canUnlock = !isUnlocked &&
                                      (item.cost <= user.points) &&
                                      (!item.requiredLevel || item.requiredLevel <= user.level) &&
                                      (!item.requiredAchievementId || (user.achievements || []).includes(item.requiredAchievementId));

                    return (
                        <div
                            key={item.id}
                            className={`
                                ${styles.itemCard}
                                ${isUnlocked ? styles.unlocked : styles.locked}
                                ${isSelected ? styles.selected : ''}
                            `}
                        >
                            {/* Item Preview */}
                            {selectedTab === 'avatars' ? (
                                <img src={item.url} alt={item.name} className={styles.itemPreview} />
                            ) : (
                                <div className={styles.themePreview} style={{ backgroundColor: item.previewColor }} title={item.name}></div>
                            )}

                            <h4 className={styles.itemName}>{item.name}</h4>

                            {/* Status & Action Buttons */}
                            <div className={styles.itemStatus}>
                                {isUnlocked ? (
                                    isSelected ? (
                                        <span className={styles.statusLabelSelected}>✓ Selected</span>
                                    ) : (
                                        <button onClick={() => handleSelect(item)} className={styles.selectButton}>Select</button>
                                    )
                                ) : (
                                    <>
                                        {/* Display unlock requirements */}
                                        <div className={styles.lockInfo}>
                                            {item.cost > 0 && <span>{item.cost} Pts</span>}
                                            {item.requiredLevel > 1 && <span>Lv. {item.requiredLevel}</span>}
                                            {item.requiredAchievementId && <span title={item.requiredAchievementId}>🏆 Req.</span>}
                                        </div>
                                        {/* Unlock Button */}
                                        <button
                                            onClick={() => handleUnlock(item)}
                                            className={styles.unlockButton}
                                            disabled={!canUnlock} // Disable if requirements not met
                                            title={canUnlock ? `Unlock for ${item.cost} points` : 'Requirements not met'}
                                        >
                                            Unlock
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default CosmeticsStore;
