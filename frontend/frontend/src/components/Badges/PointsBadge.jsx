// src/components/Badges/PointsBadge.jsx
import React from 'react';
import styles from './PointsBadge.module.css'; // We'll create this CSS file next

const PointsBadge = ({ points }) => {
  let badge = { name: 'Newbie', emoji: '🐣', type: 'newbie' }; // Default for 0-199

  if (points >= 2000) {
    badge = { name: 'Legend', emoji: '👑', type: 'legend' };
  } else if (points >= 1000) {
    badge = { name: 'Task Master', emoji: '🧠', type: 'master' };
  } else if (points >= 500) {
    badge = { name: 'Pro Achiever', emoji: '🚀', type: 'pro' };
  } else if (points >= 200) {
    badge = { name: 'Task Hustler', emoji: '🛠️', type: 'hustler' };
  }
  // The default 'Newbie' badge covers points < 200.

  return (
    <span className={`${styles.pointsBadgeBase} ${styles[badge.type]}`}>
      {badge.emoji} {badge.name}
    </span>
  );
};

export default PointsBadge;