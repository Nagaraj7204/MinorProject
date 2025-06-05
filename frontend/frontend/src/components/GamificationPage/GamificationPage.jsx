// src/components/GamificationPage/GamificationPage.jsx
import React from 'react';
import styles from './GamificationPage.module.css';
import { FaTrophy, FaStar, FaLevelUpAlt, FaChartLine, FaUsers } from 'react-icons/fa';

const GamificationPage = () => {
  return (
    <div className={styles.gamificationContainer}>
      <header className={styles.header}>
        <h1><FaTrophy className={styles.headerIcon} /> Turn Work into Play with Gamification!</h1>
        <p className={styles.subtitle}>Discover how Workopoly makes task management engaging and motivating.</p>
      </header>

      <section className={styles.featureSection}>
        <div className={styles.featureIconContainer}>
          <FaStar className={styles.featureIcon} />
        </div>
        <div className={styles.featureContent}>
          <h2>Earn Points for Productivity</h2>
          <p>Completing tasks, meeting deadlines, and collaborating effectively earns you valuable points. Every action contributes to your progress and recognition within the Workopoly community.</p>
        </div>
      </section>

      <section className={`${styles.featureSection} ${styles.reverseLayout}`}>
         <div className={styles.featureIconContainer}>
           <FaLevelUpAlt className={styles.featureIcon} />
         </div>
        <div className={styles.featureContent}>
          <h2>Level Up Your Profile</h2>
          <p>Accumulate points to climb through different levels. Each new level signifies your growing expertise and dedication, unlocking potential perks or visual indicators of your status.</p>
        </div>
      </section>

      <section className={styles.featureSection}>
         <div className={styles.featureIconContainer}>
           <FaTrophy className={styles.featureIcon} /> {/* Can reuse or use FaMedal */}
         </div>
        <div className={styles.featureContent}>
          <h2>Collect Badges and Achievements</h2>
          <p>Reach milestones and showcase your accomplishments! Earn unique badges for various achievements, like completing your first 10 tasks, maintaining a streak, or mastering a specific skill.</p>
        </div>
      </section>

      <section className={`${styles.featureSection} ${styles.reverseLayout}`}>
         <div className={styles.featureIconContainer}>
           <FaChartLine className={styles.featureIcon} />
         </div>
        <div className={styles.featureContent}>
          <h2>Compete on the Leaderboard</h2>
          <p>See how you stack up against your peers! The leaderboard ranks users based on points earned, fostering friendly competition and encouraging everyone to perform their best.</p>
          {/* Optional: Link to the actual leaderboard if public or user is logged in */}
          {/* <Link to="/leaderboard">View Leaderboard</Link> */}
        </div>
      </section>

      <footer className={styles.footer}>
        <p>Ready to make work more rewarding? <a href="/sign-up">Sign up</a> for Workopoly today!</p>
      </footer>
    </div>
  );
};

export default GamificationPage;
