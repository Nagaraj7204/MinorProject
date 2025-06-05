import React from 'react';
import styles from './TaskManagement.module.css';
// Optional: Import an icon or image
// import { FaTasks, FaBell, FaUsers } from 'react-icons/fa';
// import taskImage from '../../assets/task-management-image.svg'; // Example image path

function TaskManagement() {
  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentWrapper}>
        {/* Optional: Icon or Image */}
        {/* <FaTasks className={styles.pageIcon} /> */}
        {/* <img src={taskImage} alt="Task Management Illustration" className={styles.pageImage} /> */}

        <h1 className={styles.pageTitle}>Master Your Tasks</h1>
        <p className={styles.pageSubtitle}>
          Organize, prioritize, and conquer your to-do list with Workopoly's intuitive task management features. Streamline your workflow and boost productivity effortlessly.
        </p>

        <div className={styles.featureList}>
          <div className={styles.featureItem}>
            {/* <FaCheckCircle className={styles.featureIcon} /> */}
            <h3>✅ Simple & Visual</h3>
            <p>Create tasks quickly, add details, set due dates, and assign priorities (High, Medium, Low).</p>
          </div>
          <div className={styles.featureItem}>
            {/* <FaSyncAlt className={styles.featureIcon} /> */}
            <h3>🔄 Track Progress</h3>
            <p>Move tasks through customizable stages like 'To Do', 'In Progress', and 'Done'.</p>
          </div>
          <div className={styles.featureItem}>
            {/* <FaFilter className={styles.featureIcon} /> */}
            <h3>🔍 Filter & Sort</h3>
            <p>Easily find what you need by filtering tasks by status or priority, and sorting by due date or importance.</p>
          </div>
           <div className={styles.featureItem}>
            {/* <FaGamepad className={styles.featureIcon} /> */}
            <h3>🎮 Gamified Motivation</h3>
            <p>Earn points for completing tasks and watch your productivity score grow!</p>
          </div>
           {/* --- New Feature Items --- */}
           <div className={styles.featureItem}>
            {/* <FaBell className={styles.featureIcon} /> */}
            <h3>🔔 Reminders & Due Dates</h3>
            <p>Never miss a deadline with clear due date visibility and optional reminders (Planned Feature).</p>
          </div>
           <div className={styles.featureItem}>
            {/* <FaUsers className={styles.featureIcon} /> */}
            <h3>👥 Collaboration Ready</h3>
            <p>Assign tasks, share progress, and work together seamlessly with team features (Coming Soon!).</p>
          </div>
           {/* --- End New Feature Items --- */}
        </div>

        <p className={styles.callToAction}>
          Ready to turn chaos into clarity? Start managing your tasks effectively today!
        </p>
      </div>
    </div>
  );
}

export default TaskManagement;
