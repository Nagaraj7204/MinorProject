// frontend/src/pages/FlashQuizRunnerPage/FlashQuizRunnerPage.jsx
import React, { useState } from 'react';
import styles from './FlashQuizRunnerPage.module.css';
import FlashQuizGame from '../../components/Games/FlashQuizGame/FlashQuizGame';
import { Link, useLocation, useNavigate } from 'react-router-dom'; // For a back button and getting state

const FlashQuizRunnerPage = () => {
  const [quizStarted, setQuizStarted] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const currentLevel = location.state?.level || 1; // Get level from route state, default to 1

  const handleStartQuiz = () => {
    setQuizStarted(true);
  };

  const handleLevelComplete = (completedLevel) => {
    // Optionally, navigate to next level or back to level selection
    console.log(`Level ${completedLevel} completed by user.`);
    // navigate('/games/quiz-levels'); // Or to the next level if you want auto-advance
  };

  const handleQuizMastered = () => {
    console.log("User has mastered all quiz levels!");
    // navigate('/games/quiz-levels');
  };

  if (!quizStarted) {
    return (
      <div className={styles.runnerContainer}>
        <Link to="/games/quiz-levels" className={styles.backButton}>&larr; Back to Levels</Link>
        <h1 className={styles.quizTitle}>Level {currentLevel} - Flash Quiz Challenge!</h1>
        <p className={styles.quizDescription}>
          Ready to test your knowledge? Each correct answer earns you points. Good luck!
        </p>
        <button onClick={handleStartQuiz} className={styles.startButton}>
          Start Quiz
        </button>
      </div>
    );
  }

  return (
    <div className={styles.runnerContainer}>
      <Link to="/games/quiz-levels" className={styles.backButton} style={{ marginBottom: '20px', display: 'inline-block' }}>
        &larr; Back to Levels
      </Link>
      <FlashQuizGame
        level={currentLevel}
        onLevelComplete={handleLevelComplete}
        onQuizMastered={handleQuizMastered}
      />
    </div>
  );
};

export default FlashQuizRunnerPage;