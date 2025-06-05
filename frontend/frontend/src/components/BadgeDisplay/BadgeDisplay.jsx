// src/components/BadgeDisplay/BadgeDisplay.jsx
import React from 'react';
import styles from './BadgeDisplay.module.css';

// --- Mock Data (Replace with actual import) ---
// Assuming you have a file like src/data/achievements.js
// Example:
const achievementsList = [
  { id: 'tasks10', name: 'Task Starter', description: 'Complete 10 tasks', icon: '/badges/badge-starter.svg' }, // Use actual paths
  { id: 'tasks50', name: 'Task Slayer', description: 'Complete 50 tasks', icon: '/badges/badge-slayer.svg' },
  { id: 'highPrio5', name: 'Priority Master', description: 'Complete 5 High priority tasks', icon: '/badges/badge-priority.svg' },
  { id: 'streak3', name: 'Streak Keeper', description: 'Complete tasks 3 days in a row', icon: '/badges/badge-streak.svg' },
  { id: 'level5', name: 'Level Up!', description: 'Reach Level 5', icon: '/badges/badge-level5.svg' },
];
// --- End Mock Data ---

function BadgeDisplay({ earnedAchievementIds = [] }) { // Default to empty array

  const earnedBadges = achievementsList.filter(ach =>
    earnedAchievementIds.includes(ach.id)
  );

  return (
    <div className={styles.badgeDisplayContainer}>
      <h3 className={styles.badgeTitle}>Your Badges</h3>
      {earnedBadges.length === 0 ? (
        <p className={styles.noBadges}>No badges earned yet. Keep up the great work!</p>
      ) : (
        <div className={styles.badgeGrid}>
          {earnedBadges.map(badge => (
            <div key={badge.id} className={styles.badgeItem} title={`${badge.name}: ${badge.description}`}>
              <div className={styles.badgeIconWrapper}>
                <img src={badge.icon} alt={badge.name} className={styles.badgeIcon} />
              </div>
              <span className={styles.badgeName}>{badge.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default BadgeDisplay;
