// src/components/AdminSupport/AdminSupport.jsx
import React, { useState, useEffect } from 'react';
import styles from './AdminSupport.module.css';
import { FaBug, FaEnvelope, FaReply, FaSave, FaTimes, FaSyncAlt } from 'react-icons/fa';

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

const AdminSupport = () => {
    const [feedbackItems, setFeedbackItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [replyingTo, setReplyingTo] = useState(null); // The ID of the item being replied to
    const [replyText, setReplyText] = useState('');
    const [filter, setFilter] = useState('open'); // 'open', 'in-progress', 'closed', 'all'
    const [error, setError] = useState(null);

    // --- Fetch Data ---
    const fetchFeedback = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const token = getAuthToken();
            if (!token) throw new Error("Admin token not found. Please log in.");

            const response = await fetch('/api/admin/feedback', { // API endpoint for admin to get feedback
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                const errData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
                throw new Error(errData.message || `Failed to fetch feedback. Status: ${response.status}`);
            }
            const data = await response.json();
             // Transform data if necessary (e.g., _id to id, user object)
            const transformedData = data.map(item => ({
                ...item,
                id: item._id,
                submittedBy: item.user ? (item.user.name || item.user.username) : 'Unknown User',
                userId: item.user ? item.user._id : 'N/A',
                timestamp: new Date(item.createdAt) // Assuming 'createdAt' from backend
            }));
            setFeedbackItems(transformedData.sort((a, b) => b.timestamp - a.timestamp));
        } catch (err) {
            console.error("Failed to fetch feedback:", err);
            setError(err.message || "Failed to load feedback. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchFeedback();
    }, []);

    // --- Filter Logic ---
    const filteredItems = feedbackItems.filter(item => {
        if (filter === 'all') return true;
        // if (filter === 'in-progress') return item.status === 'in-progress'; // This is covered by the next line
        return item.status === filter; // 'open', 'in-progress', or 'closed'
    });

    // --- Action Handlers ---
    const handleStartReply = (itemId) => {
        setReplyingTo(itemId);
        const itemToReply = feedbackItems.find(item => item.id === itemId);
        setReplyText(itemToReply?.reply || ''); // Pre-fill with existing reply if any
        console.log(`Replying to: ${itemToReply?.type} from ${itemToReply?.submittedBy}`);
    };

    const handleReplyChange = (e) => {
        setReplyText(e.target.value);
    };

    const handleSendReply = async (e, itemId) => {
        e.preventDefault();
        if (!replyText.trim()) {
            alert("Please enter a reply message.");
            return;
        }
        
        try {
            const token = getAuthToken();
            if (!token) throw new Error("Admin token not found.");

            const response = await fetch(`/api/admin/feedback/${itemId}/reply`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                // Send reply and explicitly set status to 'closed'
                body: JSON.stringify({ reply: replyText, status: 'closed' }) 
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({ message: 'Failed to send reply.'}));
                throw new Error(errData.message || 'Failed to send reply.');
            }
            const updatedItemData = await response.json();
            // Transform the single updated item
            const updatedItem = {
                ...updatedItemData,
                id: updatedItemData._id,
                submittedBy: updatedItemData.user ? (updatedItemData.user.name || updatedItemData.user.username) : 'Unknown User',
                userId: updatedItemData.user ? updatedItemData.user._id : 'N/A',
                timestamp: new Date(updatedItemData.createdAt)
            };

            setFeedbackItems(prevItems =>
                prevItems.map(item =>
                    item.id === itemId ? updatedItem : item
                )
            );
            alert('Reply sent and ticket closed.');
            setReplyingTo(null);
            setReplyText('');
        } catch (err) {
            console.error("Error sending reply:", err);
            alert(`Error: ${err.message}`);
        }
    };

    const handleCancelReply = () => {
        setReplyingTo(null);
        setReplyText('');
    };

    const handleUpdateStatus = async (itemId, newStatus) => {
        try {
            const token = getAuthToken();
            if (!token) throw new Error("Admin token not found.");
            
            const itemToUpdate = feedbackItems.find(item => item.id === itemId);
            // If marking as 'in-progress', provide a default acknowledgment if no reply exists.
            // If marking as 'closed' without a new reply, keep existing reply or set a default.
            let replyContent = itemToUpdate?.reply || '';
            if (newStatus === 'in-progress' && !itemToUpdate?.reply) {
                replyContent = 'Acknowledged. We are looking into this.';
            } else if (newStatus === 'closed' && !itemToUpdate?.reply) {
                replyContent = 'Ticket closed by admin.';
            }


            const response = await fetch(`/api/admin/feedback/${itemId}/reply`, { // Using reply endpoint to update status
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ reply: replyContent, status: newStatus })
            });
            if (!response.ok) {
                const errData = await response.json().catch(() => ({ message: 'Failed to update status.'}));
                throw new Error(errData.message || 'Failed to update status.');
            }
            const updatedItemData = await response.json();
            const updatedItem = {
                ...updatedItemData,
                id: updatedItemData._id,
                submittedBy: updatedItemData.user ? (updatedItemData.user.name || updatedItemData.user.username) : 'Unknown User',
                userId: updatedItemData.user ? updatedItemData.user._id : 'N/A',
                timestamp: new Date(updatedItemData.createdAt)
            };

            setFeedbackItems(prevItems =>
                prevItems.map(item =>
                    item.id === itemId ? updatedItem : item
                )
            );
            alert(`Ticket status updated to ${newStatus}.`);
        } catch (err) {
            console.error("Error updating status:", err);
            alert(`Error: ${err.message}`);
        }
    };

    const refreshFeedback = () => {
        fetchFeedback(); // Call the main fetch function
        alert('Feedback list refreshed.');
    };


    return (
        <div className={styles.supportContainer}>
            <h1 className={styles.pageTitle}><FaBug /> User Feedback & Support</h1>
            {error && <p className={styles.errorMessage}>{error}</p>}

            {/* Filter and Refresh */}
            <div className={styles.controlsContainer}>
                <div className={styles.filterGroup}>
                    <label htmlFor="statusFilter">Filter by Status:</label>
                    <select
                        id="statusFilter"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className={styles.filterSelect}
                    >
                        <option value="open">Open</option>
                        <option value="in-progress">In Progress</option>
                        <option value="closed">Closed</option>
                        <option value="all">All</option>
                    </select>
                </div>
                <button onClick={refreshFeedback} className={styles.refreshButton} title="Refresh Feedback" disabled={isLoading}>
                    <FaSyncAlt /> Refresh
                </button>
            </div>

            {/* Feedback List/Table */}
            <div className={styles.tableContainer}>
                {isLoading && feedbackItems.length === 0 ? (
                    <p className={styles.loadingText}>Loading feedback...</p>
                ) : !error && filteredItems.length === 0 && !isLoading ? (
                    <p className={styles.noResults}>No feedback items found matching the current filter.</p>
                ) : !error ? (
                    <table className={styles.feedbackTable}>
                        <thead>
                            <tr>
                                <th>Type</th>
                                <th>Submitted By</th>
                                <th>Message</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredItems.map((item) => (
                                    <tr key={item.id} className={styles[`status-${item.status}`]}>
                                        <td data-label="Type">{item.type === 'bug' ? 'Bug Report' : 'Feedback'}</td>
                                        <td data-label="Submitted By">{item.submittedBy} ({item.userId})</td>
                                        <td data-label="Message" className={styles.messageCell}>
                                            {item.message}
                                            {item.reply && <div className={styles.adminReplyPreview}><strong>Admin Reply:</strong> {item.reply}</div>}
                                        </td>
                                        <td data-label="Date">{item.timestamp ? new Date(item.timestamp).toLocaleDateString() : 'N/A'}</td>
                                        <td data-label="Status" className={styles.statusCell}>
                                            <span className={`${styles.tag} ${styles[item.status.replace('-', '')]}`}>
                                                {item.status.replace('-', ' ')}
                                            </span>
                                        </td>
                                        <td data-label="Actions" className={styles.actionButtonsCell}>
                                            <div className={styles.actionButtons}>
                                                {item.status !== 'closed' && (
                                                    <>
                                                        {item.status === 'open' && (
                                                            <button
                                                                onClick={() => handleUpdateStatus(item.id, 'in-progress')}
                                                                className={`${styles.actionButton} ${styles.progressButton}`}
                                                                title="Mark as In Progress"
                                                            >
                                                                <FaSave /> <span className={styles.actionText}>In Progress</span>
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleStartReply(item.id)}
                                                            className={`${styles.actionButton} ${styles.replyButton}`}
                                                            title="Reply/Log Issue"
                                                        >
                                                            <FaReply /> <span className={styles.actionText}>Reply/Log</span>
                                                        </button>
                                                        <button // Always allow closing if not already closed
                                                            onClick={() => handleUpdateStatus(item.id, 'closed')}
                                                            className={`${styles.actionButton} ${styles.closeButton}`}
                                                            title="Mark as Closed"
                                                        >
                                                            <FaTimes /> <span className={styles.actionText}>Close</span>
                                                        </button>
                                                    </>
                                                )}
                                                {item.status === 'closed' && ( // Option to reopen or reply again if closed
                                                     <button
                                                        onClick={() => handleStartReply(item.id)} // Allows editing reply or changing status
                                                        className={`${styles.actionButton} ${styles.replyButton}`}
                                                        title="View/Edit Reply or Reopen"
                                                    >
                                                        <FaReply /> <span className={styles.actionText}>View/Edit</span>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                ) : null /* Error is handled by the error paragraph above */}
            </div>

            {/* Reply Input (shown when replyingTo is not null) */}
            {replyingTo && (
                <div className={styles.replyModalOverlay}>
                    <div className={styles.replyModal}>
                        <h4>Reply / Log Issue:</h4>
                        <textarea
                            value={replyText}
                            onChange={handleReplyChange}
                            placeholder="Type your reply or log details here..."
                            className={styles.replyTextArea}
                            rows="5"
                        />
                        <div className={styles.replyButtons}>
                            <button onClick={(e) => handleSendReply(e, replyingTo)} className={`${styles.actionButton} ${styles.sendButton}`}>
                                <FaEnvelope /> Send & Close
                            </button>
                             {/* Button to update status without necessarily closing */}
                            <button onClick={() => handleUpdateStatus(replyingTo, 'in-progress')} className={`${styles.actionButton} ${styles.progressButton}`}>
                                <FaSave /> Save as In Progress
                            </button>
                            <button onClick={handleCancelReply} className={`${styles.actionButton} ${styles.cancelButton}`}>
                                <FaTimes /> Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminSupport;
