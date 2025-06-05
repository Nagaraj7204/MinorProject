// src/components/PomodoroTimer/PomodoroTimer.jsx
import React, { useState, useEffect, useCallback } from 'react';
import styles from './PomodoroTimer.module.css';
import { useAuth } from '../../context/AuthContext';
import { completePomodoroSession } from '../../api/userApi'; // We'll create this API call
import { FaPlay, FaPause, FaRedo, FaForward, FaTasks, FaCoffee, FaBed } from 'react-icons/fa';

const WORK_DURATION = 25 * 60; // 25 minutes
const SHORT_BREAK_DURATION = 5 * 60; // 5 minutes
const LONG_BREAK_DURATION = 15 * 60; // 15 minutes
const POMODOROS_PER_CYCLE = 4; // Number of work sessions before a long break

const PomodoroTimer = () => {
  const { user, token, login } = useAuth();
  const [mode, setMode] = useState('work'); // 'work', 'shortBreak', 'longBreak'
  const [timeLeft, setTimeLeft] = useState(WORK_DURATION);
  const [isActive, setIsActive] = useState(false);
  const [pomodorosCompletedInCycle, setPomodorosCompletedInCycle] = useState(0);
  const [totalPomodorosToday, setTotalPomodorosToday] = useState(user?.pomodorosToday || 0); // Initialize from user context if available
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const getDuration = useCallback((currentMode) => {
    switch (currentMode) {
      case 'work':
        return WORK_DURATION;
      case 'shortBreak':
        return SHORT_BREAK_DURATION;
      case 'longBreak':
        return LONG_BREAK_DURATION;
      default:
        return WORK_DURATION;
    }
  }, []);

  const handlePomodoroCompletion = useCallback(async () => {
    if (!token) {
      setError('Authentication required to save progress.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const updatedUser = await completePomodoroSession(token);
      login(token, updatedUser); // Update user context with new points/XP/pomodoro count
      setTotalPomodorosToday(updatedUser.pomodorosToday || 0);
      console.log('Pomodoro session completed and points awarded.');
    } catch (err) {
      setError(err.message || 'Failed to record Pomodoro session.');
      console.error('Failed to complete Pomodoro session:', err);
    } finally {
      setIsLoading(false);
    }
  }, [token, login]);

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      setIsActive(false);
      // Play a sound or notification
      // alert(`${mode.charAt(0).toUpperCase() + mode.slice(1)} session ended!`);

      if (mode === 'work') {
        setPomodorosCompletedInCycle((prev) => prev + 1);
        handlePomodoroCompletion(); // Award points/XP
        if ((pomodorosCompletedInCycle + 1) % POMODOROS_PER_CYCLE === 0) {
          setMode('longBreak');
          setTimeLeft(LONG_BREAK_DURATION);
        } else {
          setMode('shortBreak');
          setTimeLeft(SHORT_BREAK_DURATION);
        }
      } else { // End of a break
        setMode('work');
        setTimeLeft(WORK_DURATION);
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode, pomodorosCompletedInCycle, handlePomodoroCompletion]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(getDuration(mode));
  };

  const skipTimer = () => {
    setIsActive(false);
    if (mode === 'work') {
      // Skipping a work session might not award points, or could have a partial award.
      // For simplicity, we'll just move to the next break type.
      setPomodorosCompletedInCycle((prev) => prev + 1); // Still counts towards cycle for long break
      if ((pomodorosCompletedInCycle + 1) % POMODOROS_PER_CYCLE === 0) {
        setMode('longBreak');
        setTimeLeft(LONG_BREAK_DURATION);
      } else {
        setMode('shortBreak');
        setTimeLeft(SHORT_BREAK_DURATION);
      }
    } else { // Skipping a break
      setMode('work');
      setTimeLeft(WORK_DURATION);
      // Reset cycle if a long break was skipped and we are starting a new work session
      if (mode === 'longBreak') {
        setPomodorosCompletedInCycle(0);
      }
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getModeDisplay = () => {
    switch (mode) {
      case 'work': return { text: 'Focus Time', icon: <FaTasks />, colorClass: styles.workMode };
      case 'shortBreak': return { text: 'Short Break', icon: <FaCoffee />, colorClass: styles.shortBreakMode };
      case 'longBreak': return { text: 'Long Break', icon: <FaBed />, colorClass: styles.longBreakMode };
      default: return { text: 'Focus Time', icon: <FaTasks />, colorClass: styles.workMode };
    }
  };

  const currentModeDisplay = getModeDisplay();

  return (
    <div className={`${styles.pomodoroContainer} ${currentModeDisplay.colorClass}`}>
      <div className={styles.timerCard}>
        <div className={styles.modeSelector}>
          <button onClick={() => { setMode('work'); setTimeLeft(WORK_DURATION); setIsActive(false); }} className={mode === 'work' ? styles.activeMode : ''}>Work</button>
          <button onClick={() => { setMode('shortBreak'); setTimeLeft(SHORT_BREAK_DURATION); setIsActive(false); }} className={mode === 'shortBreak' ? styles.activeMode : ''}>Short Break</button>
          <button onClick={() => { setMode('longBreak'); setTimeLeft(LONG_BREAK_DURATION); setIsActive(false); }} className={mode === 'longBreak' ? styles.activeMode : ''}>Long Break</button>
        </div>

        <div className={styles.timerDisplay}>
          <span className={styles.timerIcon}>{currentModeDisplay.icon}</span>
          {formatTime(timeLeft)}
        </div>
        <p className={styles.currentModeText}>{currentModeDisplay.text}</p>

        <div className={styles.controls}>
          <button onClick={toggleTimer} className={`${styles.controlButton} ${isActive ? styles.pauseButton : styles.startButton}`}>
            {isActive ? <FaPause /> : <FaPlay />} {isActive ? 'Pause' : 'Start'}
          </button>
          <button onClick={resetTimer} className={`${styles.controlButton} ${styles.resetButton}`} disabled={isActive}>
            <FaRedo /> Reset
          </button>
          <button onClick={skipTimer} className={`${styles.controlButton} ${styles.skipButton}`}>
            <FaForward /> Skip
          </button>
        </div>

        <div className={styles.sessionInfo}>
          <p>Pomodoros in cycle: {pomodorosCompletedInCycle} / {POMODOROS_PER_CYCLE}</p>
          <p>Pomodoros today: {totalPomodorosToday}</p>
        </div>
        {isLoading && <p className={styles.loadingMessage}>Saving session...</p>}
        {error && <p className={styles.errorMessage}>{error}</p>}
      </div>
    </div>
  );
};

export default PomodoroTimer;
