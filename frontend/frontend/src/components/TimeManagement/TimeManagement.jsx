import React from 'react';
import styles from './TimeManagement.module.css'; // Use the specific module
// Optional: Import an icon or image
// import { FaClock, FaChartBar, FaBullseye } from 'react-icons/fa';
// import timeImage from '../../assets/time-management-image.svg'; // Example image path

function TimeManagement() {
  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentWrapper}>
        {/* Optional: Icon or Image */}
        {/* <FaClock className={styles.pageIcon} /> */}
        {/* <img src={timeImage} alt="Time Management Illustration" className={styles.pageImage} /> */}

        <h1 className={styles.pageTitle}>Unlock Your Time</h1>
        <p className={styles.pageSubtitle}>
          Understand where your time goes, work smarter, and achieve more with Workopoly's time management tools. Gain insights and build better habits.
        </p>

        <div className={styles.featureList}>
          <div className={styles.featureItem}>
            {/* <FaPlayCircle className={styles.featureIcon} /> */}
            <h3>⏱️ Effortless Tracking</h3>
            <p>Log time spent on tasks with a simple start/stop timer or add manual entries later.</p>
          </div>
          <div className={styles.featureItem}>
            {/* <FaChartBar className={styles.featureIcon} /> */}
            <h3>📊 Insightful Reports</h3>
            <p>Visualize your time allocation across different projects or task types (Coming Soon!).</p>
          </div>
          <div className={styles.featureItem}>
            {/* <FaBullseye className={styles.featureIcon} /> */}
            <h3>🎯 Improve Estimates</h3>
            <p>Compare estimated vs. actual time spent to refine your planning and quoting skills.</p>
          </div>
           <div className={styles.featureItem}>
            {/* <FaCoffee className={styles.featureIcon} /> */}
            <h3>🧘 Stay Focused</h3>
            <p>Integrate techniques like Pomodoro to maintain focus and prevent burnout (Planned Feature).</p>
          </div>
           {/* --- New Feature Items --- */}
           <div className={styles.featureItem}>
            {/* <FaCalendarAlt className={styles.featureIcon} /> */}
            <h3>🗓️ Weekly Overview</h3>
            <p>See your logged time at a glance with weekly summaries to identify patterns (Planned Feature).</p>
          </div>
           <div className={styles.featureItem}>
            {/* <FaFileExport className={styles.featureIcon} /> */}
            <h3>📤 Export Data</h3>
            <p>Easily export your time logs for invoicing or reporting purposes (Coming Soon!).</p>
          </div>
           {/* --- End New Feature Items --- */}
        </div>

        <p className={styles.callToAction}>
          Make every minute count. Explore time management features designed for peak productivity!
        </p>
      </div>
    </div>
  );
}

export default TimeManagement;
