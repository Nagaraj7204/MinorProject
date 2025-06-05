// src/components/Layout/DashboardLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';
import styles from './DashboardLayout.module.css'; // Import CSS Module

const DashboardLayout = ({ logout }) => {
  return (
    <div className={styles.dashboardLayout}> {/* Use styles object */}
      <Sidebar logout={logout} />
      <main className={styles.dashboardContent}> {/* Use styles object */}
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
