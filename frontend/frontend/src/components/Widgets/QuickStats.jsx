// src/components/Widgets/QuickStats.jsx
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'; // Import recharts components
import styles from '../Dashboards/Dashboard.module.css'; // Adjust path as needed

// Define colors for the bars (using CSS variables or fallbacks)
const COLORS = {
    completed: 'var(--success-color, #38a169)',
    pending: 'var(--warning-color, #dd6b20)',
    overdue: 'var(--danger-color, #e53e3e)',
};

function QuickStats({ tasks }) {
    // Calculate stats (keep the existing logic)
    const completed = useMemo(() => tasks.filter(t => t.completed).length, [tasks]);
    const pending = useMemo(() => tasks.filter(t => !t.completed && t.status !== 'Done').length, [tasks]);
    const overdue = useMemo(() => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        return tasks.filter(t =>
            !t.completed &&
            t.dueDate &&
            new Date(t.dueDate + 'T00:00:00') < now // Ensure consistent date parsing
        ).length;
    }, [tasks]);
    const totalTasks = useMemo(() => tasks.length, [tasks]); // Still useful for context maybe

    // Prepare data for the chart
    const chartData = useMemo(() => [
        { name: 'Completed', count: completed, fill: COLORS.completed },
        { name: 'Pending', count: pending, fill: COLORS.pending },
        { name: 'Overdue', count: overdue, fill: COLORS.overdue },
    ], [completed, pending, overdue]);

    // Placeholder for daily streaks - can be displayed separately if needed
    const dailyStreak = 0; // Replace with actual logic later

    return (
        <div className={styles.widgetCard}>
            {/* Keep the title, maybe add total tasks count here */}
            <h3>Quick Stats (Total: {totalTasks})</h3>

            {/* Replace the statsGrid with the chart */}
            <div className={styles.chartContainer}> {/* Add a container for sizing */}
                <ResponsiveContainer width="100%" height={200}> {/* Adjust height as needed */}
                    <BarChart
                        data={chartData}
                        margin={{
                            top: 5,
                            right: 5, // Reduced margin
                            left: -25, // Adjust left margin to show Y-axis labels if needed
                            bottom: 5,
                        }}
                        barGap={10} // Add gap between bars
                        barCategoryGap="20%" // Add gap between category groups (only one here)
                    >
                        <XAxis
                            dataKey="name"
                            tickLine={false}
                            axisLine={false}
                            fontSize={12}
                            dy={5} // Offset label down slightly
                        />
                        <YAxis
                            allowDecimals={false}
                            axisLine={false}
                            tickLine={false}
                            width={20} // Allocate space for Y-axis labels
                            fontSize={12}
                        />
                        <Tooltip
                            cursor={{ fill: 'rgba(237, 242, 247, 0.5)' }} // Use var(--button-secondary-hover-bg) with opacity
                            contentStyle={{
                                background: 'var(--card-bg, white)',
                                border: '1px solid var(--card-border, #e2e8f0)',
                                borderRadius: '8px',
                                fontSize: '12px',
                                boxShadow: '0 2px 5px var(--card-shadow, rgba(0,0,0,0.1))'
                            }}
                        />
                        {/* <Legend /> Optional: Add legend if needed */}
                        <Bar dataKey="count" radius={[4, 4, 0, 0]} > {/* Add slight radius to top of bars */}
                            {/* Apply colors to each bar */}
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* You can still display the streak separately if desired */}
            <div className={styles.streakDisplay}>
                 <span className={styles.statValue}>{dailyStreak} 🔥</span>
                 <span className={styles.statLabel}>Streak</span>
            </div>
        </div>
    );
}

// Update PropTypes if needed, tasks prop remains the same
QuickStats.propTypes = {
    tasks: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        title: PropTypes.string.isRequired,
        completed: PropTypes.bool,
        status: PropTypes.string,
        dueDate: PropTypes.string,
    })).isRequired,
};

export default QuickStats;
