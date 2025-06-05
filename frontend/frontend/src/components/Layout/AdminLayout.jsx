// src/components/Layout/AdminLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../AdminSidebar/AdminSidebar'; // Import the new sidebar
import styles from './AdminLayout.module.css'; // Create this CSS file

const AdminLayout = () => {
  // No need to pass logout here, AdminSidebar gets it from context

  return (
    <div className={styles.adminLayout}> {/* Use different class name */}
      <AdminSidebar />
      <main className={styles.adminContent}> {/* Use different class name */}
        {/* This is where the specific admin page component will be rendered */}
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
