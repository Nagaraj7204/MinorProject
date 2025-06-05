// src/components/AdminSidebar/AdminSidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './AdminSidebar.module.css';
import { useAuth } from '../../context/AuthContext';

// Import Icons
import {
  FaTachometerAlt, FaUsersCog, FaTasks, FaTrophy,
  FaHeadset, FaSignOutAlt
} from 'react-icons/fa';

const AdminSidebar = () => {
  const { logout } = useAuth();

  const handleLogout = () => {
    console.log("Admin logging out...");
    logout();
  };

  const getNavLinkClass = ({ isActive }) => {
    return isActive ? `${styles.sidebarLink} ${styles.active}` : styles.sidebarLink;
  };

  return (
    <nav className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <h2>Workopoly</h2>
        <span className={styles.adminLabel}>Admin Panel</span>
      </div>
      <ul className={styles.sidebarNavList}>
        <li>
          <NavLink to="/admin/dashboard" className={getNavLinkClass} end>
            <FaTachometerAlt /> Overview
          </NavLink>
        </li>
        <li>
          <NavLink to="/admin/users" className={getNavLinkClass}>
            <FaUsersCog /> Users
          </NavLink>
        </li>
        <li>
          <NavLink to="/admin/tasks" className={getNavLinkClass}>
            <FaTasks /> Tasks
          </NavLink>
        </li>
        <li>
          <NavLink to="/admin/leaderboard" className={getNavLinkClass}>
            <FaTrophy /> Leaderboard
          </NavLink>
        </li>
        <li>
          <NavLink to="/admin/support" className={getNavLinkClass}>
            <FaHeadset /> Feedback/Support
          </NavLink>
        </li>
      </ul>
      <div className={styles.sidebarFooter}>
        <button onClick={handleLogout} className={styles.logoutButton}>
          <FaSignOutAlt /> Log Out
        </button>
      </div>
    </nav>
  );
};

export default AdminSidebar;
