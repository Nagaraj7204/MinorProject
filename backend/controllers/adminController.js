import User from '../models/User.js'; // Adjust path if necessary
import Task from '../models/Task.js'; // Adjust path if necessary
import Feedback from '../models/Feedback.js'; // Import Feedback model
import sendEmail from '../utils/sendEmail.js'; // Import the email utility

// @desc    Get admin dashboard summary (total users, tasks, completed tasks, recent users, recent tasks)
// @route   GET /api/admin/dashboard-summary
// @access  Private/Admin
const getDashboardSummary = async (req, res) => {
    try {
        // --- Fetch Total Non-Admin Users ---
        const totalUsers = await User.countDocuments({ role: { $ne: 'admin' } });

        // --- Fetch Total Tasks ---
        const totalTasks = await Task.countDocuments();

        // --- Fetch Completed Tasks ---
        const completedTasks = await Task.countDocuments({ completed: true });

        // --- Fetch Recent Non-Admin Users (e.g., latest 5) ---
        const recentUsersData = await User.find({ role: { $ne: 'admin' } })
            .sort({ createdAt: -1 })
            .limit(5)
            .select('name username email createdAt');

        // --- Fetch Recent Tasks (e.g., latest 5) ---
        const recentTasksData = await Task.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('user', 'name username')
            .select('title completed user createdAt');

        // --- Map data to ensure frontend compatibility ---
        const recentUsers = recentUsersData.map(user => ({
            id: user._id,
            name: user.name || user.username,
            email: user.email,
            joined: user.createdAt
        }));

        const recentTasks = recentTasksData.map(task => ({
            id: task._id,
            title: task.title,
            status: task.completed ? 'Completed' : 'Pending',
            userName: task.user ? (task.user.name || task.user.username) : 'N/A',
            createdAt: task.createdAt
        }));

        res.status(200).json({
            totalUsers,
            totalTasks,
            completedTasks,
            recentUsers,
            recentTasks
        });

    } catch (error) {
        console.error("Error fetching admin dashboard summary:", error);
        res.status(500).json({ message: "Error fetching dashboard data", error: error.message });
    }
};

// @desc    Get all users (for admin management table)
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({})
            .select('name username email role status createdAt lastActive'); // Ensure 'status' is selected

        res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching all users for admin:", error);
        res.status(500).json({ message: "Server error fetching users" });
    }
};

// @desc    Update user status (block/unblock) by admin
// @route   PUT /api/admin/users/:userId/status
// @access  Private/Admin
const updateUserStatus = async (req, res) => {
    const { userId } = req.params;
    const { status } = req.body; // Expected status: 'active' or 'blocked'

    if (!['active', 'blocked', 'pending_deletion'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status value.' });
    }

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        if (user._id.equals(req.user._id) && status === 'blocked') {
             return res.status(400).json({ message: 'You cannot block yourself.' });
        }

        user.status = status;
        await user.save();
        const updatedUser = await User.findById(userId).select('-password');
        res.status(200).json({ message: `User status updated to ${status}.`, user: updatedUser });
    } catch (error) {
        console.error(`Error updating status for user ${userId}:`, error);
        res.status(500).json({ message: 'Server error updating user status.' });
    }
};

// @desc    Update user details (e.g., role) by admin
// @route   PUT /api/admin/users/:userId
// @access  Private/Admin
const updateUserById = async (req, res) => {
    const { userId } = req.params;
    const { role, name, email } = req.body;

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        if (user._id.equals(req.user._id) && role && role !== 'admin' && user.role === 'admin') {
            return res.status(400).json({ message: 'Admins cannot demote themselves to a non-admin role.' });
        }

        if (role) {
            if (!['user', 'admin'].includes(role)) {
                return res.status(400).json({ message: 'Invalid role specified.' });
            }
            user.role = role;
        }
        if (name) user.name = name;
        if (email) {
            const emailExists = await User.findOne({ email, _id: { $ne: userId } });
            if (emailExists) {
                return res.status(400).json({ message: 'Email already in use by another account.' });
            }
            user.email = email;
        }

        await user.save();
        const updatedUser = await User.findById(userId).select('-password');
        res.status(200).json({ message: 'User details updated successfully.', user: updatedUser });

    } catch (error) {
        console.error(`Error updating details for user ${userId}:`, error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: "Validation Error", errors: error.errors });
        }
        res.status(500).json({ message: 'Server error updating user details.' });
    }
};


