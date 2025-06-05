import React, { useState, useEffect, useMemo } from 'react';
import styles from './AdminUserManagement.module.css';
import {
  FaSearch, FaFilter, FaEdit, FaTrashAlt, FaUserSlash, FaUserCheck
} from 'react-icons/fa';

// Helper function to get auth token
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

const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [error, setError] = useState(null);
  // const [editingUser, setEditingUser] = useState(null); // For edit modal
  // const [showEditModal, setShowEditModal] = useState(false); // To control modal visibility

  const currentAuthUser = useMemo(() => {
    const userInfoString = localStorage.getItem('userInfo');
    if (userInfoString) {
      try {
        const userInfo = JSON.parse(userInfoString);
        return userInfo?.user; // Assuming 'user' object with '_id' is in 'userInfo'
      } catch (e) {
        console.error("Error parsing current user info from localStorage:", e);
        return null;
      }
    }
    return null;
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const apiUrl = '/api/admin/users';
        const token = getAuthToken();

        if (!token) {
          throw new Error('Authentication token not found. Please log in as admin.');
        }

        const response = await fetch(apiUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
          if (response.status === 401) throw new Error('Unauthorized: Invalid or expired token. Please log in again.');
          if (response.status === 403) throw new Error('Forbidden: You do not have permission to access this resource.');
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setUsers(data);
      } catch (err) {
        console.error("Failed to fetch users:", err);
        setError(err.message || "Failed to load users. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const nameMatch = user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase());
      const emailMatch = user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const usernameMatch = user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase());
      const searchMatch = nameMatch || emailMatch || usernameMatch;

      const roleMatch = filterRole === 'all' || user.role === filterRole;
      const statusMatch = filterStatus === 'all' || (user.status && user.status.toLowerCase() === filterStatus.toLowerCase());
      return searchMatch && roleMatch && statusMatch;
    });
  }, [users, searchTerm, filterRole, filterStatus]);

  // Generic update user function (can be expanded for other fields if a modal is used)
  const _updateUser = async (userId, updates, actionDescription) => {
    const userToEdit = users.find(u => u._id === userId);
    if (!userToEdit) return;

    if (window.confirm(`Are you sure you want to change ${userToEdit.name || userToEdit.username || userId}'s ${actionDescription}?`)) {
      try {
        const token = getAuthToken();
        if (!token) throw new Error('Admin token not found. Please log in.');

        const apiUrl = `/api/admin/users/${userId}`; // General update endpoint
        const response = await fetch(apiUrl, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updates),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: `Failed to update user's ${actionDescription}.` }));
          throw new Error(errorData.message || `Failed to update user's ${actionDescription}.`);
        }
        
        const updatedUserData = await response.json(); // Expecting the full updated user object or { user: { ... } }

        setUsers(prevUsers =>
          prevUsers.map(user =>
            user._id === userId ? { ...user, ...(updatedUserData.user || updatedUserData) } : user // Merge updates
          )
        );
        alert(`User's ${actionDescription} updated successfully.`);
      } catch (err) {
        console.error(`Error updating user's ${actionDescription}:`, err);
        alert(`Error: ${err.message}`);
      }
    }
  };

  const handleEditUser = (userId) => {
    const userToEdit = users.find(u => u._id === userId);
    if (!userToEdit) {
      alert("User not found.");
      return;
    }
    // TODO: Replace this prompt with a modal for a better UX
    const newRole = prompt(`Enter new role for ${userToEdit.name || userToEdit.username} (current: ${userToEdit.role}).\nAllowed roles: 'user', 'admin'`, userToEdit.role);

    if (newRole && (newRole === 'user' || newRole === 'admin')) {
      if (newRole === userToEdit.role) {
        alert("The new role is the same as the current role. No changes made.");
        return;
      }
      _updateUser(userId, { role: newRole }, `role to '${newRole}'`);
    } else if (newRole !== null) { // prompt returns null if cancelled
      alert("Invalid role entered or operation cancelled. Role must be 'user' or 'admin'.");
    }
  };

  const handleToggleBlockUser = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'blocked' ? 'active' : 'blocked';
    const action = newStatus === 'active' ? 'Unblock' : 'Block';
    const userToUpdate = users.find(u => u._id === userId);

    if (!userToUpdate) return;

    if (window.confirm(`Are you sure you want to ${action} user ${userToUpdate.name || userToUpdate.username || userId}?`)) {
      try {
        const apiUrl = `/api/admin/users/${userId}/status`;
        const token = getAuthToken();
        if (!token) throw new Error('Admin token not found.');

        const response = await fetch(apiUrl, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: newStatus }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: `Failed to ${action} user.` }));
          throw new Error(errorData.message || `Failed to ${action} user.`);
        }
        
        const updatedUserData = await response.json(); // Get updated user from response

        setUsers(prevUsers =>
          prevUsers.map(user =>
            user._id === userId ? { ...user, status: updatedUserData.user.status } : user // Use status from response
          )
        );
        alert(`User ${action}ed successfully.`);
      } catch (err) {
        console.error(`Error ${action}ing user:`, err);
        alert(`Error: ${err.message}`);
      }
    }
  };

  const handleDeleteUser = async (userId) => {
    const userToDelete = users.find(u => u._id === userId);
    if (!userToDelete) {
      alert("User not found.");
      return;
    }

    if (window.confirm(`Are you sure you want to permanently delete user ${userToDelete.name || userToDelete.username || userId}? This action is irreversible.`)) {
      try {
        const token = getAuthToken();
        if (!token) {
          throw new Error('Admin token not found. Please log in.');
        }

        const apiUrl = `/api/admin/users/${userId}`;
        const response = await fetch(apiUrl, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          let errorMessage = `Failed to delete user. Status: ${response.status}`;
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          } catch (e) {
            // JSON parsing failed, stick with the status-based message
          }
          throw new Error(errorMessage);
        }
        
        setUsers(prevUsers => prevUsers.filter(user => user._id !== userId));
        alert(`User ${userToDelete.name || userToDelete.username || userId} deleted successfully.`);
      } catch (err) {
        console.error(`Error deleting user:`, err);
        alert(`Error: ${err.message}`);
      }
    }
  };

  return (
    <div className={styles.userManagementContainer}>
      <h1 className={styles.pageTitle}>User Management</h1>

      <div className={styles.controlsContainer}>
        <div className={styles.searchBox}>
          <FaSearch className={styles.controlIcon} />
          <input
            type="text"
            placeholder="Search by name, email, or username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className={styles.filterGroup}>
          <div className={styles.filterBox}>
            <FaFilter className={styles.controlIcon} />
            <label htmlFor="roleFilter">Role:</label>
            <select
              id="roleFilter"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
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
               <option value="active">Active</option>
               <option value="blocked">Blocked</option>
               <option value="pending_deletion">Pending Deletion</option>
             </select>
          </div>
        </div>
      </div>

      <div className={styles.tableContainer}>
        {error && <p className={styles.errorMessage}>{error}</p>}
        {isLoading && !error && <p>Loading users...</p>}
        {!isLoading && !error && (
          <table className={styles.userTable}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Last Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map(user => (
                  <tr key={user._id}>
                    <td data-label="Name">{user.name || user.username || 'N/A'}</td>
                    <td data-label="Email">{user.email || 'N/A'}</td>
                    <td data-label="Role">
                      <span className={`${styles.tag} ${styles[String(user.role).toLowerCase()] || ''}`}>
                        {user.role || 'N/A'}
                      </span>
                    </td>
                    <td data-label="Status">
                      <span className={`${styles.tag} ${styles[String(user.status).toLowerCase()] || ''}`}>
                        {user.status ? user.status.replace('_', ' ') : 'N/A'}
                      </span>
                    </td>
                    <td data-label="Joined">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</td>
                    <td data-label="Last Active">{user.lastActive ? new Date(user.lastActive).toLocaleDateString() : 'N/A'}</td>
                    <td data-label="Actions" className={styles.actionButtonsCell}>
                      <div className={styles.actionButtons}>
                        <button
                          onClick={() => handleEditUser(user._id)}
                          className={`${styles.actionButton} ${styles.editButton}`}
                          title="Edit User"
                        >
                          <FaEdit /> <span className={styles.actionText}>Edit</span>
                        </button>
                        <button
                          onClick={() => handleToggleBlockUser(user._id, user.status)}
                          className={`${styles.actionButton} ${user.status === 'blocked' ? styles.unblockButton : styles.blockButton}`}
                          title={user.status === 'blocked' ? 'Unblock User' : 'Block User'}
                          disabled={user.role === 'admin' && user._id === currentAuthUser?._id} // Disable blocking self if admin
                        >
                          {user.status === 'blocked' ? <FaUserCheck /> : <FaUserSlash />}
                          <span className={styles.actionText}>{user.status === 'blocked' ? 'Unblock' : 'Block'}</span>
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className={`${styles.actionButton} ${styles.deleteButton}`}
                          title="Delete User"
                          disabled={user.role === 'admin' && user._id === currentAuthUser?._id} // Disable deleting self if admin
                        >
                          <FaTrashAlt /> <span className={styles.actionText}>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className={styles.noResults}>
                    No users found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminUserManagement;
