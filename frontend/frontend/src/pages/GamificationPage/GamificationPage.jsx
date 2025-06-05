// src/pages/GamificationPage/GamificationPage.jsx
import React, { useState, useMemo, useContext } from 'react'; // Added useContext (assuming you'll use it later)
import { Link } from 'react-router-dom'; // Import Link
import styles from './GamificationPage.module.css';
import XPBar from '../../components/XPBar/XPBar';
import BadgeDisplay from '../../components/BadgeDisplay/BadgeDisplay';
import ChallengesWidget from '../../components/ChallengesWidget/ChallengesWidget';
// Import context and challenge data if needed for real data
// import { UserContext } from '../../context/UserContext';
// import { getActiveChallengesForUser, allDailyChallenges, allWeeklyChallenges } from '../../data/challenges';

// --- Mock Data & Logic (Replace with actual data fetching/state management) ---
const allDailyChallenges = [
    { id: 'daily3', name: 'Daily Trio', description: 'Complete 3 tasks today', criteria: { tasksToday: 3 }, rewardXp: 25 },
    { id: 'dailyHigh', name: 'Priority Focus', description: 'Complete 1 High priority task today', criteria: { highPriorityToday: 1 }, rewardXp: 15 },
];
const allWeeklyChallenges = [
    { id: 'weekly15', name: 'Weekly Warrior', description: 'Complete 15 tasks this week', criteria: { tasksThisWeek: 15 }, rewardXp: 100 },
];
const getActiveChallenges = () => ({
    // Simulate fetching only *active* challenges for the user
    daily: [allDailyChallenges[0]], // Example: Only one daily active
    weekly: [allWeeklyChallenges[0]], // Example: Only one weekly active
});
// --- End Mock Data ---

function GamificationPage() {
    // --- State (Replace with actual user data source like Context) ---
    // const { user } = useContext(UserContext); // Example using context
    const [userData, setUserData] = useState({
        xp: 850,
        level: 4, // Added level for context
        points: 500, // Added points for context
        achievements: ['tasks10', 'highPrio5'], // Example earned badges
        challengeProgress: { daily3: 1, weekly15: 7 }, // Progress keyed by challenge ID
        // Add other relevant user fields from context example if needed
        tasksCompletedToday: 1,
        tasksCompletedThisWeek: 7,
        highPriorityTasksCompletedToday: 0,
    });
    // --- End State ---

    // Get active challenges (could also be part of userData/context)
    const activeChallenges = useMemo(() => getActiveChallenges(), []);

    // Helper to get progress (using mock state for now)
    const getChallengeProgress = (challengeId) => {
        const challengeDef = [...allDailyChallenges, ...allWeeklyChallenges].find(c => c.id === challengeId);
        if (!challengeDef) return 0;
        const criteriaKey = Object.keys(challengeDef.criteria)[0];
        // Access the correct property from the mock userData state
        return userData[criteriaKey] || userData.challengeProgress[challengeId] || 0;
    };

    // Handle loading state if using context/API
    // if (!user) {
    //     return <div className={styles.pageContainer}>Loading...</div>;
    // }

    return (
        <div className={styles.pageContainer}>
            <h1 className={styles.pageTitle}>My Progress & Achievements</h1>

            {/* XP and Level Section */}
            <section className={styles.sectionCard}>
                <h2 className={styles.sectionTitle}>Level & XP</h2>
                <XPBar currentXP={userData.xp} />
                {/* Added the Link to Customize page */}
                <div className={styles.customizeLinkWrapper}>
                    <Link to="/customize" className={styles.customizeLink}>
                        ✨ Customize Your Look ✨
                    </Link>
                </div>
            </section>

            {/* Challenges Section */}
            <section className={styles.sectionCard}>
                <h2 className={styles.sectionTitle}>Active Challenges</h2>
                <div className={styles.challengesList}>
                    {/* Display Daily Challenges */}
                    {activeChallenges.daily.length > 0 && <h3>Daily</h3>}
                    {activeChallenges.daily.map(challenge => (
                        <ChallengesWidget
                            key={challenge.id}
                            challenge={challenge}
                            progress={getChallengeProgress(challenge.id)}
                        />
                    ))}

                    {/* Display Weekly Challenges */}
                    {activeChallenges.weekly.length > 0 && <h3 className={styles.weeklyTitle}>Weekly</h3>}
                     {activeChallenges.weekly.map(challenge => (
                        <ChallengesWidget
                            key={challenge.id}
                            challenge={challenge}
                            progress={getChallengeProgress(challenge.id)}
                        />
                    ))}

                    {/* Message if no challenges */}
                    {activeChallenges.daily.length === 0 && activeChallenges.weekly.length === 0 && (
                        <p className={styles.noItems}>No active challenges right now. Check back soon!</p>
                    )}
                </div>
            </section>

            {/* Badges Section */}
            <section className={styles.sectionCard}>
                <h2 className={styles.sectionTitle}>My Badges</h2>
                {/* BadgeDisplay component handles the 'no badges' case internally */}
                <BadgeDisplay earnedAchievementIds={userData.achievements} />
            </section>

        </div>
    );
}

export default GamificationPage;
