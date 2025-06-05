// src/components/AdminTaskManagement/AdminTaskManagement.jsx
import React, { useState, useEffect, useMemo } from 'react';
import styles from './AdminTaskManagement.module.css';
import {
  FaSearch, FaFilter, FaTrashAlt, FaCheckSquare, FaCalendarAlt
} from 'react-icons/fa';

// Helper function to get auth token (similar to AdminUserManagement)
const getAuthToken = () => {
  const userInfoString = localStorage.getItem('userInfo');
  if (userInfoString) {
    try {
      const userInfo = JSON.parse(userInfoString);
      return userInfo?.token || null;
    } catch (e) {
      console.error("Error parsing userInfo from localStorage:", e);
      return null;
    }
  }
  return null;
};

// Helper to get unique users for filter dropdown
const getUniqueUsers = (tasks) => {
    // Expects tasks to have a 'user' object with '_id' and 'name' or 'username'
    const users = tasks.map(task => ({
        id: task.user?._id,
        name: task.user?.name || task.user?.username || 'Unknown User'
    })).filter(user => user.id); // Filter out tasks with no user

    const uniqueUsers = [];
    const map = new Map();
    for (const user of users) {
        if(user.id && !map.has(user.id)){
            map.set(user.id, true);
            uniqueUsers.push({
                id: user.id,
                name: user.name
            });
        }
    }
    return uniqueUsers.sort((a, b) => a.name.localeCompare(b.name));
}


