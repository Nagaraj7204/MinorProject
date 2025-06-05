// src/components/AdminSettings/AdminSettings.jsx
import React, { useState } from 'react';
import styles from './AdminSettings.module.css';
import { FaCog, FaEnvelope, FaTools, FaUserShield, FaKey, FaPlus } from 'react-icons/fa';

const AdminSettings = () => {
    // --- State ---
    const [maintenanceMode, setMaintenanceMode] = useState(false); // Example state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [newAdminEmail, setNewAdminEmail] = useState('');
    const [newAdminPassword, setNewAdminPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false); // For simulating actions

    // --- Handlers ---
    const handleToggleMaintenance = () => {
        setIsLoading(true);
        console.log(`Toggling maintenance mode to ${!maintenanceMode}`);
        // Simulate API call
        setTimeout(() => {
            setMaintenanceMode(!maintenanceMode);
            setIsLoading(false);
            alert(`Maintenance mode ${!maintenanceMode ? 'enabled' : 'disabled'} (simulated).`);
        }, 500);
    };

    const handleChangePassword = (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            alert("New passwords do not match.");
            return;
        }
        if (!currentPassword || !newPassword) {
            alert("Please fill in all password fields.");
            return;
        }
        setIsLoading(true);
        console.log("Attempting to change password...");
        // Simulate API call
        setTimeout(() => {
            alert("Password change request submitted (simulated). Check console.");
            console.log({ currentPassword, newPassword });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setIsLoading(false);
        }, 1000);
    };

    const handleAddAdmin = (e) => {
        e.preventDefault();
        if (!newAdminEmail || !newAdminPassword) {
            alert("Please provide email and password for the new admin.");
            return;
        }
        setIsLoading(true);
        console.log(`Attempting to add new admin: ${newAdminEmail}`);
        // Simulate API call
        setTimeout(() => {
            alert(`New admin account request for ${newAdminEmail} submitted (simulated).`);
            console.log({ newAdminEmail, newAdminPassword }); // Log password only in dev!
            setNewAdminEmail('');
            setNewAdminPassword('');
            setIsLoading(false);
        }, 1000);
    };

    // Placeholder for editing email templates
    const handleEditTemplate = (templateName) => {
        alert(`Edit template: ${templateName} (not implemented)`);
    };

    return (
        <div className={styles.settingsContainer}>
            <h1 className={styles.pageTitle}><FaCog /> Admin Settings</h1>

            {/* --- Site Configurations Section --- */}
            <section className={styles.settingsSection}>
                <h2 className={styles.sectionTitle}><FaCog /> Site Configurations</h2>
                <div className={styles.sectionContent}>
                    <p>Manage general site settings here. (Placeholder)</p>
                    {/* Example: Site Name Input */}
                    <div className={styles.formGroup}>
                        <label htmlFor="siteName">Site Name:</label>
                        <input type="text" id="siteName" defaultValue="Workopoly" className={styles.inputField} />
                    </div>
                    {/* Add more configuration options as needed */}
                    <button className={styles.saveButton} disabled={isLoading}>Save Configurations</button>
                </div>
            </section>

            {/* --- Notification Email Templates Section --- */}
            <section className={styles.settingsSection}>
                <h2 className={styles.sectionTitle}><FaEnvelope /> Notification Email Templates</h2>
                <div className={styles.sectionContent}>
                    <p>Customize the emails sent to users.</p>
                    <ul className={styles.templateList}>
                        <li>Welcome Email <button onClick={() => handleEditTemplate('Welcome')} className={styles.editButton} disabled={isLoading}>Edit</button></li>
                        <li>Password Reset <button onClick={() => handleEditTemplate('Password Reset')} className={styles.editButton} disabled={isLoading}>Edit</button></li>
                        <li>Task Assignment <button onClick={() => handleEditTemplate('Task Assignment')} className={styles.editButton} disabled={isLoading}>Edit</button></li>
                        {/* Add more templates */}
                    </ul>
                </div>
            </section>

            {/* --- Maintenance Mode Section --- */}
            <section className={styles.settingsSection}>
                <h2 className={styles.sectionTitle}><FaTools /> Maintenance Mode</h2>
                <div className={styles.sectionContent}>
                    <p>Put the site into maintenance mode to perform updates.</p>
                    <div className={styles.maintenanceToggle}>
                        <span>Status:</span>
                        <span className={maintenanceMode ? styles.statusOn : styles.statusOff}>
                            {maintenanceMode ? 'ON' : 'OFF'}
                        </span>
                        <button
                            onClick={handleToggleMaintenance}
                            className={`${styles.toggleButton} ${maintenanceMode ? styles.toggleOffButton : styles.toggleOnButton}`}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Updating...' : (maintenanceMode ? 'Disable Maintenance Mode' : 'Enable Maintenance Mode')}
                        </button>
                    </div>
                    {maintenanceMode && <p className={styles.warningText}>Warning: Site is currently inaccessible to regular users.</p>}
                </div>
            </section>

            {/* --- Admin Account Management Section --- */}
            <section className={styles.settingsSection}>
                <h2 className={styles.sectionTitle}><FaUserShield /> Admin Accounts</h2>
                <div className={styles.sectionContent}>
                    {/* Change Password Form */}
                    <form onSubmit={handleChangePassword} className={styles.adminForm}>
                        <h3><FaKey /> Change Your Password</h3>
                        <div className={styles.formGroup}>
                            <label htmlFor="currentPassword">Current Password:</label>
                            <input
                                type="password"
                                id="currentPassword"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className={styles.inputField}
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="newPassword">New Password:</label>
                            <input
                                type="password"
                                id="newPassword"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className={styles.inputField}
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="confirmPassword">Confirm New Password:</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className={styles.inputField}
                                required
                            />
                        </div>
                        <button type="submit" className={styles.saveButton} disabled={isLoading}>
                            {isLoading ? 'Updating...' : 'Update Password'}
                        </button>
                    </form>

                    <hr className={styles.divider} />

                    {/* Add New Admin Form */}
                    <form onSubmit={handleAddAdmin} className={styles.adminForm}>
                        <h3><FaPlus /> Add New Admin User</h3>
                        <div className={styles.formGroup}>
                            <label htmlFor="newAdminEmail">New Admin Email:</label>
                            <input
                                type="email"
                                id="newAdminEmail"
                                value={newAdminEmail}
                                onChange={(e) => setNewAdminEmail(e.target.value)}
                                className={styles.inputField}
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="newAdminPassword">Temporary Password:</label>
                            <input
                                type="password"
                                id="newAdminPassword"
                                value={newAdminPassword}
                                onChange={(e) => setNewAdminPassword(e.target.value)}
                                className={styles.inputField}
                                required
                            />
                        </div>
                        <button type="submit" className={styles.saveButton} disabled={isLoading}>
                            {isLoading ? 'Adding...' : 'Add Admin'}
                        </button>
                    </form>
                </div>
            </section>
        </div>
    );
};

export default AdminSettings;
