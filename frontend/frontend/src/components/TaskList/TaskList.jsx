// c:/Users/misba/OneDrive/Documents/workopoly1_proj/frontend/src/components/TaskList/TaskListPage.jsx
import React, { useState, useEffect } from 'react';
import { FaTrashAlt, FaPlus } from 'react-icons/fa';
import styles from './TaskList.module.css';
import { fetchTasks, createTask, updateTask, deleteTask } from '../../api/taskApi';
import { format } from 'date-fns';
import { useAuth } from '../../context/AuthContext';

const TaskListPage = () => {
    const [tasks, setTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showTaskForm, setShowTaskForm] = useState(false);
    const [pointsAnimation, setPointsAnimation] = useState({ taskId: null, active: false });

    const { user: authUser, isAuthLoading: isAuthContextLoading } = useAuth();

    useEffect(() => {
        const loadInitialData = async () => {
            if (!authUser) {
                setTasks([]);
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                const fetchedTasks = await fetchTasks();
                setTasks(fetchedTasks || []);
            } catch (err) {
                setError(err.message || 'Failed to load data.');
            } finally {
                setIsLoading(false);
            }
        };

        if (!isAuthContextLoading) {
            loadInitialData();
        }
    }, [authUser, isAuthContextLoading]);

    const handleAddTask = async (newTaskData) => {
        setShowTaskForm(false);
        try {
            const addedTask = await createTask(newTaskData);
            setTasks(prevTasks => [addedTask, ...prevTasks]);
        } catch (err) {
            setError(err.message || 'Failed to add task.');
            setShowTaskForm(true);
        }
    };

    const handleToggleComplete = async (taskId) => {
        const taskToToggle = tasks.find(task => task._id === taskId);
        if (!taskToToggle) return;

        const updateData = { completed: !taskToToggle.completed };
        const wasCompleted = !taskToToggle.completed;

        try {
            const updatedTask = await updateTask(taskId, updateData);
            setTasks(prevTasks => prevTasks.map(task => (task._id === taskId ? updatedTask : task)));
            if (wasCompleted) {
                setPointsAnimation({ taskId: taskId, active: true });
                setTimeout(() => setPointsAnimation({ taskId: null, active: false }), 1500);
            }
        } catch (err) {
            setError(err.message || 'Failed to update task status.');
        }
    };

    const handleDeleteTask = async (taskId) => {
        if (window.confirm("Are you sure you want to delete this task?")) {
            try {
                await deleteTask(taskId);
                setTasks(prevTasks => prevTasks.filter(task => task._id !== taskId));
            } catch (err) {
                setError(err.message || 'Failed to delete task.');
            }
        }
    };

    const TaskForm = ({ onAddTask, onCancel }) => {
        const [title, setTitle] = useState('');
        const [description, setDescription] = useState('');
        const [dueDate, setDueDate] = useState('');
        const [priority, setPriority] = useState('Medium');

        const handleSubmit = (e) => {
            e.preventDefault();
            if (!title.trim()) {
                alert('Task title is required!');
                return;
            }
            const newTaskData = {
                title,
                description,
                dueDate: dueDate || null,
                priority,
                completed: false
            };
            onAddTask(newTaskData);
        };

        return (
            <div className={styles.taskFormModal}>
                <form onSubmit={handleSubmit}>
                    <h3>Add New Task</h3>
                    <div className={styles.formGroup}>
                        <label htmlFor="task-title">Title *</label>
                        <input type="text" id="task-title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="task-description">Description</label>
                        <textarea id="task-description" value={description} onChange={(e) => setDescription(e.target.value)} />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="task-dueDate">Due Date</label>
                        <input type="date" id="task-dueDate" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="task-priority">Priority</label>
                        <select id="task-priority" value={priority} onChange={(e) => setPriority(e.target.value)}>
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                        </select>
                    </div>
                    <div className={styles.formActions}>
                        <button type="submit" className={styles.buttonPrimary}>Save Task</button>
                        <button type="button" onClick={onCancel} className={styles.buttonSecondary}>Cancel</button>
                    </div>
                </form>
            </div>
        );
    };

    return (
        <div className={styles.taskListpage}>
            <header className={styles.taskListHeader}>
                <h1>My Tasks</h1>
                <button onClick={() => setShowTaskForm(true)} className={styles.addTaskButton}>
                    <FaPlus style={{ marginRight: '8px' }} /> Add Task
                </button>
            </header>

            {showTaskForm && (
                <TaskForm onAddTask={handleAddTask} onCancel={() => setShowTaskForm(false)} />
            )}

            {isLoading && <p>Loading tasks...</p>}
            {error && !isLoading && <p className={styles.errorMessage}>Error: {error}</p>}

            {!isLoading && !error && (
                <div className={styles.taskListContainer}>
                    {tasks.length === 0 ? (
                        <p>No tasks found. Add one to get started!</p>
                    ) : (
                        tasks.map(task => {
                            // Determine if the user is eligible to see priority colors
                            const canSeePriorityColors = authUser && (authUser.tier === 'silver' || authUser.tier === 'gold' || authUser.tier === 'diamond');
                            let borderColor = 'transparent'; // Default border color for users without silver+ tier or if no priority matches

                            if (canSeePriorityColors) {
                                if (task.priority === 'High') {
                                    borderColor = '#d9534f'; // Red
                                } else if (task.priority === 'Medium') {
                                    borderColor = '#f0ad4e'; // Yellow
                                } else if (task.priority === 'Low') {
                                    borderColor = '#5cb85c'; // Green
                                }
                            }

                            return (
                                <div
                                    key={task._id}
                                    className={`${styles.taskItem} ${task.completed ? styles.completed : ''}`}
                                    style={{ borderLeft: `5px solid ${borderColor}` }}
                                >
                                <div className={styles.taskInfo}>
                                    <input
                                        type="checkbox"
                                        checked={task.completed}
                                        onChange={() => handleToggleComplete(task._id)}
                                        title={task.completed ? "Mark as Incomplete" : "Mark as Complete"}
                                    />
                                    <div className={styles.taskDetails}>
                                        <span className={styles.taskTitle}>{task.title}</span>
                                        {task.description && <p className={styles.taskDescription}>{task.description}</p>}
                                    </div>
                                </div>
                                <div className={styles.taskMeta}>
                                    {task.dueDate && (
                                        <span className={styles.taskDueDate}>
                                            Due: {format(new Date(task.dueDate), 'MMM dd, yyyy')}
                                        </span>
                                    )}
                                </div>
                                <div className={styles.taskActions}>
                                    {pointsAnimation.active && pointsAnimation.taskId === task._id && (
                                        <span className={styles.pointsAnimation}>+10 pts! ✨</span>
                                    )}
                                    <button onClick={() => handleDeleteTask(task._id)} className={styles.deleteButton} title="Delete Task"><FaTrashAlt /></button>
                                </div>
                            </div>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
 };

export default TaskListPage;
