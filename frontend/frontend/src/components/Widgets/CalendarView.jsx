// src/components/Widgets/CalendarView.jsx
import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; // Import default react-calendar styles
import styles from '../Dashboards/Dashboard.module.css'; // Your dashboard styles
import './CalendarView.css'; // Custom styles for the calendar

function CalendarView({ tasks }) {
    const [date, setDate] = useState(new Date()); // State for the selected/active date

    // Memoize the set of dates that have tasks due
    const taskDueDates = useMemo(() => {
        const dates = new Set();
        tasks.forEach(task => {
            if (task.dueDate) {
                // Normalize the date to avoid timezone issues during comparison
                // Store as 'YYYY-MM-DD' string based on local timezone interpretation of dueDate
                try {
                    const dueDateObj = new Date(task.dueDate + 'T00:00:00'); // Assume dueDate is local date
                    if (!isNaN(dueDateObj)) {
                       const year = dueDateObj.getFullYear();
                       const month = (dueDateObj.getMonth() + 1).toString().padStart(2, '0');
                       const day = dueDateObj.getDate().toString().padStart(2, '0');
                       dates.add(`${year}-${month}-${day}`);
                    }
                } catch (e) {
                    console.error("Error parsing due date:", task.dueDate, e);
                }
            }
        });
        return dates;
    }, [tasks]);

    // Function to add custom content (like a dot) to dates with tasks
    const tileContent = ({ date, view }) => {
        // Only add markers in the month view
        if (view === 'month') {
            // Format the current tile date to 'YYYY-MM-DD' for comparison
            const year = date.getFullYear();
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            const dateString = `${year}-${month}-${day}`;

            if (taskDueDates.has(dateString)) {
                // Use the class from Dashboard.module.css via 'styles' import
                return <span className={styles.calendarTaskMarker}>●</span>;
            }
        }
        return null; // No marker otherwise
    };

    // Optional: Handle date click (e.g., show tasks for that day)
    const handleDateClick = (value) => {
        setDate(value);
        // Log tasks for the selected day
        const year = value.getFullYear();
        const month = (value.getMonth() + 1).toString().padStart(2, '0');
        const day = value.getDate().toString().padStart(2, '0');
        const dateString = `${year}-${month}-${day}`;

        const tasksForDay = tasks.filter(task => {
             if (!task.dueDate) return false;
             try {
                 const dueDateObj = new Date(task.dueDate + 'T00:00:00');
                 if (!isNaN(dueDateObj)) {
                    const taskYear = dueDateObj.getFullYear();
                    const taskMonth = (dueDateObj.getMonth() + 1).toString().padStart(2, '0');
                    const taskDay = dueDateObj.getDate().toString().padStart(2, '0');
                    return `${taskYear}-${taskMonth}-${taskDay}` === dateString;
                 }
             } catch (e) { return false; }
             return false;
        });
        console.log(`Tasks due on ${dateString}:`, tasksForDay);
        // You could display these tasks below the calendar or in a modal
    };

    return (
        <div className={styles.widgetCard}>
            <h3>Calendar</h3>
            <div className="calendarContainer"> {/* Use regular class for CalendarView.css */}
                <Calendar
                    onChange={handleDateClick} // Use handleDateClick for interaction
                    value={date}
                    tileContent={tileContent} // Add custom markers
                    locale="en-US" // Optional: Set locale
                />
            </div>
             {/* Optional: Add a section here to display tasks for the selected date */}
             {/* <div className={styles.selectedDateTasks}> ... </div> */}
        </div>
    );
}

CalendarView.propTypes = {
    tasks: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        title: PropTypes.string.isRequired,
        dueDate: PropTypes.string, // Expecting 'YYYY-MM-DD' or compatible string
    })).isRequired,
};

export default CalendarView;
