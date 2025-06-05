// src/components/ChallengesWidget/ChallengesWidget.jsx
import React from 'react';
import styles from './ChallengesWidget.module.css';

// --- Mock Data (Replace with actual import/props) ---
// Example structure of a challenge object passed as a prop:
// const exampleChallenge = {
//   id: 'daily3',
//   name: 'Daily Trio',
//   description: 'Complete 3 tasks today',
//   criteria: { tasksToday: 3 }, // Or tasksThisWeek, etc.
//   rewardXp: 25
// };
// --- End Mock Data ---

function ChallengesWidget({ challenge, progress = 0 }) { // Pass one challenge and its progress
  if (!challenge) {
    // Don't render anything if no challenge data is provided
    return null;
  }

  // Determine the target value from the criteria object
  const criteriaKeys = Object.keys(challenge.criteria);
  const targetKey = criteriaKeys.length > 0 ? criteriaKeys[0] : null; // Get the first criteria key (e.g., 'tasksToday')
  const target = targetKey ? challenge.criteria[targetKey] : 1; // Get the target value (default to 1 if none found)

  const currentProgress = progress || 0;
  const isComplete = currentProgress >= target;
  // Calculate progress percentage, ensuring target is not zero
  const progressPercent = target > 0 ? Math.min(100, (currentProgress / target) * 100) : 0;

  return (
    <div className={`${styles.challengeItem} ${isComplete ? styles.completed : ''}`}>
      <h4 className={styles.challengeName}>
        {challenge.name}
        {isComplete && <span className={styles.completedMark}> ✔</span>} {/* Checkmark for completed */}
      </h4>
      <p className={styles.challengeDescription}>{challenge.description}</p>

      {/* Only show progress bar if not complete */}
      {!isComplete && (
        <div className={styles.challengeProgress}>
          <div className={styles.challengeProgressBarBackground}>
            <div
              className={styles.challengeProgressBarFill}
              style={{ width: `${progressPercent}%` }}
              aria-valuenow={progressPercent}
              aria-valuemin="0"
              aria-valuemax="100"
            ></div>
          </div>
          <span className={styles.progressText}>{currentProgress} / {target}</span>
        </div>
      )}

      <p className={styles.rewardText}>Reward: +{challenge.rewardXp} XP</p>
    </div>
  );
}

export default ChallengesWidget;
