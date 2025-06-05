// src/pages/TaskListPage.jsx
import React, { useState, useEffect } from 'react'; // Removed useMemo as it wasn't used

// --- Corrected Imports ---
import TaskList from '../components/TaskList/TaskList.jsx'; // Check this path is correct
import TaskForm from '../components/TaskForm/TaskForm.jsx'; // Check this path is correct
import Modal from '../components/Modal/Modal.jsx';       // Check this path is correct
import styles from './TaskListPage.module.css';         // Should be in the same 'pages' folder
import dashboardStyles from '../components/Dashboards/Dashboard.module.css'; // Check this path is correct
import { FiPlus } from 'react-icons/fi';

// Helper function to get initial tasks (same as in StudentDashboard)
const getInitialTasks = () => {
    const savedTasks = localStorage.getItem('workopolyTasks');
    try {
        const parsedTasks = savedTasks ? JSON.parse(savedTasks) : [];
        if (!Array.isArray(parsedTasks) || parsedTasks.length === 0) {
            // Provide default tasks ONLY if localStorage is empty/invalid
            return [
                { id: 1, title: "Finish Math Homework", description: "Chapter 3 problems", dueDate: "2024-08-15", priority: "High", status: "To Do", completed: false },
                { id: 8, title: "Review Lecture Notes", description: "Physics", dueDate: new Date(Date.now() - 86400000).toISOString().split('T')[0], priority: "High", status: "To Do", completed: false },
                { id: 9, title: "Submit English Essay", description: "Draft 1", dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], priority: "Medium", status: "To Do", completed: false },
                { id: 10, title: "Prepare for Quiz", description: "History Ch 5", dueDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0], priority: "Low", status: "Done", completed: true },
                { id: 11, title: "Schedule Study Group", description: "For Chemistry", dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0], priority: "Medium", status: "To Do", completed: false },
            ];
        }
        // Ensure tasks have necessary fields
        return parsedTasks.map(task => ({
            ...task,
            status: task.status || 'To Do',
            completed: task.completed !== undefined ? task.completed : (task.status === 'Done')
        }));
    } catch (e) {
        console.error("Failed to parse tasks from localStorage for TaskListPage", e);
        return []; // Return empty on error
    }
};

function TaskListPage() {
    const [tasks, setTasks] = useState(getInitialTasks);
    const [isModalOpen, setIsModalOpen] = useState(false);
    // Add state for filters if needed later
    // const [statusFilter, setStatusFilter] = useState('All');
    // const [priorityFilter, setPriorityFilter] = useState('All');

    // Effect to save tasks to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('workopolyTasks', JSON.stringify(tasks));
        // Optional: Dispatch event if other components need to know
        window.dispatchEvent(new CustomEvent('tasksUpdated'));
    }, [tasks]);

    // Effect to listen for external storage changes (e.g., from other tabs)
     useEffect(() => {
        const handleStorageChange = (event) => {
            // Check if the change was to our 'workopolyTasks' key
            if (event.key === 'workopolyTasks') {
                 console.log("Storage changed externally, reloading tasks for TaskListPage.");
                 setTasks(getInitialTasks()); // Reload tasks from storage
            }
        };

        const handleLocalUpdate = () => {
            console.log("Internal task update detected, reloading tasks for TaskListPage.");
            setTasks(getInitialTasks());
        };


        window.addEventListener('storage', handleStorageChange);
        // Also listen for the custom event dispatched within the app
        window.addEventListener('tasksUpdated', handleLocalUpdate);


        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('tasksUpdated', handleLocalUpdate);
        };
    }, []); // Run only once on mount


    // --- Modal Handlers ---
    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);

    // --- Task CRUD Handlers ---
    const handleAddTask = (newTaskData) => {
        const newTask = {
            ...newTaskData,
            id: Date.now(), // Simple unique ID
            status: 'To Do',
            completed: false,
        };
        // Use functional update to ensure we have the latest state
        setTasks(prevTasks => [...prevTasks, newTask]);
        handleCloseModal(); // Close modal after adding
    };

    const updateTaskStatus = (taskToUpdate, newStatus) => {
        setTasks(prevTasks =>
            prevTasks.map(task =>
                task.id === taskToUpdate.id
                    ? {
                        ...task,
                        status: newStatus,
                        // Also mark as completed if status is 'Done', or incomplete otherwise
                        completed: newStatus === 'Done'
                      }
                    : task
            )
        );
    };

     const toggleTaskComplete = (taskToToggle, isChecked) => {
        setTasks(prevTasks =>
            prevTasks.map(task =>
                task.id === taskToToggle.id
                    ? {
                        ...task,
                        completed: isChecked,
                        // Optionally update status if completing/uncompleting
                        status: isChecked ? 'Done' : (task.status === 'Done' ? 'To Do' : task.status)
                      }
                    : task
            )
        );
    };

    const deleteTask = (taskToDelete) => {
        if (window.confirm(`Are you sure you want to delete the task "${taskToDelete.title}"?`)) {
            setTasks(prevTasks => prevTasks.filter(task => task.id !== taskToDelete.id));
        }
    };

    // --- Filtering Logic (Example - can be expanded) ---
    // const filteredTasks = useMemo(() => {
    //     return tasks.filter(task => {
    //         const statusMatch = statusFilter === 'All' || task.status === statusFilter;
    //         const priorityMatch = priorityFilter === 'All' || task.priority === priorityFilter;
    //         return statusMatch && priorityMatch;
    //     });
    // }, [tasks, statusFilter, priorityFilter]);

    return (
        // Use a container class from the page's CSS module
        <div className={styles.taskListPageContainer}>

            {/* Page Header Area */}
            <div className={styles.headerArea}>
                 <h1 className={styles.pageTitle}>Task List</h1>
                 <button onClick={handleOpenModal} className={dashboardStyles.addTaskButton}> {/* Reuse dashboard button style */}
                    <FiPlus style={{ marginRight: '8px' }} /> Add New Task
                </button>
            </div>

            {/* Optional Filters Section */}
            {/*
            <div className={`${dashboardStyles.card} ${styles.filtersCard}`}> // Reuse card style
                <h2 className={dashboardStyles.cardTitle}>Filters</h2> // Reuse card title style
                <div className={styles.filterContainer}>
                    <div className={styles.filterGroup}>
                        <label htmlFor="statusFilter">Status</label>
                        <select id="statusFilter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                            <option value="All">All</option>
                            <option value="To Do">To Do</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Done">Done</option>
                        </select>
                    </div>
                    <div className={styles.filterGroup}>
                        <label htmlFor="priorityFilter">Priority</label>
                        <select id="priorityFilter" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
                            <option value="All">All</option>
                            <option value="High">High</option>
                            <option value="Medium">Medium</option>
                            <option value="Low">Low</option>
                        </select>
                    </div>
                </div>
            </div>
            */}

            {/* Task List Display */}
            {/* Pass the necessary functions and the (filtered) tasks array */}
            <TaskList
                tasks={tasks} // Use 'tasks' directly, or 'filteredTasks' if using filters
                updateTaskStatus={updateTaskStatus}
                toggleTaskComplete={toggleTaskComplete}
                deleteTask={deleteTask}
            />

            {/* Add Task Modal */}
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Add New Task">
                <TaskForm addTask={handleAddTask} />
            </Modal>
        </div>
    );
}

export default TaskListPage;

