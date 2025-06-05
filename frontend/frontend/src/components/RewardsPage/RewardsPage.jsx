// c:/Users/misba/OneDrive/Documents/workopoly1_proj/frontend/src/components/RewardsPage/RewardsPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext'; // Import useAuth
import styles from './RewardsPage.module.css';
import { FaGift, FaLockOpen, FaArrowUp, FaTasks, FaPalette, FaUserEdit, FaSmileBeam, FaChartLine, FaQuoteRight, FaUserCircle, FaCalendarCheck } from 'react-icons/fa'; // Added more icons

// --- Tier Definitions (Mirroring SubscriptionTiersPage for consistency) ---
// It's highly recommended to move this to a shared constants file (e.g., src/constants/tierData.js)
// and import it here and in SubscriptionTiersPage.jsx and Dashboard.jsx
const TIERS_DEFINITIONS = [
    {
        id: 'free', name: 'Free Plan',
        rewards: [
            { text: 'Create & Manage Tasks (CRUD)', icon: <FaTasks /> },
            { text: 'View Dashboard with XP & Points', icon: <FaChartLine /> },
            { text: 'See Basic Progress (Total/Completed Tasks)', icon: <FaChartLine /> },
            { text: 'Basic Motivational Quote (Rotates Daily)', icon: <FaQuoteRight /> },
            { text: 'Earn Points on Task Completion', icon: <FaGift /> },
            { text: 'View Personal Profile', icon: <FaUserCircle /> },
            { text: 'Daily Login Bonus', icon: <FaCalendarCheck /> },
        ],
    },
    {
        id: 'silver', name: 'Silver Tier',
        rewards: [
            // "All Free Tier Features" is implied by accumulating previous tier rewards
            { text: 'Unlock 3 Themes: Light, Dark, Soft Pastel', icon: <FaPalette /> },
            { text: 'Create Custom Task Categories (Max 3)', icon: <FaUserEdit /> },
            { text: 'Silver Badge on Profile', icon: <FaUserCircle /> },
            { text: 'Basic Reminders for Tasks', icon: <FaCalendarCheck /> },
            { text: 'Access to 2 Mini-Game Levels', icon: <FaSmileBeam /> },
        ],
    },
    {
        id: 'gold', name: 'Gold Tier',
        rewards: [
            { text: 'Choose from 10+ Avatars for Profile', icon: <FaUserCircle /> },
            { text: 'Spin the Wheel Daily for Bonus Points/Items', icon: <FaGift /> },
        ],
    },
    {
        id: 'diamond', name: 'Diamond Tier',
        rewards: [
            { text: 'Diamond Badge on Leaderboard & Profile', icon: <FaUserCircle /> },
            { text: 'Access to Exclusive Timer Challenges', icon: <FaTasks /> },
        ],
    },
];

const TIER_ORDER = ['free', 'silver', 'gold', 'diamond'];

// Helper function to get all rewards for a given tier (including previous tiers)
const getAccumulatedRewardsForTier = (tierId) => {
    const tierIndex = TIER_ORDER.indexOf(tierId);
    if (tierIndex === -1) return [];

    let accumulated = [];
    for (let i = 0; i <= tierIndex; i++) {
        const currentTierDefinition = TIERS_DEFINITIONS.find(t => t.id === TIER_ORDER[i]);
        if (currentTierDefinition) {
            accumulated = [...accumulated, ...currentTierDefinition.rewards];
        }
    }
    return accumulated;
};

// Helper function to get rewards specific to the next tier
const getNextTierSpecificRewards = (currentTierId) => {
    const currentTierIndex = TIER_ORDER.indexOf(currentTierId);
    if (currentTierIndex === -1 || currentTierIndex >= TIER_ORDER.length - 1) {
        return { nextTierName: null, rewards: [] }; // No next tier or already at highest
    }
    const nextTierId = TIER_ORDER[currentTierIndex + 1];
    const nextTierDefinition = TIERS_DEFINITIONS.find(t => t.id === nextTierId);
    return {
        nextTierName: nextTierDefinition?.name || null,
        rewards: nextTierDefinition?.rewards || []
    };
};