// @desc    Delete a user by admin
// @route   DELETE /api/admin/users/:userId
// @access  Private/Admin
const deleteUserById = async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        if (user._id.equals(req.user._id)) {
            return res.status(400).json({ message: 'You cannot delete your own account as an admin.' });
        }
        // Consider deleting user's tasks or reassigning them
        // await Task.deleteMany({ user: userId });

        await User.findByIdAndDelete(userId);

        res.status(200).json({ message: 'User deleted successfully.' });

    } catch (error) {
        console.error(`Error deleting user ${userId}:`, error);
        res.status(500).json({ message: 'Server error deleting user.' });
    }
};

// --- Task Management Controllers for Admin ---

// @desc    Get all tasks for admin
// @route   GET /api/admin/tasks
// @access  Private/Admin
const getAllTasksForAdmin = async (req, res) => {
    try {
        const tasks = await Task.find({})
            .populate('user', 'name username _id') // Populate user details
            .sort({ createdAt: -1 });
        res.status(200).json(tasks);
    } catch (error) {
        console.error("Error fetching all tasks for admin:", error);
        res.status(500).json({ message: "Server error fetching tasks." });
    }
};

// @desc    Update task status by admin (e.g., mark as complete/pending)
// @route   PUT /api/admin/tasks/:taskId/status
// @access  Private/Admin
const updateTaskStatusAdmin = async (req, res) => {
    const { taskId } = req.params;
    const { completed } = req.body; // Expecting a boolean: true for complete, false for pending

    if (typeof completed !== 'boolean') {
        return res.status(400).json({ message: 'Invalid status. "completed" must be a boolean.' });
    }

    try {
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found.' });
        }

        task.completed = completed;
        await task.save();

        const updatedTask = await Task.findById(taskId).populate('user', 'name username _id');
        res.status(200).json({ message: `Task status updated.`, task: updatedTask });
    } catch (error) {
        console.error(`Error updating status for task ${taskId}:`, error);
        res.status(500).json({ message: 'Server error updating task status.' });
    }
};

// @desc    Delete a task by admin
// @route   DELETE /api/admin/tasks/:taskId
// @access  Private/Admin
const deleteTaskAdmin = async (req, res) => {
    const { taskId } = req.params;
    try {
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found.' });
        }
        await Task.findByIdAndDelete(taskId);
        res.status(200).json({ message: 'Task deleted successfully.' });
    } catch (error)
        {
        console.error(`Error deleting task ${taskId}:`, error);
        res.status(500).json({ message: 'Server error deleting task.' });
    }
};

// --- Leaderboard Management Controllers for Admin ---

// @desc    Get leaderboard data (all users sorted by points)
// @route   GET /api/admin/leaderboard
// @access  Private/Admin
const getLeaderboardData = async (req, res) => {
    try {
        // Fetch users, select necessary fields, and sort by points descending, then by level
        const leaderboard = await User.find({ role: { $ne: 'admin' } }) // Exclude admins from public leaderboard if desired
            .select('name username points level _id') // Ensure _id is selected
            .sort({ points: -1, level: -1, username: 1 }); // Primary sort by points, secondary by level, then username

        res.status(200).json(leaderboard);
    } catch (error) {
        console.error("Error fetching leaderboard data:", error);
        res.status(500).json({ message: "Server error fetching leaderboard data." });
    }
};

// @desc    Reset points for all non-admin users
// @route   PUT /api/admin/leaderboard/reset-all
// @access  Private/Admin
const resetAllUserPointsAdmin = async (req, res) => {
    try {
        // Reset points and level for all users (or non-admins)
        await User.updateMany(
            { role: { $ne: 'admin' } }, // Condition to update only non-admins
            { $set: { points: 0, level: 1 } } // Set points to 0 and level to 1
        );
        res.status(200).json({ message: "All user points and levels have been reset." });
    } catch (error) {
        console.error("Error resetting all user points:", error);
        res.status(500).json({ message: "Server error resetting user points." });
    }
};

// @desc    Adjust points for a specific user by admin
// @route   PUT /api/admin/leaderboard/:userId/adjust-points
// @access  Private/Admin
const adjustUserPointsAdmin = async (req, res) => {
    const { userId } = req.params;
    const { points } = req.body; // This is the amount to add (can be negative)

    if (typeof points !== 'number') {
        return res.status(400).json({ message: 'Invalid points value. Must be a number.' });
    }

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        user.points = (user.points || 0) + points;
        // TODO: Add logic to recalculate user.level based on new points if necessary
        await user.save();

        const updatedUser = await User.findById(userId).select('name username points level _id');
        res.status(200).json(updatedUser);

    } catch (error) {
        console.error(`Error adjusting points for user ${userId}:`, error);
        res.status(500).json({ message: 'Server error adjusting user points.' });
    }
};

// --- Feedback/Support Management Controllers for Admin ---

