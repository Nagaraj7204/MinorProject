
// src/components/XPBar/XPBar.jsx
import React from 'react';
import styles from './XPBar.module.css';

// Example thresholds (could be imported or calculated)
const LEVEL_THRESHOLDS = [0, 100, 250, 500, 800, 1200, 1700, 2300, 3000, 4000]; // XP needed to REACH this level

function calculateLevelInfo(xp) {
  let level = 1;
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) {
      level = i + 1;
      break;
    }
  }
  const currentLevelXP = LEVEL_THRESHOLDS[level - 1] || 0;
  const nextLevelXP = LEVEL_THRESHOLDS[level] || Infinity; // XP needed for *next* level
  const xpInCurrentLevel = xp - currentLevelXP;
  const xpNeededForNextLevel = nextLevelXP - currentLevelXP;
  const progress = nextLevelXP === Infinity ? 100 : (xpInCurrentLevel / xpNeededForNextLevel) * 100;

  return {
    level,
    xpInCurrentLevel,
    xpNeededForNextLevel,
    nextLevelXP,
    progress: Math.min(100, Math.max(0, progress)), // Clamp between 0 and 100
  };
}

function XPBar({ currentXP }) {
  const { level, xpInCurrentLevel, xpNeededForNextLevel, nextLevelXP, progress } = calculateLevelInfo(currentXP);

  return (
    <div className={styles.xpBarContainer}>
      <div className={styles.xpContent}>
        <div className={styles.levelDisplay}>Level {level}</div>
        <div className={styles.progressBarBackground}>
          <div
            className={styles.progressBarFill}
            style={{ width: `${progress}%` }}
            aria-valuenow={progress}
            aria-valuemin="0"
            aria-valuemax="100"
          ></div>
        </div>
      </div>
      <div className={styles.xpText}>
        {xpInCurrentLevel} / {xpNeededForNextLevel} XP
        {nextLevelXP !== Infinity ? ` (Next: ${nextLevelXP} XP)` : ' (Max Level)'}
      </div>
    </div>
  );
}

export default XPBar;