const RewardsPage = () => {
    const { user, isLoadingAuth } = useAuth();
    const [error, setError] = useState(null); // Kept for potential future API errors
    const [activeTab, setActiveTab] = useState('unlocked'); // 'unlocked' or 'upcoming'

    // Derived state based on user's tier
    const currentUserTierId = user?.tier || 'free';
    const userPoints = user?.points ?? 0;

    const unlockedRewardsList = getAccumulatedRewardsForTier(currentUserTierId);
    const { nextTierName, rewards: upcomingRewardsList } = getNextTierSpecificRewards(currentUserTierId);

    // --- Render Logic ---
    if (isLoadingAuth) {
        return <div className={styles.rewardsContainer}><p>Loading user data...</p></div>;
    }

    if (error) { // Though not currently set, good to keep for future API calls
        return <div className={styles.rewardsContainer}><p className={styles.errorMessage}>{error}</p></div>;
    }

    if (!user) {
        return <div className={styles.rewardsContainer}><p>Please log in to view rewards.</p></div>;
    }

    return (
        <div className={styles.rewardsContainer}>
            <header className={styles.header}>
                <h1><FaGift /> Your Rewards & Perks</h1>
                <p className={styles.pointsDisplay}>Your Points: <span>{userPoints} ✨</span></p>
                <p className={styles.tierDisplay}>Current Tier: <span>{TIERS_DEFINITIONS.find(t => t.id === currentUserTierId)?.name || 'N/A'}</span></p>
            </header>

            <div className={styles.tabs}>
                <button
                    className={`${styles.tabButton} ${activeTab === 'unlocked' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('unlocked')}
                >
                    <FaLockOpen /> My Unlocked Perks
                </button>
                {nextTierName && ( // Only show "Upcoming" tab if there is a next tier
                    <button
                        className={`${styles.tabButton} ${activeTab === 'upcoming' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('upcoming')}
                    >
                        <FaArrowUp /> Upcoming Perks
                    </button>
                )}
            </div>

            <div className={styles.tabContent}>
                {activeTab === 'unlocked' && (
                    <section className={styles.rewardsSection}>
                        <h2><FaLockOpen /> My Unlocked Perks</h2>
                        {unlockedRewardsList.length > 0 ? (
                            <ul className={styles.perksList}>
                                {unlockedRewardsList.map((perk, index) => (
                                    <li key={`unlocked-${index}`} className={styles.perkItem}>
                                        <span className={styles.perkIcon}>{perk.icon || <FaGift />}</span>
                                        <span className={styles.perkText}>{perk.text}</span>
                                        {/* Add description or equip button if applicable for specific perk types */}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No special perks unlocked at this tier yet.</p>
                        )}
                    </section>
                )}

                {activeTab === 'upcoming' && nextTierName && (
                    <section className={styles.rewardsSection}>
                        <h2><FaArrowUp /> Perks in {nextTierName}</h2>
                        {upcomingRewardsList.length > 0 ? (
                            <ul className={styles.perksList}>
                                {upcomingRewardsList.map((perk, index) => (
                                    <li key={`upcoming-${index}`} className={styles.perkItem}>
                                        <span className={styles.perkIcon}>{perk.icon || <FaGift />}</span>
                                        <span className={styles.perkText}>{perk.text}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>You've unlocked all available perks for the next tier!</p>
                        )}
                         <p className={styles.upgradePrompt}>
                            Upgrade to {nextTierName} to enjoy these benefits!
                            {/* Optionally, link to SubscriptionTiersPage:
                            <Link to="/subscription-tiers" className={styles.promptLink}> Upgrade Now</Link>
                            */}
                        </p>
                    </section>
                )}
            </div>
        </div>
    );
};

export default RewardsPage;
