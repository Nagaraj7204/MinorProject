// frontend/src/pages/QuizLevelSelectionPage/QuizLevelSelectionPage.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './QuizLevelSelectionPage.module.css';
import { FaLock, FaUnlock } from 'react-icons/fa';

const TOTAL_QUIZ_LEVELS = 6;

const QuizLevelSelectionPage = () => {
  const { user, isLoadingAuth } = useAuth(); // Get isLoadingAuth
  const navigate = useNavigate();
  // highestQuizLevelCompleted will be 0 if user hasn't completed any, so level 1 is open.
  // If user completed level 1, highestQuizLevelCompleted = 1, so level 2 is open.

  const handleLevelSelect = (level) => {
    if (level <= highestLevelCompleted + 1) {
      navigate('/games/flash-quiz', { state: { level: level } });
    }
  };

  // Wait for authentication to complete before calculating levels
  if (isLoadingAuth) {
    return <div className={styles.loadingContainer}>Loading user data...</div>; // Or some other loading indicator
  }

  // If user is null after loading (e.g., not logged in, or token validation failed)
  if (!user) {
    return <div className={styles.loadingContainer}>Please log in to play the quiz.</div>;
  }
  const highestLevelCompleted = user.highestQuizLevelCompleted || 0;

  return (
    <div className={styles.levelSelectionContainer}>
      <Link to="/games" className={styles.backToGamesButton}>&larr; Back to All Games</Link>
      <h1 className={styles.pageTitle}>Flash Quiz Levels</h1>
      <p className={styles.instructions}>
        Complete a level by scoring at least 3 out of 5 to unlock the next one!
      </p>
      <div className={styles.levelsGrid}>
        {Array.from({ length: TOTAL_QUIZ_LEVELS }, (_, i) => i + 1).map((level) => {
          const isUnlocked = level <= highestLevelCompleted + 1;
          const isCompleted = level <= highestLevelCompleted;

          return (
            <button
              key={level}
              className={`${styles.levelCard} ${!isUnlocked ? styles.locked : ''} ${isCompleted ? styles.completed : ''}`}
              onClick={() => handleLevelSelect(level)}
              disabled={!isUnlocked}
            >
              <div className={styles.levelNumber}>Level {level}</div>
              <div className={styles.levelStatusIcon}>
                {isUnlocked ? <FaUnlock /> : <FaLock />}
              </div>
              {isCompleted && <div className={styles.completedText}>Completed</div>}
              {!isUnlocked && <div className={styles.lockedText}>Locked</div>}
            </button>
          );
        })}
      </div>
      {highestLevelCompleted === TOTAL_QUIZ_LEVELS && (
        <div className={styles.masteredContainer}>
          <h2>🎉 Congratulations! 🎉</h2>
          <p>You've mastered all quiz levels!</p>
          <p className={styles.teaserText}>Stay tuned for new levels in Season 2!</p>
        </div>
      )}
    </div>
  );
};

export default QuizLevelSelectionPage;