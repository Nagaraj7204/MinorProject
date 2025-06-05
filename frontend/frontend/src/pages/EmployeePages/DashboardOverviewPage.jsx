// src/Pages/EmployeePages/DashboardOverviewPage.jsx
import React, { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import styles from '../../components/Dashboards/Dashboard.module.css'; // Reuse styles

function DashboardOverviewPage() {
    // --- Get data from Layout via context ---
    const { tasks, getTodayDateString } = useOutletContext();

    // --- Calculations specific to this page ---
    const taskCounts = useMemo(() => {
        const total = tasks.length;
        const completed = tasks.filter(task => task.status === 'Done').length;
        const pending = tasks.filter(task => task.status === 'To Do' || task.status === 'In Progress').length;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const overdue = tasks.filter(task => {
            if (!task.dueDate || task.status === 'Done') return false;
            const [year, month, day] = task.dueDate.split('-').map(Number);
            const dueDate = new Date(year, month - 1, day);
            dueDate.setHours(0, 0, 0, 0);
            return !isNaN(dueDate.getTime()) && dueDate < today;
        }).length;
        return { total, completed, pending, overdue };
    }, [tasks]);

    const todaysTasks = useMemo(() => {
        const todayString = getTodayDateString();
        return tasks.filter(task => task.dueDate === todayString && task.status !== 'Done');
    }, [tasks, getTodayDateString]);


    return (
        <>
            {/* Task Summary Widgets Row */}
            <div className={styles.widgetsRow}>
                 <div className={styles.widgetCard}>
                    <h3>Total Tasks</h3>
                    <div className={styles.statValue}>{taskCounts.total}</div>
                 </div>
                 <div className={styles.widgetCard}>
                    <h3>Completed</h3>
                    <div className={styles.statValue}>{taskCounts.completed}</div>
                 </div>
                 <div className={styles.widgetCard}>
                    <h3>Pending</h3>
                    <div className={styles.statValue}>{taskCounts.pending}</div>
                 </div>
                 <div className={styles.widgetCard}>
                    <h3>Overdue</h3>
                    <div className={`${styles.statValue} ${taskCounts.overdue > 0 ? styles.statValueOverdue : ''}`}>
                        {taskCounts.overdue}
                    </div>
                 </div>
            </div>

            {/* Today's Tasks Section */}
            <div className={styles.todaysTasksCard}>
                 <h2>Tasks Due Today</h2>
                 {todaysTasks.length > 0 ? (
                    <ul className={styles.todaysTaskList}>
                        {todaysTasks.map(task => (
                            <li key={task.id} className={styles.todaysTaskItem}>
                                <span className={styles.todaysTaskTitle}>{task.title}</span>
                                <span className={`${styles.taskPriority} ${styles[`priority${task.priority}`]}`}>
                                    {task.priority}
                                </span>
                            </li>
                        ))}
                    </ul>
                 ) : (
                    <p className={styles.noTasksMessage}>No pending tasks due today. Well done!</p>
                 )}
            </div>

            {/* Task Timeline Placeholder Section */}
            <div className={styles.timelineCard}>
                 <h2>Task Timeline / Calendar</h2>
                 <p className={styles.placeholderText}>Visual timeline/calendar view coming soon.</p>
            </div>
        </>
    );
}

export default DashboardOverviewPage;
