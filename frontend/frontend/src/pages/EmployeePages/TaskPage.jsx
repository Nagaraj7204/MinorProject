// src/Pages/EmployeePages/TaskPage.jsx
import React, { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import TaskList from '../../components/TaskList/TaskList';
import TaskForm from '../../components/TaskForm/TaskForm';
import Modal from '../../components/Modal/Modal';
import styles from '../../components/Dashboards/Dashboard.module.css'; // Reuse styles

function TaskPage() {
    // --- Get shared data/functions from Layout ---
    const { tasks, addTask, updateTaskStatus, toggleTaskComplete, handleDeleteTask } = useOutletContext();

    // --- State specific to this page ---
    const [filters, setFilters] = useState({
        status: 'All',
        priority: 'All',
        sortBy: 'Priority',
        sortOrder: 'Descending',
    });
    const [isModalOpen, setIsModalOpen] = useState(false);

    // --- Event Handlers specific to this page ---
    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    // --- Modified Add Task to close modal ---
    const addTaskAndCloseModal = (newTask) => {
        addTask(newTask); // Call the function from the layout
        closeModal(); // Close the modal specific to this page
    };

    // --- Filtering/Sorting Logic (copied from EmployeeDashboard) ---
    const filteredAndSortedTasks = useMemo(() => {
        // Make sure parseISO is available if needed, or adjust date comparison
        // const { parseISO } = useOutletContext(); // Or import directly if preferred

        return [...tasks]
            .filter((task) => filters.status === 'All' || task.status === filters.status)
            .filter((task) => filters.priority === 'All' || task.priority === filters.priority)
            .sort((a, b) => {
                if (filters.sortBy === 'Priority') {
                    const priorityOrder = { High: 1, Medium: 2, Low: 3 };
                    const aPriority = priorityOrder[a.priority] || 4;
                    const bPriority = priorityOrder[b.priority] || 4;
                    return filters.sortOrder === 'Descending' ? aPriority - bPriority : bPriority - aPriority;
                } else if (filters.sortBy === 'DueDate') {
                    // Ensure parseISO is available or use new Date() carefully
                     try {
                        const dateA = a.dueDate ? new Date(a.dueDate.replace(/-/g, '/')) : null; // Try simple replace for broader compatibility
                        const dateB = b.dueDate ? new Date(b.dueDate.replace(/-/g, '/')) : null;

                        if (!dateA && !dateB) return 0;
                        if (!dateA) return 1;
                        if (!dateB) return -1;
                        if (isNaN(dateA.getTime()) && isNaN(dateB.getTime())) return 0;
                        if (isNaN(dateA.getTime())) return 1;
                        if (isNaN(dateB.getTime())) return -1;

                        return filters.sortOrder === 'Descending' ? dateB - dateA : dateA - dateB;
                     } catch (e) {
                         console.error("Date sorting error:", e);
                         return 0;
                     }
                }
                return 0;
            });
    }, [tasks, filters]);


    return (
        <>
            {/* Filters Section */}
            <div className={styles.filtersCard}>
                 <h2>Filter & Sort Tasks</h2>
                 <div className={styles.filterContainer}>
                    <div className={styles.filterGroup}>
                        <label htmlFor="status">Status:</label>
                        <select name="status" id="status" value={filters.status} onChange={handleFilterChange}>
                            <option value="All">All</option>
                            <option value="To Do">To Do</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Done">Done</option>
                        </select>
                    </div>
                    <div className={styles.filterGroup}>
                        <label htmlFor="priority">Priority:</label>
                        <select name="priority" id="priority" value={filters.priority} onChange={handleFilterChange}>
                            <option value="All">All</option>
                            <option value="High">High</option>
                            <option value="Medium">Medium</option>
                            <option value="Low">Low</option>
                        </select>
                    </div>
                    <div className={styles.filterGroup}>
                        <label htmlFor="sortBy">Sort by:</label>
                        <select name="sortBy" id="sortBy" value={filters.sortBy} onChange={handleFilterChange}>
                            <option value="Priority">Priority</option>
                            <option value="DueDate">Due Date</option>
                        </select>
                    </div>
                    <div className={styles.filterGroup}>
                        <label htmlFor="sortOrder">Order:</label>
                        <select name="sortOrder" id="sortOrder" value={filters.sortOrder} onChange={handleFilterChange}>
                            <option value="Descending">Descending</option>
                            <option value="Ascending">Ascending</option>
                        </select>
                    </div>
                 </div>
            </div>

            {/* Task List Section */}
            <div className={styles.taskListCard}>
                 <div className={styles.taskListHeader}>
                    <h2>Your Tasks</h2>
                    <button onClick={openModal} className={styles.addTaskButton}>+ Add New Task</button>
                </div>
                <TaskList
                    tasks={filteredAndSortedTasks}
                    updateTaskStatus={updateTaskStatus} // Pass down from layout
                    toggleTaskComplete={toggleTaskComplete} // Pass down from layout
                    deleteTask={handleDeleteTask} // Pass down from layout
                />
            </div>

             {/* Modal for Adding Tasks */}
             <Modal isOpen={isModalOpen} onClose={closeModal} title="Add New Work Task">
                <TaskForm addTask={addTaskAndCloseModal} />
            </Modal>
        </>
    );
}

export default TaskPage;
