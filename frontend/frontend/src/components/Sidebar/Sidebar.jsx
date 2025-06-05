// src/components/Sidebar/Sidebar.jsx
import React from 'react';
import { NavLink, useNavigate } // Import useNavigate if you want explicit navigation (optional)
  from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Import useAuth
import styles from './Sidebar.module.css'; // Import CSS Module

// Import actual icons from react-icons
import {
  FaTachometerAlt, FaTasks, FaChartLine, FaTrophy, FaUser, FaSignOutAlt,
  FaGift, FaGem, FaComments, FaGamepad, FaRegClock // Added FaRegClock for Pomodoro
} from 'react-icons/fa';

// Use imported icons
const OverviewIcon = () => <FaTachometerAlt />;
const TaskListIcon = () => <FaTasks />;
const ProgressIcon = () => <FaChartLine />;
const LeaderboardIcon = () => <FaTrophy />;
const FeedbackIcon = () => <FaComments />; // Icon for Feedback
const ProfileIcon = () => <FaUser />;
const RewardsIcon = () => <FaGift />; // New Rewards Icon
const SubscriptionIcon = () => <FaGem />; // Icon for Subscription Tiers
const GamesIcon = () => <FaGamepad />; // Icon for Games
const PomodoroIcon = () => <FaRegClock />; // New Pomodoro Timer Icon
const LogoutIcon = () => <FaSignOutAlt />;

const Sidebar = ({ logout }) => {
  // const navigate = useNavigate(); // Optional: If you want explicit navigation
  const { user } = useAuth(); // Get user from AuthContext

  const handleLogout = () => {
    // Remove the window.confirm check
    // if (window.confirm("Are you sure you want to log out?")) {
      console.log("Logging out and redirecting..."); // Add a log for clarity
      logout(); // Call the logout function passed from App.jsx/ProtectedRoutes
      // Optional: Explicitly navigate. However, the ProtectedRoutes wrapper
      // should automatically redirect to /login when isLoggedIn becomes false.
      // Relying on the auth state change is often cleaner.
      // navigate('/login');
    // }
  };

  // Use CSS Modules for active class handling
  const getNavLinkClass = ({ isActive }) => {
    return isActive ? `${styles.sidebarLink} ${styles.active}` : styles.sidebarLink;
  };

  return (
    <nav className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <h2>Workopoly</h2>
      </div>
      <ul className={styles.sidebarNavList}>
        <li>
          <NavLink to="/dashboard" className={getNavLinkClass}>
            <OverviewIcon /> Overview
          </NavLink>
        </li>
        <li>
          <NavLink to="/tasks" className={getNavLinkClass}>
            <TaskListIcon /> Task List
          </NavLink>
        </li>
        {/* --- Add Pomodoro Timer Link --- */}
        <li>
          <NavLink to="/pomodoro-timer" className={getNavLinkClass}>
            <PomodoroIcon /> Pomodoro Timer
          </NavLink>
        </li>
        <li>
          <NavLink to="/my-progress" className={getNavLinkClass}>
            <ProgressIcon /> My Progress
          </NavLink>
        </li>
        <li>
          <NavLink to="/leaderboard" className={getNavLinkClass}>
            <LeaderboardIcon /> Leaderboard
          </NavLink>
        </li>
        <li>
          <NavLink to="/user/profile" className={getNavLinkClass}>
            <ProfileIcon /> User Profile
          </NavLink>
        </li>
        {/* --- Add Rewards Link --- */}
        <li>
          <NavLink to="/rewards" className={getNavLinkClass}>
            <RewardsIcon /> Rewards
          </NavLink>
        </li>
        {/* --- Conditionally Add Games Link for Diamond Tier --- */}
        {user && user.tier === 'diamond' && (
          <li>
            <NavLink to="/games" className={getNavLinkClass}>
              <GamesIcon /> Games
            </NavLink>
          </li>
        )}
        {/* --- Add Feedback & Support Link --- */}
        <li>
          <NavLink to="/feedback" className={getNavLinkClass}>
            <FeedbackIcon /> Feedback & Support
          </NavLink>
        </li>
        {/* --- Add Subscription Tiers Link --- */}
        <li>
          <NavLink to="/subscription-tiers" className={getNavLinkClass}>
            <SubscriptionIcon /> 💎 Subscription Tiers
          </NavLink>
        </li>
      </ul>
      <div className={styles.sidebarFooter}>
        {/* The button now directly calls the simplified handleLogout */}
        <button onClick={handleLogout} className={styles.logoutButton}>
          <LogoutIcon /> Log Out
        </button>
      </div>
    </nav>
  );
};

export default Sidebar;
