// src/Pages/EmployeePages/ProgressPage.jsx
import React, { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import ProgressChart from '../../components/ProgressChart/ProgressChart';
import styles from '../../components/Dashboards/Dashboard.module.css'; // Reuse styles

function ProgressPage() {
    // --- Get shared data/functions from Layout ---
    const { tasks, format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachWeekOfInterval,
            eachMonthOfInterval, subWeeks, subMonths, isWithinInterval, parseISO } = useOutletContext();

    // --- State specific to this page ---
    const [chartTimePeriod, setChartTimePeriod] = useState('Weekly');

    // --- Chart Data Calculation (copied from EmployeeDashboard) ---
     const progressChartData = useMemo(() => {
        const completedTasks = tasks.filter(task => task.status === 'Done' && task.dueDate);
        const labels = [];
        const data = [];
        const now = new Date();
        try {
            if (chartTimePeriod === 'Weekly') {
                const weeksToShow = 4;
                const startDate = startOfWeek(subWeeks(now, weeksToShow - 1), { weekStartsOn: 1 });
                const endDate = endOfWeek(now, { weekStartsOn: 1 });
                const weeksInterval = eachWeekOfInterval({ start: startDate, end: endDate }, { weekStartsOn: 1 });
                weeksInterval.forEach(weekStart => {
                    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
                    const interval = { start: weekStart, end: weekEnd };
                    let count = 0;
                    completedTasks.forEach(task => {
                        try {
                            const [year, month, day] = task.dueDate.split('-').map(Number);
                            const taskDueDate = new Date(year, month - 1, day);
                            if (!isNaN(taskDueDate.getTime()) && isWithinInterval(taskDueDate, interval)) { count++; }
                        } catch (e) { console.error("Date parse error (weekly):", task.dueDate, e); }
                    });
                    labels.push(`W${format(weekStart, 'w')}`);
                    data.push(count);
                });
            } else { // Monthly
                const monthsToShow = 6;
                const startDate = startOfMonth(subMonths(now, monthsToShow - 1));
                const endDate = endOfMonth(now);
                const monthsInterval = eachMonthOfInterval({ start: startDate, end: endDate });
                monthsInterval.forEach(monthStart => {
                    const monthEnd = endOfMonth(monthStart);
                    const interval = { start: monthStart, end: monthEnd };
                    let count = 0;
                    completedTasks.forEach(task => {
                         try {
                            const [year, month, day] = task.dueDate.split('-').map(Number);
                            const taskDueDate = new Date(year, month - 1, day);
                            if (!isNaN(taskDueDate.getTime()) && isWithinInterval(taskDueDate, interval)) { count++; }
                        } catch (e) { console.error("Date parse error (monthly):", task.dueDate, e); }
                    });
                    labels.push(format(monthStart, 'MMM'));
                    data.push(count);
                });
            }
        } catch (error) {
             console.error("Error processing chart data:", error);
             return { labels: [], data: [] };
        }
        return { labels, data };
    }, [tasks, chartTimePeriod, format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachWeekOfInterval, eachMonthOfInterval, subWeeks, subMonths, isWithinInterval, parseISO]); // Add date-fns to dependencies


    return (
        <div className={styles.progressChartCard}>
            <div className={styles.chartHeader}>
                <h2>Completion Trend</h2>
                <div className={styles.chartTimeToggle}>
                    <button onClick={() => setChartTimePeriod('Weekly')} className={`${styles.toggleButton} ${chartTimePeriod === 'Weekly' ? styles.activeToggle : ''}`}>Weekly</button>
                    <button onClick={() => setChartTimePeriod('Monthly')} className={`${styles.toggleButton} ${chartTimePeriod === 'Monthly' ? styles.activeToggle : ''}`}>Monthly</button>
                </div>
            </div>
            <ProgressChart chartData={progressChartData} timePeriod={chartTimePeriod} />
        </div>
    );
}

export default ProgressPage;
