// src/components/AdminLeaderboard/AdminLeaderboard.jsx
import React, { useState, useEffect, useMemo } from 'react';
import styles from './AdminLeaderboard.module.css'; // Create this CSS module
import { FaTrophy, FaSyncAlt, FaPlusCircle, FaSearch } from 'react-icons/fa';

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

const AdminLeaderboard = () => {
  // --- State ---
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  // State for adjusting points (example: could be a modal's state)
  const [adjustingUser, setAdjustingUser] = useState(null); // { userId, name, currentPoints }
  const [pointsToAdd, setPointsToAdd] = useState(0);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const token = getAuthToken();
        if (!token) {
          throw new Error('Authentication token not found. Please log in as admin.');
        }
        const response = await fetch('/api/admin/leaderboard', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
          throw new Error(errorData.message || `Failed to fetch leaderboard. Status: ${response.status}`);
        }
        const data = await response.json();
        // Assuming backend sends data with _id, name, points, level
        const formattedData = data.map(user => ({ ...user, userId: user._id }));
        setLeaderboard(formattedData); // Already sorted by backend
      } catch (err) {
        console.error("Failed to fetch leaderboard:", err);
        setError(err.message || "Failed to load leaderboard. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  // --- Filtering Logic ---
  const filteredLeaderboard = useMemo(() => {
    return leaderboard.filter(user =>
      (user.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (user.username?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );
  }, [leaderboard, searchTerm]);

  // --- Action Handlers ---
  const handleResetAllPoints = async () => {
    if (window.confirm('ARE YOU SURE you want to reset points for ALL users? This cannot be undone easily.')) {
      setIsLoading(true); // Indicate loading state for this action
      setError(null);
      try {
        const token = getAuthToken();
        if (!token) throw new Error('Admin token not found.');

        const response = await fetch('/api/admin/leaderboard/reset-all', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Failed to reset points.' }));
          throw new Error(errorData.message || 'Failed to reset points.');
        }
        
        // Refetch or update local state based on response
        // For simplicity, refetching:
        const fetchLeaderboardAgain = async () => {
            const res = await fetch('/api/admin/leaderboard', { headers: { 'Authorization': `Bearer ${token}` }});
            if (!res.ok) { // Check if refetch was successful
                const errorData = await res.json().catch(() => ({ message: `HTTP error! status: ${res.status}` }));
                throw new Error(errorData.message || `Failed to refetch leaderboard. Status: ${res.status}`);
            }
            const data = await res.json();
            const formattedData = data.map(user => ({ ...user, userId: user._id }));
            setLeaderboard(formattedData);
        };
        await fetchLeaderboardAgain();
        alert('All user points have been reset successfully.');

      } catch (err) {
        console.error('Error resetting all points:', err);
        setError(err.message);
        alert(`Error: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const openAdjustModal = (user) => {
    setAdjustingUser({ userId: user.userId, name: user.name || user.username, currentPoints: user.points });
    setPointsToAdd(0); // Reset points input
  };

  const handleAdjustPoints = async (e) => {
      e.preventDefault(); // Prevent form submission if it's in a form
      if (!adjustingUser) return;
      const pointsValue = parseInt(pointsToAdd, 10);
      if (isNaN(pointsValue)) {
          alert("Please enter a valid number for points.");
          return;
      }
      try {
        const token = getAuthToken();
        if (!token) throw new Error('Admin token not found.');

        const response = await fetch(`/api/admin/leaderboard/${adjustingUser.userId}/adjust-points`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ points: pointsValue }), // Send points to add/subtract
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Failed to adjust points.' }));
          throw new Error(errorData.message || 'Failed to adjust points.');
        }
        const updatedUser = await response.json(); // Expecting the updated user object
        setLeaderboard(prev => prev.map(u => u.userId === updatedUser._id ? { ...updatedUser, userId: updatedUser._id } : u).sort((a,b) => b.points - a.points));
        alert(`Points for ${adjustingUser.name} adjusted successfully.`);
        setAdjustingUser(null);
      } catch (err) {
        console.error(`Error adjusting points for ${adjustingUser.name}:`, err);
        alert(`Error: ${err.message}`);
      }
  };


  return (
    <div className={styles.leaderboardContainer}>
      <h1 className={styles.pageTitle}><FaTrophy /> Leaderboard Management</h1>
      {error && <p className={styles.errorMessage}>{error}</p>}

      {/* Controls: Search and Reset */}
      <div className={styles.controlsContainer}>
        <div className={styles.searchBox}>
          <FaSearch className={styles.controlIcon} />
          <input
            type="text"
            placeholder="Search by user name or username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          onClick={handleResetAllPoints}
          className={`${styles.actionButton} ${styles.resetButton}`}
          title="Reset All User Points"
          disabled={isLoading} // Disable button while an action is loading
        >
          <FaSyncAlt /> Reset All Points
        </button>
      </div>

      {/* Leaderboard Table */}
      <div className={styles.tableContainer}>
        {isLoading && leaderboard.length === 0 ? ( // Show loading only if no data yet
          <p className={styles.loadingText}>Loading leaderboard...</p>
        ) : !error && leaderboard.length === 0 && !isLoading ? (
          <p className={styles.noResults}>No users found on the leaderboard.</p>
        ) : !error && filteredLeaderboard.length === 0 && searchTerm ? (
          <p className={styles.noResults}>No users found matching your search.</p>
        ) : !error ? (
          <table className={styles.leaderboardTable}>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Name</th>
                <th>Points</th>
                <th>Level</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeaderboard.map((user, index) => (
                  <tr key={user.userId}>
                    <td data-label="Rank">{index + 1}</td>
                    <td data-label="Name">{user.name || user.username}</td>
                    <td data-label="Points">{user.points.toLocaleString()}</td>
                    <td data-label="Level">{user.level || 'N/A'}</td>
                    <td data-label="Actions" className={styles.actionButtonsCell}>
                      <div className={styles.actionButtons}>
                        <button
                          onClick={() => openAdjustModal(user)}
                          className={`${styles.actionButton} ${styles.adjustButton}`}
                          title="Adjust/Add Bonus Points"
                        >
                          <FaPlusCircle /> <span className={styles.actionText}>Adjust Points</span>
                        </button>
                        {/* Add other user-specific actions if needed */}
                      </div>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        ) : null /* Error is handled by the error paragraph above */}
      </div>

      {/* --- Simple "Modal" for Adjusting Points (Replace with a proper modal component later) --- */}
      {adjustingUser && (
        <div className={styles.adjustModalOverlay}>
          <div className={styles.adjustModal}>
            <h3>Adjust Points for {adjustingUser.name}</h3>
            <p>Current Points: {adjustingUser.currentPoints.toLocaleString()}</p>
            <form onSubmit={handleAdjustPoints}>
              <label htmlFor="pointsToAdd">Points to Add/Subtract:</label>
              <input
                type="number"
                id="pointsToAdd"
                value={pointsToAdd}
                onChange={(e) => setPointsToAdd(e.target.value)}
                placeholder="e.g., 50 or -20"
                required
                className={styles.modalInput}
              />
              <div className={styles.modalActions}>
                <button type="submit" className={`${styles.actionButton} ${styles.saveButton}`}>Save Adjustment</button>
                <button type="button" onClick={() => setAdjustingUser(null)} className={`${styles.actionButton} ${styles.cancelButton}`}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* --- End Adjust Points Modal --- */}

    </div>
  );
};

export default AdminLeaderboard;
