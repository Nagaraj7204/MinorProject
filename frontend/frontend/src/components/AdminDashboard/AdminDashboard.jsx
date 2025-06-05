// src/components/AdminDashboard/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // For shortcuts
import styles from './AdminDashboard.module.css';
import { FaUsers, FaTasks, FaCheckCircle, FaSearch, FaFolderOpen, FaChartBar } from 'react-icons/fa';

const AdminDashboard = () => {
  // --- State for Simplified Data ---
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalTasks, setTotalTasks] = useState(0);
  const [completedTasks, setCompletedTasks] = useState(0);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentTasks, setRecentTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Fetch Data on Mount ---
  useEffect(() => {
    setIsLoading(true);
    const fetchAdminSummary = async () => {
      try {
        // 1. API URL: Ensure this matches your backend setup.
        const apiUrl = '/api/admin/dashboard-summary'; // Or process.env.REACT_APP_API_URL + '/admin/dashboard-summary'

        // 2. Authentication: Get the admin's auth token from 'userInfo' in localStorage.
        const userInfoString = localStorage.getItem('userInfo');
        let token = null;

        if (userInfoString) {
          const userInfo = JSON.parse(userInfoString);
          if (userInfo && userInfo.token) {
            token = userInfo.token;
          }
        }
        // console.log('Admin Auth Token being sent:', token); // Optional: for debugging

        if (!token) {
          // If no token is found, it's an authentication issue before even making the request.
          // This could happen if the admin is not logged in or token isn't stored correctly.
          throw new Error('Authentication token not found. Please log in as admin.');
        }

        const response = await fetch(apiUrl, {
          headers: {
            'Authorization': `Bearer ${token}`, // Send the token
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          // Handle specific HTTP error statuses if needed
          if (response.status === 401) {
            throw new Error('Unauthorized: Invalid or expired token. Please log in again.');
          }
          if (response.status === 403) {
            throw new Error('Forbidden: You do not have permission to access this resource.');
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        setTotalUsers(data.totalUsers || 0);
        setTotalTasks(data.totalTasks || 0);
        setCompletedTasks(data.completedTasks || 0);
        setRecentUsers(data.recentUsers || []);
        setRecentTasks(data.recentTasks || []);
        setError(null); // Clear any previous errors
      } catch (err) {
        console.error("Failed to fetch admin dashboard data:", err);
        // Set a more user-friendly error message based on the error type
        if (err.message.startsWith('Unauthorized') || err.message.startsWith('Forbidden') || err.message.startsWith('Authentication token not found')) {
          setError(err.message);
        } else {
          setError("Failed to load dashboard data. Please try again later.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminSummary();
  }, []);

  return (
    <div className={styles.adminDashboardContainer}>
      <h1 className={styles.dashboardTitle}>Dashboard Overview</h1>

      {error && <p className={styles.errorMessage}>{error}</p>}

      {isLoading && !error ? ( // Show loading only if no error
        <p>Loading dashboard...</p>
      ) : !isLoading && !error && ( // Only render grid if not loading and no error
        <div className={styles.dashboardGrid}> {/* Use a grid for layout */}

          {/* --- Basic Stats Section --- */}
          <section className={`${styles.dashboardSection} ${styles.statsOverview}`}>
             {/* Stat Card: Total Users */}
            <Link to="/admin/users" className={`${styles.statCardLinkWrapper}`}>
                <div className={`${styles.statCard} ${styles.users}`}>
                <div className={styles.statIconWrapper}> <FaUsers className={styles.statIcon} /> </div>
                <div className={styles.statInfo}> <span className={styles.statValue}>{totalUsers.toLocaleString()}</span> <span className={styles.statLabel}>Total Users</span> </div>
                </div>
            </Link>
             {/* Stat Card: Total Tasks */}
             <Link to="/admin/tasks" className={`${styles.statCardLinkWrapper}`}>
                <div className={`${styles.statCard} ${styles.tasks}`}>
                <div className={styles.statIconWrapper}> <FaTasks className={styles.statIcon} /> </div>
                <div className={styles.statInfo}> <span className={styles.statValue}>{totalTasks.toLocaleString()}</span> <span className={styles.statLabel}>Total Tasks</span> </div>
                </div>
             </Link>
             {/* Stat Card: Completed Tasks */}
             <Link to="/admin/tasks?status=completed" className={`${styles.statCardLinkWrapper}`}> {/* Example filter link */}
                <div className={`${styles.statCard} ${styles.completed}`}>
                <div className={styles.statIconWrapper}> <FaCheckCircle className={styles.statIcon} /> </div>
                <div className={styles.statInfo}> <span className={styles.statValue}>{completedTasks.toLocaleString()}</span> <span className={styles.statLabel}>Completed Tasks</span> </div>
                </div>
             </Link>
          </section>

          {/* --- Recent Signups Section --- */}
          <section className={`${styles.dashboardSection} ${styles.recentActivity}`}>
            <h2 className={styles.sectionTitle}>Recent Signups</h2>
            {recentUsers.length > 0 ? (
              <ul className={styles.activityList}>
                {recentUsers.map(user => (
                  <li key={user.id}>
                    <span className={styles.activityName}>{user.name || user.username}</span> {/* Adapt based on your user object */}
                    <span className={styles.activityDetail}>{user.email}</span>
                    <span className={styles.activityDate}>{user.joined ? new Date(user.joined).toLocaleDateString() : 'N/A'}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.noDataMessage}>No recent signups to display.</p>
            )}
            <Link to="/admin/users" className={styles.viewAllLink}>View All Users &rarr;</Link>
          </section>

          {/* --- Recent Tasks Section --- */}
          <section className={`${styles.dashboardSection} ${styles.recentActivity}`}>
            <h2 className={styles.sectionTitle}>Recent Tasks</h2>
            {recentTasks.length > 0 ? (
              <ul className={styles.activityList}>
                {recentTasks.map(task => (
                  <li key={task.id}>
                    <span className={styles.activityName}>{task.title}</span>
                    <span className={styles.activityDetail}>by {task.userName || task.user?.name || 'N/A'}</span> {/* Adapt based on your task object */}
                    <span className={`${styles.activityStatus} ${styles[task.status?.toLowerCase()] || ''}`}>
                      {task.status}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.noDataMessage}>No recent tasks to display.</p>
            )}
             <Link to="/admin/tasks" className={styles.viewAllLink}>View All Tasks &rarr;</Link>
          </section>

          {/* --- Quick Shortcuts Section --- */}
          <section className={`${styles.dashboardSection} ${styles.quickShortcuts}`}>
             <h2 className={styles.sectionTitle}>Quick Shortcuts</h2>
             <div className={styles.shortcutButtons}>
                <Link to="/admin/users" className={styles.shortcutButton}>
                    <FaSearch /> View All Users
                </Link>
                 <Link to="/admin/tasks" className={styles.shortcutButton}>
                    <FaFolderOpen /> View All Tasks
                </Link>
                 <Link to="/admin/reports" className={styles.shortcutButton}>
                    <FaChartBar /> View Reports
                </Link>
             </div>
          </section>

        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
