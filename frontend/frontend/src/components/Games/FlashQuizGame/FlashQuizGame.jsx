import React, { useState, useEffect } from 'react';
import styles from './FlashQuizGame.module.css';
import { useAuth } from '../../../context/AuthContext'; // To get token and update user
import { fetchQuizQuestions, completeQuizLevel } from '../../../api/quizApi'; // Updated API functions
import { FaSpinner, FaClock } from 'react-icons/fa'; // For loading spinner and clock icon

const sampleQuestions = [ // Keep as a fallback
  {
    question: 'What is the Pomodoro Technique?',
    options: [
      'A method for making pasta sauce',
      'A time management method using a timer to break work into intervals',
      'A type of tomato',
      'A software development methodology',
    ],
    answer: 'A time management method using a timer to break work into intervals',
    category: 'Productivity',
    level: 1,
  },
  {
    question: 'Which of the following is NOT a common cause of procrastination?',
    options: [
      'Fear of failure',
      'Perfectionism',
      'Clear and achievable goals',
      'Lack of motivation',
    ],
    answer: 'Clear and achievable goals',
    category: 'Productivity',
    level: 1,
  },
];

const TOTAL_QUESTIONS_PER_LEVEL = 5;
const POINTS_PER_CORRECT_ANSWER = 10;
const PASSING_CORRECT_ANSWERS_THRESHOLD = 3; // User needs to get 3 answers correct
const QUESTION_TIMER_DURATION = 30; // 30 seconds per question

