// src/components/Widgets/TimeTracker.jsx
import React, { useState, useEffect, useCallback } from 'react';
import styles from '../Dashboards/Dashboard.module.css'; // Adjust path as needed

// Define timer durations in seconds
const WORK_DURATION = 25 * 60; // 25 minutes
const SHORT_BREAK_DURATION = 5 * 60; // 5 minutes
const LONG_BREAK_DURATION = 15 * 60; // 15 minutes

function TimeTracker() {
    const [mode, setMode] = useState('work'); // 'work', 'shortBreak', 'longBreak'
    const [timeRemaining, setTimeRemaining] = useState(WORK_DURATION);
    const [isActive, setIsActive] = useState(false);

    // Function to get duration based on mode
    const getDuration = useCallback((currentMode) => {
        switch (currentMode) {
            case 'shortBreak':
                return SHORT_BREAK_DURATION;
            case 'longBreak':
                return LONG_BREAK_DURATION;
            case 'work':
            default:
                return WORK_DURATION;
        }
    }, []); // Empty dependency array as durations are constant

    // Effect to handle the timer countdown
    useEffect(() => {
        let interval = null;

        if (isActive && timeRemaining > 0) {
            interval = setInterval(() => {
                setTimeRemaining(prevTime => prevTime - 1);
            }, 1000);
        } else if (!isActive || timeRemaining === 0) {
            clearInterval(interval);
            if (timeRemaining === 0) {
                // Optional: Add sound notification or auto-switch mode here
                console.log(`${mode} session finished!`);
                setIsActive(false); // Stop the timer when it hits 0
                // Maybe suggest the next mode?
            }
        }

        // Cleanup function to clear interval when component unmounts or dependencies change
        return () => clearInterval(interval);
    }, [isActive, timeRemaining, mode]); // Re-run effect if isActive, timeRemaining, or mode changes

    // Effect to reset timer when mode changes
    useEffect(() => {
        setIsActive(false); // Stop timer on mode change
        setTimeRemaining(getDuration(mode));
    }, [mode, getDuration]); // Re-run when mode changes

    const toggleTimer = () => {
        if (timeRemaining === 0) return; // Don't start if timer is at 0
        setIsActive(!isActive);
    };

    const resetTimer = () => {
        setIsActive(false);
        setTimeRemaining(getDuration(mode));
    };

    const switchMode = (newMode) => {
        setMode(newMode);
        // The useEffect for 'mode' dependency will handle resetting the timer
    };

    // Format time remaining as MM:SS
    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className={styles.widgetCard}>
            <h3>Time Tracker</h3>
            <div className={styles.timerModeButtons}>
                <button
                    onClick={() => switchMode('work')}
                    className={mode === 'work' ? styles.activeMode : ''}
                >
                    Pomodoro
                </button>
                <button
                    onClick={() => switchMode('shortBreak')}
                    className={mode === 'shortBreak' ? styles.activeMode : ''}
                >
                    Short Break
                </button>
                <button
                    onClick={() => switchMode('longBreak')}
                    className={mode === 'longBreak' ? styles.activeMode : ''}
                >
                    Long Break
                </button>
            </div>
            <div className={styles.timerDisplay}>
                {formatTime(timeRemaining)}
            </div>
            <div className={styles.timerControls}>
                <button onClick={toggleTimer} disabled={timeRemaining === 0}>
                    {isActive ? 'Pause' : 'Start'}
                </button>
                <button onClick={resetTimer}>
                    Reset
                </button>
            </div>
        </div>
    );
}

export default TimeTracker;
