// src/components/Widgets/DailyGoals.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from '../Dashboards/Dashboard.module.css'; // Adjust path as needed

// Sample goals - In a real app, these might come from user settings or a config
const initialGoals = [
    { id: 'dg1', text: 'Complete 2 tasks today', completed: false },
    { id: 'dg2', text: 'Use Pomodoro timer for 1 session', completed: false },
    { id: 'dg3', text: 'Review notes for 15 minutes', completed: false },
];

// Function to get today's date as a string 'YYYY-MM-DD'
const getTodayDateString = () => {
    return new Date().toISOString().split('T')[0];
};

function DailyGoals({ tasks }) { // Accept tasks prop for potential future use
    const [goals, setGoals] = useState([]);
    const [lastResetDate, setLastResetDate] = useState(() => {
        return localStorage.getItem('goalsLastResetDate') || '';
    });

    // Effect to initialize and reset goals daily
    useEffect(() => {
        const today = getTodayDateString();
        let currentGoals = [];

        if (lastResetDate === today) {
            // Load goals from localStorage if already set today
            const savedGoals = localStorage.getItem('dailyGoals');
            try {
                currentGoals = savedGoals ? JSON.parse(savedGoals) : [...initialGoals];
                 // Ensure loaded goals match initial structure in case initialGoals changed
                 if (currentGoals.length !== initialGoals.length || !currentGoals[0]?.id) {
                    console.warn("Mismatch in saved goals, resetting.");
                    currentGoals = [...initialGoals.map(g => ({...g, completed: false}))]; // Reset completion
                    localStorage.setItem('dailyGoals', JSON.stringify(currentGoals));
                 }

            } catch (e) {
                console.error("Failed to parse saved goals, resetting.", e);
                currentGoals = [...initialGoals.map(g => ({...g, completed: false}))]; // Reset completion
                localStorage.setItem('dailyGoals', JSON.stringify(currentGoals));
            }
        } else {
            // It's a new day, reset goals
            console.log("New day detected, resetting daily goals.");
            currentGoals = [...initialGoals.map(g => ({...g, completed: false}))]; // Reset completion
            localStorage.setItem('dailyGoals', JSON.stringify(currentGoals));
            localStorage.setItem('goalsLastResetDate', today);
            setLastResetDate(today);
        }
        setGoals(currentGoals);

    }, [lastResetDate]); // Rerun only when lastResetDate changes (on initial load)


    // Handle toggling goal completion
    const handleGoalToggle = (goalId) => {
        setGoals(prevGoals => {
            const updatedGoals = prevGoals.map(goal =>
                goal.id === goalId ? { ...goal, completed: !goal.completed } : goal
            );
            // Save updated goals to localStorage
            localStorage.setItem('dailyGoals', JSON.stringify(updatedGoals));

            // Find the specific goal that was toggled
            const toggledGoal = updatedGoals.find(g => g.id === goalId);
            if (toggledGoal?.completed) {
                 // TODO: Award bonus points / Update global user state / API call
                 console.log(`Goal "${toggledGoal.text}" completed! Award points here.`);
            } else if (toggledGoal) {
                 // Optional: Logic if goal is un-completed (e.g., deduct points?)
                 console.log(`Goal "${toggledGoal.text}" un-completed.`);
            }

            return updatedGoals;
        });
    };

    // TODO: Add logic here or in useEffect to automatically check goals
    // based on 'tasks' prop or other data if needed in the future.
    // Example: Check how many tasks were completed today
    // const tasksCompletedToday = useMemo(() => {
    //     const today = getTodayDateString();
    //     return tasks.filter(t => t.completed && t.completionDate?.startsWith(today)).length;
    // }, [tasks]);
    // useEffect(() => {
    //     if (tasksCompletedToday >= 2) {
    //         // Find the 'Complete 2 tasks' goal and mark it complete if not already
    //     }
    // }, [tasksCompletedToday]);


    return (
        <div className={styles.widgetCard}>
            <h3>Daily Goals</h3>
            {goals.length > 0 ? (
                <ul className={styles.goalList}>
                    {goals.map((goal) => (
                        <li key={goal.id} className={`${styles.goalItem} ${goal.completed ? styles.goalItemCompleted : ''}`}>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={goal.completed}
                                    onChange={() => handleGoalToggle(goal.id)}
                                />
                                <span>{goal.text}</span>
                            </label>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>Loading goals...</p> // Or a loading indicator
            )}
             {/* Optional: Add input field to add custom goals */}
             {/* <div className={styles.addGoalArea}> ... </div> */}
        </div>
    );
}

DailyGoals.propTypes = {
    tasks: PropTypes.array, // Accept tasks array, make it optional for now
};

export default DailyGoals;
