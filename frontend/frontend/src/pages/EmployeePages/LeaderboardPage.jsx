// src/Pages/EmployeePages/LeaderboardPage.jsx
import React from 'react';
import { useOutletContext } from 'react-router-dom';
import Leaderboard from '../../components/Leaderboard/Leaderboard';
// import styles from '../../components/Dashboards/Dashboard.module.css'; // Only if extra styling needed

function LeaderboardPage() {
    const { leaderboardData, userName } = useOutletContext();

    return (
        // Render the Leaderboard component directly, it's already styled like a card
        <Leaderboard data={leaderboardData} currentUserName={userName} />
    );
}

export default LeaderboardPage;
