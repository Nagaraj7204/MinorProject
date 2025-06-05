// src/components/ProgressChart/ProgressChart.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale, // x axis
    LinearScale, // y axis
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler // For area fill
} from 'chart.js';
import styles from './ProgressChart.module.css'; // We'll create this

// Register the necessary components with ChartJS
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

function ProgressChart({ chartData, timePeriod }) {
    if (!chartData || chartData.labels.length === 0) {
        return <p className={styles.noDataMessage}>Not enough data to display the {timePeriod.toLowerCase()} trend yet.</p>;
    }

    // Define chart options
    const options = {
        responsive: true,
        maintainAspectRatio: false, // Allow height control via CSS
        plugins: {
            legend: {
                display: false, // Hide legend if only one dataset
            },
            title: {
                display: false, // Title is handled outside the chart
            },
            tooltip: {
                mode: 'index',
                intersect: false,
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                titleFont: { size: 14 },
                bodyFont: { size: 12 },
                padding: 10,
                cornerRadius: 4,
            },
        },
        scales: {
            y: {
                beginAtZero: true, // Start y-axis at 0
                ticks: {
                    color: 'var(--text-secondary, #4a5568)',
                    font: { size: 11 },
                    // Ensure only whole numbers are shown for counts
                    precision: 0,
                },
                grid: {
                    color: 'var(--card-border, #e2e8f0)', // Lighter grid lines
                    drawBorder: false,
                },
            },
            x: {
                ticks: {
                    color: 'var(--text-secondary, #4a5568)',
                    font: { size: 11 },
                    maxRotation: 0, // Prevent label rotation if possible
                    autoSkip: true, // Automatically skip labels if too crowded
                    maxTicksLimit: timePeriod === 'Monthly' ? 6 : 8, // Limit ticks for clarity
                },
                grid: {
                    display: false, // Hide vertical grid lines
                },
            },
        },
        elements: {
            line: {
                tension: 0.3, // Slightly curve the line
            },
        },
    };

    // Define chart data structure
    const data = {
        labels: chartData.labels,
        datasets: [
            {
                label: 'Tasks Completed',
                data: chartData.data,
                borderColor: 'var(--accent-primary, #6B46C1)',
                backgroundColor: 'rgba(107, 70, 193, 0.2)', // Use accent color with transparency for area fill
                fill: true, // Fill area under the line
                borderWidth: 2,
                pointBackgroundColor: 'var(--accent-primary, #6B46C1)',
                pointRadius: 4,
                pointHoverRadius: 6,
            },
        ],
    };

    return (
        <div className={styles.chartContainer}>
            <Line options={options} data={data} />
        </div>
    );
}

ProgressChart.propTypes = {
    chartData: PropTypes.shape({
        labels: PropTypes.arrayOf(PropTypes.string).isRequired,
        data: PropTypes.arrayOf(PropTypes.number).isRequired,
    }),
    timePeriod: PropTypes.oneOf(['Weekly', 'Monthly']).isRequired,
};

export default ProgressChart;