const AdminTaskManagement = () => {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUser, setFilterUser] = useState('all'); // User ID
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'pending', 'completed'
  const [filterDueDateStart, setFilterDueDateStart] = useState('');
  const [filterDueDateEnd, setFilterDueDateEnd] = useState('');
  const [uniqueUserList, setUniqueUserList] = useState([]);

  useEffect(() => {
    const fetchTasks = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const token = getAuthToken();
        if (!token) {
          throw new Error('Authentication token not found. Please log in as admin.');
        }

        const response = await fetch('/api/admin/tasks', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
          throw new Error(errorData.message || `Failed to fetch tasks. Status: ${response.status}`);
        }

        const data = await response.json();
        // Transform data to fit frontend structure if necessary
        const transformedTasks = data.map(task => ({
          id: task._id,
          title: task.title,
          assignedUser: task.user ? (task.user.name || task.user.username) : 'N/A',
          userId: task.user ? task.user._id : null,
          status: task.completed ? 'completed' : 'pending',
          dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : null, // Format for date input
          createdAt: task.createdAt,
          description: task.description, // Assuming description might be there
          user: task.user // Keep the user object for filtering
        }));
        setTasks(transformedTasks);
        setUniqueUserList(getUniqueUsers(transformedTasks));
      } catch (err) {
        console.error("Failed to fetch tasks:", err);
        setError(err.message || "Failed to load tasks. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const searchMatch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
      const userMatch = filterUser === 'all' || task.userId === filterUser;
      const statusMatch = filterStatus === 'all' || task.status === filterStatus;

      let dateMatch = true;
      if (filterDueDateStart && task.dueDate) {
        dateMatch = dateMatch && (new Date(task.dueDate) >= new Date(filterDueDateStart));
      }
      if (filterDueDateEnd && task.dueDate) {
         const endDate = new Date(filterDueDateEnd);
         endDate.setDate(endDate.getDate() + 1);
         dateMatch = dateMatch && (new Date(task.dueDate) < endDate);
      }
       if ((filterDueDateStart || filterDueDateEnd) && !task.dueDate) {
           dateMatch = false;
       }
      return searchMatch && userMatch && statusMatch && dateMatch;
    });
  }, [tasks, searchTerm, filterUser, filterStatus, filterDueDateStart, filterDueDateEnd]);

  const handleUpdateTaskStatus = async (taskId, newStatusBoolean) => {
    const taskToUpdate = tasks.find(t => t.id === taskId);
    if (!taskToUpdate) return;

    const action = newStatusBoolean ? 'complete' : 'pending';
    if (window.confirm(`Are you sure you want to mark task "${taskToUpdate.title}" as ${action}?`)) {
      try {
        const token = getAuthToken();
        if (!token) throw new Error('Admin token not found.');

        const response = await fetch(`/api/admin/tasks/${taskId}/status`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ completed: newStatusBoolean }), // Send 'completed' boolean
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: `Failed to update task status.` }));
          throw new Error(errorData.message || `Failed to update task status.`);
        }
        
        const updatedTaskData = await response.json(); // Expecting { task: { ... } }

        setTasks(prevTasks =>
          prevTasks.map(t =>
            t.id === taskId ? { ...t, status: updatedTaskData.task.completed ? 'completed' : 'pending' } : t
          )
        );
        alert(`Task marked as ${action} successfully.`);
      } catch (err) {
        console.error(`Error updating task status:`, err);
        alert(`Error: ${err.message}`);
      }
    }
  };

  const handleDeleteTask = async (taskId) => {
    const taskToDelete = tasks.find(t => t.id === taskId);
    if (!taskToDelete) return;

    if (window.confirm(`Are you sure you want to delete task "${taskToDelete.title}"? This action is irreversible.`)) {
      try {
        const token = getAuthToken();
        if (!token) throw new Error('Admin token not found.');

        const response = await fetch(`/api/admin/tasks/${taskId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: `Failed to delete task.` }));
          throw new Error(errorData.message || `Failed to delete task.`);
        }
        
        setTasks(prevTasks => prevTasks.filter(t => t.id !== taskId));
        alert(`Task "${taskToDelete.title}" deleted successfully.`);
      } catch (err) {
        console.error(`Error deleting task:`, err);
        alert(`Error: ${err.message}`);
      }
    }
  };

  return (
    <div className={styles.taskManagementContainer}>
      <h1 className={styles.pageTitle}>Task Management (All Users)</h1>
      {error && <p className={styles.errorMessage}>{error}</p>}

      <div className={styles.controlsContainer}>
        <div className={styles.searchBox}>
          <FaSearch className={styles.controlIcon} />
          <input
            type="text"
            placeholder="Search by task title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className={styles.filterGroup}>
          <div className={styles.filterBox}>
            <FaFilter className={styles.controlIcon} />
            <label htmlFor="userFilter">User:</label>
            <select
              id="userFilter"
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
            >
              <option value="all">All Users</option>
              {uniqueUserList.map(user => (
                  <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
          </div>
          <div className={styles.filterBox}>
             <FaFilter className={styles.controlIcon} />
             <label htmlFor="statusFilter">Status:</label>
             <select
               id="statusFilter"
               value={filterStatus}
               onChange={(e) => setFilterStatus(e.target.value)}
             >
               <option value="all">All Statuses</option>
               <option value="pending">Pending</option>
               <option value="completed">Completed</option>
             </select>
          </div>
           <div className={styles.filterBox}>
             <FaCalendarAlt className={styles.controlIcon} />
             <label htmlFor="dueDateStart">Due From:</label>
             <input
                type="date"
                id="dueDateStart"
                value={filterDueDateStart}
                onChange={(e) => setFilterDueDateStart(e.target.value)}
                className={styles.dateInput}
             />
           </div>
            <div className={styles.filterBox}>
             <FaCalendarAlt className={styles.controlIcon} />
             <label htmlFor="dueDateEnd">Due To:</label>
             <input
                type="date"
                id="dueDateEnd"
                value={filterDueDateEnd}
                onChange={(e) => setFilterDueDateEnd(e.target.value)}
                className={styles.dateInput}
             />
           </div>
        </div>
      </div>

      <div className={styles.tableContainer}>
        {isLoading ? (
          <p>Loading tasks...</p>
        ) : !error && tasks.length === 0 && !isLoading ? (
          <p className={styles.noResults}>No tasks found.</p>
        ) : !error ? (
          <table className={styles.taskTable}>
            <thead>
              <tr>
                <th>Title</th>
                <th>Assigned User</th>
                <th>Status</th>
                <th>Due Date</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.length > 0 ? (
                filteredTasks.map(task => (
                  <tr key={task.id}>
                    <td data-label="Title">{task.title}</td>
                    <td data-label="Assigned User">{task.assignedUser}</td>
                    <td data-label="Status">
                      <span className={`${styles.tag} ${styles[task.status]}`}>
                        {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                      </span>
                    </td>
                    <td data-label="Due Date">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}</td>
                    <td data-label="Created At">{task.createdAt ? new Date(task.createdAt).toLocaleDateString() : 'N/A'}</td>
                    <td data-label="Actions" className={styles.actionButtonsCell}>
                      <div className={styles.actionButtons}>
                        {task.status === 'pending' && (
                            <button
                            onClick={() => handleUpdateTaskStatus(task.id, true)} // Mark as complete
                            className={`${styles.actionButton} ${styles.completeButton}`}
                            title="Mark as Completed"
                            >
                            <FaCheckSquare /> <span className={styles.actionText}>Complete</span>
                            </button>
                        )}
                         {task.status === 'completed' && ( // Option to mark as pending again
                            <button
                            onClick={() => handleUpdateTaskStatus(task.id, false)} // Mark as pending
                            className={`${styles.actionButton} ${styles.pendingButton}`} // Add a style for this
                            title="Mark as Pending"
                            >
                            <FaCheckSquare /> <span className={styles.actionText}>Pend</span>
                            </button>
                        )}
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className={`${styles.actionButton} ${styles.deleteButton}`}
                          title="Delete Task"
                        >
                          <FaTrashAlt /> <span className={styles.actionText}>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className={styles.noResults}>
                    No tasks found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        ) : null}
      </div>
    </div>
  );
};

export default AdminTaskManagement;