// @desc    Get all feedback/support items for admin
// @route   GET /api/admin/feedback
// @access  Private/Admin
const getFeedbackItemsAdmin = async (req, res) => {
    try {
        const feedbackItems = await Feedback.find({})
            .populate('user', 'name username _id email') // Populate user who submitted, ensure email is included
            .populate('repliedBy', 'name username') // Populate admin who replied
            .sort({ createdAt: -1 }); // Newest first
        res.status(200).json(feedbackItems);
    } catch (error) {
        console.error("Error fetching feedback items for admin:", error);
        res.status(500).json({ message: "Server error fetching feedback items." });
    }
};

// @desc    Reply to a feedback/support item by admin and/or update its status
// @route   PUT /api/admin/feedback/:feedbackId/reply
// @access  Private/Admin
const replyToFeedbackAdmin = async (req, res) => {
    const { feedbackId } = req.params; 
    const { reply, status } = req.body;

    if (!reply && !status) { // Check if at least one action is being performed
        return res.status(400).json({ message: 'Reply content or a new status is required.' });
    }
    if (status && !['open', 'in-progress', 'closed'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status value.' });
    }

    try {
        const feedbackItem = await Feedback.findById(feedbackId).populate('user', 'name username email'); // Populate user email

        if (!feedbackItem) {
            return res.status(404).json({ message: 'Feedback item not found.' });
        }

        if (reply !== undefined) { // Allow clearing reply by sending empty string
            feedbackItem.reply = reply;
            feedbackItem.repliedBy = req.user._id; // Admin user ID from 'protect' middleware
            feedbackItem.repliedAt = Date.now();
        }

        if (status) {
            feedbackItem.status = status;
        }

        const updatedFeedbackItem = await feedbackItem.save();
        
        // We already populated 'user' with email. Now populate 'repliedBy' for the response.
        const finalUpdatedItem = await Feedback.findById(updatedFeedbackItem._id)
                                        .populate('user', 'name username email _id') // Ensure user details are present
                                        .populate('repliedBy', 'name username');

        // Send email notification to the user who submitted the feedback
        if (finalUpdatedItem.user && finalUpdatedItem.user.email && (reply || status)) {
            const subject = `Update on Your Workopoly Feedback (ID: ${finalUpdatedItem._id})`;
            let emailHtmlContent = `
                <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                  <p>Hi ${finalUpdatedItem.user.name || finalUpdatedItem.user.username || 'User'},</p>
                  <p>There's an update on your Workopoly feedback/bug report (ID: <strong>${finalUpdatedItem._id}</strong>).</p>
                  <p><strong>Current Status:</strong> ${finalUpdatedItem.status.charAt(0).toUpperCase() + finalUpdatedItem.status.slice(1)}</p>`;
            if (finalUpdatedItem.reply) {
                emailHtmlContent += `<p><strong>Admin's Reply:</strong></p><blockquote style="border-left: 4px solid #ccc; padding-left: 1em; margin-left: 0.5em;">${finalUpdatedItem.reply}</blockquote>`;
            }
            emailHtmlContent += `<p>Thank you for helping us improve Workopoly!</p><p>Sincerely,<br>The Workopoly Team</p></div>`;
            
            const emailTextContent = `Hi ${finalUpdatedItem.user.name || finalUpdatedItem.user.username || 'User'},\n\nThere's an update on your Workopoly feedback/bug report (ID: ${finalUpdatedItem._id}).\nStatus: ${finalUpdatedItem.status.charAt(0).toUpperCase() + finalUpdatedItem.status.slice(1)}\n${finalUpdatedItem.reply ? '\nAdmin\'s Reply:\n' + finalUpdatedItem.reply + '\n\n' : ''}Thank you for helping us improve Workopoly!\n\nSincerely,\nThe Workopoly Team`;
            
            await sendEmail({ email: finalUpdatedItem.user.email, subject, message: emailTextContent, html: emailHtmlContent });
        }
        res.status(200).json(finalUpdatedItem);
    } catch (error) {
        console.error(`Error replying to/updating feedback ${feedbackId}:`, error);
        res.status(500).json({ message: 'Server error processing feedback item.' });
    }
};


// Export all controller functions
export {
    getDashboardSummary,
    getAllUsers,
    updateUserStatus,
    updateUserById,
    deleteUserById,
    // Task controllers
    getAllTasksForAdmin,
    updateTaskStatusAdmin,
    deleteTaskAdmin,
    // Leaderboard controllers
    getLeaderboardData,
    resetAllUserPointsAdmin,
    adjustUserPointsAdmin,
    // Feedback/Support controllers
    getFeedbackItemsAdmin,
    replyToFeedbackAdmin,
};
