// c:/Users/misba/OneDrive/Documents/workopoly1_proj/frontend/src/components/SubscriptionTiers/SubscriptionTiersPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import styles from './SubscriptionTiersPage.module.css';
import { upgradeSubscriptionTier } from '../../api/subscriptionApi'; // Import the API call

// Updated Tier Data with new feature lists
const TIERS_DATA = [
  {
    id: 'free',
    name: 'Free Plan',
    icon: '🎉',
    pointsRequired: 0,
    rewards: [
      'View Dashboard with XP & Points',
      'See Basic Progress (Total/Completed Tasks)',
      'Basic Motivational Quote (Rotates Daily)',
      'Earn Points on Task Completion',
      'View Personal Profile',
    ],
    color: '#e0e0e0',
    isBase: true,
  },
  {
    id: 'silver',
    name: 'Silver Tier',
    icon: '🥈',
    pointsRequired: 100,
    rewards: [
      'All Free Tier Features',
      'Create Custom Task Colours (priority)',
      'Silver Badge on Profile',
      'Task reminders',
    ],
    color: '#C0C0C0',
  },
  {
    id: 'gold',
    name: 'Gold Tier',
    icon: '🥇',
    pointsRequired: 50, // This is lower than Silver, ensure this is intended for testing
    rewards: [
      'All Silver Tier Features',
      'Initial letter Avatars of your name',
      'Spin the Wheel Daily for Bonus Points/Items',
      'Pomodoro challenge',
    ],
    color: '#FFD700',
  },
  {
    id: 'diamond',
    name: 'Diamond Tier',
    icon: '💎',
    pointsRequired: 150,
    rewards: [
      'All Gold Tier Features',
      'Diamond Badge on Leaderboard & Profile',
      'Games Access',
    ],
    color: '#b9f2ff',
  },
];

// Helper to get tier order for comparison
const getTierOrder = (tierId) => {
  const order = { free: 0, silver: 1, gold: 2, diamond: 3 };
  return order[tierId] !== undefined ? order[tierId] : -Infinity;
};


const SubscriptionTiersPage = () => {
  const { user, login, token, isLoadingAuth } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const currentUserTier = user?.tier || 'free';
  const currentUserPoints = user?.points || 0;

  const handleUpgrade = async (targetTierId) => {
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    const targetTier = TIERS_DATA.find(t => t.id === targetTierId);
    if (!targetTier) {
      setError('Invalid tier selected.');
      setIsLoading(false);
      return;
    }

    if (currentUserPoints < targetTier.pointsRequired) {
      setError('Not enough points to upgrade to this tier.');
      setIsLoading(false);
      return;
    }

    if (getTierOrder(currentUserTier) >= getTierOrder(targetTierId)) {
        setError('You are already at this tier or higher.');
        setIsLoading(false);
        return;
    }

    try {
      const updatedUserFromApi = await upgradeSubscriptionTier(targetTierId);
      console.log(`Successfully upgraded to ${targetTier.name} via API for user ${user.email}`);
      login(token, updatedUserFromApi);
      setSuccessMessage(`Successfully upgraded to ${targetTier.name}!`);
    } catch (err) {
      console.error("Upgrade error:", err);
      setError(err.message || 'An error occurred during the upgrade.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingAuth) {
    return <div className={styles.loadingContainer}>Loading user data...</div>;
  }

  if (!user) {
    return <div className={styles.loadingContainer}>Please log in to view subscription tiers.</div>;
  }

  return (
    <div className={styles.tiersPageContainer}>
      <h1 className={styles.pageTitle}>Subscription Tiers</h1>
      <div className={styles.currentUserInfo}>
        <p>Your Current Tier: <span className={styles.currentTierText}>{(TIERS_DATA.find(t => t.id === currentUserTier) || TIERS_DATA[0])?.name}</span></p>
        <p>Your Points: <span className={styles.currentPointsText}>{currentUserPoints}</span></p>
      </div>

      {error && <p className={styles.errorMessage}>{error}</p>}
      {successMessage && <p className={styles.successMessage}>{successMessage}</p>}

      <div className={styles.tiersGrid}>
        {TIERS_DATA.map((tier) => {
          const canAfford = currentUserPoints >= tier.pointsRequired;
          const isCurrentUserTier = currentUserTier === tier.id;
          const isHigherTier = getTierOrder(currentUserTier) > getTierOrder(tier.id);
          // User can upgrade if it's not their base tier, not their current tier, not a lower tier, and they can afford it.
          const canUpgradeToThisTier = !tier.isBase && !isCurrentUserTier && !isHigherTier && canAfford;

          return (
            <div key={tier.id} className={`${styles.tierCard} ${styles[tier.id]}`}>
              <div className={styles.tierIcon}>{tier.icon}</div>
              <h2 className={styles.tierName}>{tier.name}</h2>
              <p className={styles.tierPoints}>
                {tier.isBase ? 'Base Tier' : `Requires: ${tier.pointsRequired} Points`}
              </p>
              <ul className={styles.tierRewards}>
                {tier.rewards.map((reward, index) => (
                  <li key={index}>{reward}</li>
                ))}
              </ul>
              {!tier.isBase && (
                <button
                  className={styles.upgradeButton}
                  onClick={() => handleUpgrade(tier.id)}
                  disabled={isLoading || !canUpgradeToThisTier || isCurrentUserTier || isHigherTier}
                >
                  {isLoading && 'Processing...'}
                  {!isLoading && isCurrentUserTier && 'Current Tier'}
                  {!isLoading && isHigherTier && 'Achieved'}
                  {!isLoading && !isCurrentUserTier && !isHigherTier && (canAfford ? 'Upgrade' : 'Insufficient Points')}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SubscriptionTiersPage;
