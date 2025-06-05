// src/components/AdminReports/AdminReports.jsx
import React, { useState, useEffect } from 'react';
import styles from './AdminReports.module.css';
import { FaFlag, FaEnvelopeOpenText, FaCheckCircle, FaTimesCircle, FaSyncAlt } from 'react-icons/fa';

// --- Placeholder Report Data ---
const placeholderReports = [
  { id: 'r1', type: 'task', reportedItemId: 't101', reportedItemName: 'Inappropriate Task Title', reporterId: 'u2', reporterName: 'Bob J.', reason: 'Contains offensive language.', status: 'pending', timestamp: new Date(Date.now() - 86400000) }, // 1 day ago
  { id: 'r2', type: 'user', reportedItemId: 'u5', reportedItemName: 'Eve Adams', reporterId: 'u1', reporterName: 'Alice S.', reason: 'Spamming comments.', status: 'pending', timestamp: new Date(Date.now() - 172800000) }, // 2 days ago
  { id: 'r3', type: 'task', reportedItemId: 't205', reportedItemName: 'Misleading Task Description', reporterId: 'u4', reporterName: 'Diana P.', reason: 'Description does not match task requirements.', status: 'resolved', timestamp: new Date(Date.now() - 259200000) }, // 3 days ago
  { id: 'r4', type: 'user', reportedItemId: 'u6', reportedItemName: 'Charlie Brown', reporterId: 'u1', reporterName: 'Alice S.', reason: 'Harassment in chat.', status: 'dismissed', timestamp: new Date(Date.now() - 345600000) }, // 4 days ago
];
// --- End Placeholder ---

const AdminReports = () => {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('pending'); // 'pending', 'resolved', 'dismissed', 'all'

  // --- Fetch Data ---
  useEffect(() => {
    setIsLoading(true);
    // Simulate fetching report data
    const fetchReports = async () => {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
      // Sort by timestamp descending (newest first)
      const sortedData = placeholderReports.sort((a, b) => b.timestamp - a.timestamp);
      setReports(sortedData);
      setIsLoading(false);
    };
    fetchReports();
  }, []);

  // --- Filter Logic ---
  const filteredReports = reports.filter(report => {
    if (filter === 'all') return true;
    return report.status === filter;
  });

  // --- Action Handlers (Placeholders) ---
  const handleUpdateStatus = (reportId, newStatus) => {
    console.log(`Updating report ${reportId} to status: ${newStatus}`);
    alert(`Update status for report ${reportId} to ${newStatus} (not implemented)`);
    // TODO: API call to update report status

    // Example local update:
    setReports(prevReports =>
      prevReports.map(report =>
        report.id === reportId ? { ...report, status: newStatus } : report
      )
    );
  };

  const handleViewDetails = (report) => {
    // In a real app, this might open a modal with more details
    // or navigate to a specific report detail page.
    alert(`Viewing details for Report ID: ${report.id}\nType: ${report.type}\nItem: ${report.reportedItemName}\nReason: ${report.reason}\nStatus: ${report.status}`);
    console.log('Viewing details:', report);
  };

  const refreshReports = () => {
      setIsLoading(true);
      // Simulate fetching report data again
      const fetchReports = async () => {
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
        const sortedData = placeholderReports.sort((a, b) => b.timestamp - a.timestamp);
        setReports(sortedData);
        setIsLoading(false);
        alert('Reports refreshed (using placeholder data).');
      };
      fetchReports();
  }

  return (
    <div className={styles.reportsContainer}>
      <h1 className={styles.pageTitle}><FaFlag /> Report Center</h1>

      {/* Filter and Refresh Controls */}
      <div className={styles.controlsContainer}>
        <div className={styles.filterGroup}>
          <label htmlFor="statusFilter">Filter by Status:</label>
          <select
            id="statusFilter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="pending">Pending</option>
            <option value="resolved">Resolved</option>
            <option value="dismissed">Dismissed</option>
            <option value="all">All</option>
          </select>
        </div>
        <button onClick={refreshReports} className={styles.refreshButton} title="Refresh Reports">
          <FaSyncAlt /> Refresh
        </button>
      </div>

      {/* Reports Table/List */}
      <div className={styles.tableContainer}>
        {isLoading ? (
          <p>Loading reports...</p>
        ) : (
          <table className={styles.reportsTable}>
            <thead>
              <tr>
                <th>Type</th>
                <th>Reported Item</th>
                <th>Reason</th>
                <th>Reporter</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.length > 0 ? (
                filteredReports.map((report) => (
                  <tr key={report.id} className={styles[`status-${report.status}`]}>
                    <td data-label="Type">{report.type === 'task' ? 'Task' : 'User'}</td>
                    <td data-label="Reported Item">{report.reportedItemName} ({report.reportedItemId})</td>
                    <td data-label="Reason" className={styles.reasonCell}>{report.reason}</td>
                    <td data-label="Reporter">{report.reporterName} ({report.reporterId})</td>
                    <td data-label="Date">{report.timestamp.toLocaleDateString()}</td>
                    <td data-label="Status" className={styles.statusCell}>{report.status.charAt(0).toUpperCase() + report.status.slice(1)}</td>
                    <td data-label="Actions" className={styles.actionButtonsCell}>
                      <div className={styles.actionButtons}>
                        <button
                          onClick={() => handleViewDetails(report)}
                          className={`${styles.actionButton} ${styles.detailsButton}`}
                          title="View Details"
                        >
                          <FaEnvelopeOpenText /> <span className={styles.actionText}>Details</span>
                        </button>
                        {report.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(report.id, 'resolved')}
                              className={`${styles.actionButton} ${styles.resolveButton}`}
                              title="Mark as Resolved"
                            >
                              <FaCheckCircle /> <span className={styles.actionText}>Resolve</span>
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(report.id, 'dismissed')}
                              className={`${styles.actionButton} ${styles.dismissButton}`}
                              title="Dismiss Report"
                            >
                              <FaTimesCircle /> <span className={styles.actionText}>Dismiss</span>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className={styles.noResults}>
                    No reports found matching the current filter.
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

export default AdminReports;
