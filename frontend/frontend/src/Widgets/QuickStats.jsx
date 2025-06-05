// src/components/Widgets/QuickStats.jsx
import React, { useMemo } from 'react';
import PropTypes from 'prop-types'; // Import PropTypes for prop validation
import styles from '../Dashboards/Dashboard.module.css'; // Adjust path as needed

function QuickStats({ tasks }) {
    // Calculate stats based on tasks prop
    const totalTasks = useMemo(() => tasks.length, [tasks]);
    const completed = useMemo(() => tasks.filter(t => t.completed).length, [tasks]);
    const pending = useMemo(() => tasks.filter(t => !t.completed && t.status !== 'Done').length, [tasks]);
    // Calculate overdue tasks (only if not completed and due date is in the past)
    const overdue = useMemo(() => {
        const now = new Date();
        // Set time to 00:00:00 to compare dates only, not times
        now.setHours(0, 0, 0, 0);
        return tasks.filter(t =>
            !t.completed &&
            t.dueDate &&
            new Date(t.dueDate) < now
        ).length;
    }, [tasks]);

    // Placeholder for daily streaks - requires more complex logic
    const dailyStreak = 0; // Replace with actual logic later

    return (
        <div className={styles.widgetCard}>
            <h3>Quick Stats</h3>
            <div className={styles.statsGrid}>
                <div className={styles.statItem}>
                    <span className={styles.statValue}>{totalTasks}</span>
                    <span className={styles.statLabel}>Total</span>
                </div>
                <div className={styles.statItem}>
                    <span className={styles.statValue}>{completed}</span>
                    <span className={styles.statLabel}>Completed</span>
                </div>
                <div className={styles.statItem}>
                    <span className={styles.statValue}>{pending}</span>
                    <span className={styles.statLabel}>Pending</span>
                </div>
                 <div className={styles.statItem}>
                    {/* Conditionally style overdue count if > 0 */}
                    <span className={`${styles.statValue} ${overdue > 0 ? styles.statValueOverdue : ''}`}>
                        {overdue}
                    </span>
                    <span className={styles.statLabel}>Overdue</span>
                </div>
                 {/* Example placeholder for Daily Streak */}
                 <div className={styles.statItem}>
                    <span className={styles.statValue}>{dailyStreak} 🔥</span>
                    <span className={styles.statLabel}>Streak</span>
                </div>
            </div>
        </div>
    );
}

// Add PropTypes for better component documentation and error checking
QuickStats.propTypes = {
    tasks: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        title: PropTypes.string.isRequired,
        completed: PropTypes.bool,
        status: PropTypes.string,
        dueDate: PropTypes.string, // Assuming dueDate is a string like 'YYYY-MM-DD'
        // Add other task properties if needed for stats later
    })).isRequired,
};

export default QuickStats;