const FlashQuizGame = ({ level, onLevelComplete, onQuizMastered }) => {
  const { token, login } = useAuth(); // login to update user context
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0); // This will store points earned
  const [showFeedback, setShowFeedback] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [questionError, setQuestionError] = useState(null);
  const [isSubmittingScore, setIsSubmittingScore] = useState(false);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIMER_DURATION); // Timer state (in seconds)
  const [scoreSubmitMessage, setScoreSubmitMessage] = useState(null);
  const [scoreSubmissionAttempted, setScoreSubmissionAttempted] = useState(false);
  const [passedLevel, setPassedLevel] = useState(false);

  useEffect(() => {
    const loadQuestions = async () => {
      if (!token) {
        setQuestionError("Authentication token not found. Please log in.");
        setIsLoadingQuestions(false);
        return;
      }
      try {
        setIsLoadingQuestions(true);
        setQuestionError(null);
        const fetchedQuestions = await fetchQuizQuestions(token, level, TOTAL_QUESTIONS_PER_LEVEL);
        if (fetchedQuestions && fetchedQuestions.length > 0) {
          setQuestions(fetchedQuestions);
        } else {
          setQuestions(sampleQuestions.filter(q => q.level === level).sort(() => 0.5 - Math.random()).slice(0, TOTAL_QUESTIONS_PER_LEVEL));
          setQuestionError("No questions found from API for this level. Using sample questions.");
        }
      } catch (error) {
        console.error("Failed to load questions:", error);
        setQuestionError(error.toString() || "Failed to load questions. Using sample questions.");
        setQuestions(sampleQuestions.filter(q => q.level === level).sort(() => 0.5 - Math.random()).slice(0, TOTAL_QUESTIONS_PER_LEVEL));
      } finally {
        setIsLoadingQuestions(false);
      }
    };

    loadQuestions();
  }, [token, level]);

  const handleAnswerSelect = (option) => {
    if (showFeedback) return;
    setSelectedAnswer(option);
  };

  const handleSubmitAnswer = () => {
    if (showFeedback) return; // Prevent re-submission if feedback is already shown (e.g., timer ran out)

    // If no answer selected and timer ran out, mark as incorrect implicitly
    // Otherwise, if an answer is selected, check it.
    if (selectedAnswer !== null) {
        const correctAnswer = questions[currentQuestionIndex].answer;
        if (selectedAnswer === correctAnswer) {
            setScore((prevScore) => prevScore + POINTS_PER_CORRECT_ANSWER);
        }
    }
    // If selectedAnswer is null (e.g. timer ran out before selection), score doesn't change for this question.
    setShowFeedback(true);
  };

  // Timer effect
  useEffect(() => {
    let intervalId;
    // Only start timer if level is 3 or higher, feedback is not shown, and there's time left
    if (level >= 3 && !showFeedback && timeLeft > 0 && questions.length > 0 && !quizFinished) {
      intervalId = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0 && !showFeedback && !quizFinished) {
      // Time's up! Automatically submit (which shows feedback)
      handleSubmitAnswer();
    }
    // Cleanup function to clear the interval
    return () => clearInterval(intervalId);
  }, [level, showFeedback, timeLeft, questions, quizFinished]);


  const handleNextQuestion = () => {
    setSelectedAnswer(null);
    setShowFeedback(false);
    setTimeLeft(QUESTION_TIMER_DURATION); // Reset timer for the next question

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
    } else {
      setQuizFinished(true);
    }
  };

  useEffect(() => {
    if (quizFinished && !scoreSubmissionAttempted) {
      const submitUserScore = async () => {
        const correctAnswersCount = score / POINTS_PER_CORRECT_ANSWER;
        const isPassed = correctAnswersCount >= PASSING_CORRECT_ANSWERS_THRESHOLD;

        setPassedLevel(isPassed);
        setScoreSubmissionAttempted(true); // Mark that submission process has started

        if (!token) {
          setScoreSubmitMessage({ type: 'error', text: 'Cannot submit score. No authentication token.' });
          setIsSubmittingScore(false);
          return;
        }
        setIsSubmittingScore(true);
        setScoreSubmitMessage(null);
        try {
          const updatedUserFromApi = await completeQuizLevel(token, level, score, isPassed);

          if (updatedUserFromApi && updatedUserFromApi._id) {
            login(token, updatedUserFromApi); // Update user context
            if (isPassed) {
              setScoreSubmitMessage({ type: 'success', text: `Level ${level} Passed! Score: ${correctAnswersCount}/${TOTAL_QUESTIONS_PER_LEVEL}. Points updated.` });
              if (level === 6) { // Assuming 6 levels
                onQuizMastered();
              } else {
                onLevelComplete(level);
              }
            } else {
              setScoreSubmitMessage({ type: 'info', text: `Level ${level} not passed. Score: ${correctAnswersCount}/${TOTAL_QUESTIONS_PER_LEVEL}. Try again!` });
            }
          } else {
            console.error("Submit score response did not contain expected user data:", updatedUserFromApi);
            setScoreSubmitMessage({ type: 'error', text: "Score submitted, but failed to update profile display. Please refresh." });
          }
        } catch (error) {
          console.error("Failed to submit score:", error);
          setScoreSubmitMessage({ type: 'error', text: error.toString() || "Failed to submit score." });
        } finally {
          setIsSubmittingScore(false);
        }
      };
      submitUserScore();
    }
  }, [quizFinished, score, token, login, scoreSubmissionAttempted, level, onLevelComplete, onQuizMastered]);

  if (isLoadingQuestions) {
    return <div className={styles.quizContainer}><p className={styles.loadingText}><FaSpinner className={styles.spinner} /> Loading questions...</p></div>;
  }

  if (questionError && questions.length === 0) {
    return <div className={`${styles.quizContainer} ${styles.errorContainer}`}><p>{questionError}</p></div>;
  }

  if (quizFinished) {
    const correctAnswersCount = score / POINTS_PER_CORRECT_ANSWER;
    return (
      <div className={styles.quizContainer}>
        <h2>Quiz Finished!</h2>
        <p>Level {level} - Your final score: {correctAnswersCount}/{TOTAL_QUESTIONS_PER_LEVEL}</p>
        {isSubmittingScore && <p className={styles.loadingText}><FaSpinner className={styles.spinner} /> Submitting score...</p>}
        {scoreSubmitMessage && (
          <p className={`${styles.submitMessage} ${styles[scoreSubmitMessage.type]}`}>
            {scoreSubmitMessage.text}
          </p>
        )}
        {passedLevel && level < 6 && (
          <p className={styles.nextLevelMessage}>Next level unlocked!</p>
        )}
        {passedLevel && level === 6 && (
          <p className={styles.masteredMessage}>🎉 You’ve mastered the quiz! New levels unlocking in Season 2!</p>
        )}
        {/* TODO: Add buttons to "Play Again (this level)" or "Back to Level Selection" */}
      </div>
    );
  }

  if (questions.length === 0 || !questions[currentQuestionIndex]) {
    return <div className={styles.quizContainer}><p>No questions available for this level at the moment.</p></div>;
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className={styles.quizContainer}>
      <div className={styles.quizHeader}>
        <h2>Level {level} Quiz</h2>
        {level >= 3 && (
          <div className={styles.timerDisplay}>
            <FaClock className={styles.clockIcon} />
            <span>{timeLeft}s</span>
          </div>
        )}
      </div>
      <p className={styles.categoryText}>Category: {currentQuestion.category}</p>
      {questionError && questions.length > 0 && <p className={styles.warningText}>{questionError}</p>}
      <p className={styles.questionText}>{currentQuestion.question}</p>
      <div className={styles.optionsContainer}>
        {currentQuestion.options.map((option, index) => (
          <button
            key={index}
            className={`${styles.optionButton} 
                        ${selectedAnswer === option ? styles.selected : ''} 
                        ${showFeedback && option === currentQuestion.answer ? styles.correct : ''} 
                        ${showFeedback && selectedAnswer === option && option !== currentQuestion.answer ? styles.incorrect : ''}`}
            onClick={() => handleAnswerSelect(option)}
            disabled={showFeedback}
          >
            {option}
          </button>
        ))}
      </div>
      {showFeedback ? (
        <button onClick={handleNextQuestion} className={styles.nextButton}>Next Question</button>
      ) : (
        <button onClick={handleSubmitAnswer} className={styles.submitButton} disabled={selectedAnswer === null}>Submit Answer</button>
      )}
      <p className={styles.score}>Score: {score}</p>
      <p className={styles.questionCounter}>Question {currentQuestionIndex + 1} of {questions.length}</p>
    </div>
  );
};

export default FlashQuizGame;
