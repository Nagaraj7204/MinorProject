// src/components/Widgets/DailyMotivation.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from '../Dashboards/Dashboard.module.css'; // Adjust path as needed

// --- Sample Content ---
// In a real app, fetch this from an API or config, potentially based on user unlocks
const motivationalQuotes = [
    "The only way to do great work is to love what you do. - Steve Jobs",
    "Believe you can and you're halfway there. - Theodore Roosevelt",
    "Strive not to be a success, but rather to be of value. - Albert Einstein",
    "The best way to predict the future is to create it. - Peter Drucker",
    "Don't watch the clock; do what it does. Keep going. - Sam Levenson",
    "Success is not final, failure is not fatal: It is the courage to continue that counts. - Winston Churchill",
];

const motivationalImages = [
    // Replace with actual URLs to funny/motivational gifs or memes
    // Use reliable sources or host your own images
    "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExczBqOWZrdjZldjV0aWcyY2w5ajc3cWJqZHN6dGRwZWJtNnNqMmMxZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7abGQa0aRksFScdq/giphy.gif", // Example: Dog typing
    "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbW9yZzNqbjc1d2N0ZzZkM3N0b3N0aGZ0b2w5aHc0bWZsY3JtY3NqZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l46C52IJdRfvCGySQ/giphy.gif", // Example: High five cat
    "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExZzVqZ3NqY3ZqZ3NqY3ZqZ3NqY3ZqZ3NqY3ZqZ3NqY3ZqZ3NqYyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3oEjI6SIIHBdRxXI40/giphy.gif", // Example: You got this!
];

// Combine content pools (add more types like audio later)
const allContent = [
    ...motivationalQuotes.map(q => ({ type: 'quote', content: q })),
    ...motivationalImages.map(img => ({ type: 'image', content: img })),
];

// Function to get today's date string
const getTodayDateString = () => new Date().toISOString().split('T')[0];

function DailyMotivation() {
    const [motivation, setMotivation] = useState(null); // { type: 'quote'/'image', content: '...' }
    const [lastShownDate, setLastShownDate] = useState(() => {
        return localStorage.getItem('motivationLastShownDate') || '';
    });

    useEffect(() => {
        const today = getTodayDateString();
        let selectedContent = null;

        if (lastShownDate === today) {
            // Load today's motivation if already selected
            const saved = localStorage.getItem('dailyMotivationContent');
            try {
                selectedContent = saved ? JSON.parse(saved) : null;
            } catch (e) {
                console.error("Failed to parse saved motivation", e);
                selectedContent = null; // Force re-selection
            }
        }

        // If it's a new day or no content was saved/loaded
        if (!selectedContent || lastShownDate !== today) {
            console.log("Selecting new daily motivation.");
            // --- Gamification Placeholder ---
            // TODO: Filter 'allContent' based on user's unlocked items
            const availableContent = [...allContent]; // Use full list for now

            if (availableContent.length > 0) {
                const randomIndex = Math.floor(Math.random() * availableContent.length);
                selectedContent = availableContent[randomIndex];

                // Save for today
                localStorage.setItem('dailyMotivationContent', JSON.stringify(selectedContent));
                localStorage.setItem('motivationLastShownDate', today);
                setLastShownDate(today);
            }
        }

        setMotivation(selectedContent);

    }, []); // Run only once on mount to check/set daily motivation

    const renderContent = () => {
        if (!motivation) {
            return <p className={styles.loadingText}>Loading motivation...</p>;
        }

        switch (motivation.type) {
            case 'quote':
                return <p className={styles.quoteText}>"{motivation.content}"</p>;
            case 'image':
                return (
                    <img
                        src={motivation.content}
                        alt="Motivational visual"
                        className={styles.motivationImage}
                    />
                );
            // case 'audio': // Placeholder for future
            //     return <audio controls src={motivation.content}>Your browser does not support the audio element.</audio>;
            default:
                return <p className={styles.loadingText}>Hmm, something went wrong.</p>;
        }
    };

    return (
        <div className={styles.widgetCard}>
            <h3>Daily Boost ✨</h3> {/* Changed title */}
            <div className={styles.motivationContentArea}>
                {renderContent()}
            </div>
            {/* TODO: Add button to manually refresh or get new unlocked item? */}
        </div>
    );
}

// No props needed for this basic version yet
// DailyMotivation.propTypes = {
//     userProgress: PropTypes.object, // Example for gamification later
// };

export default DailyMotivation;
