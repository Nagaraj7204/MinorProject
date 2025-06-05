import express from 'express';
const router = express.Router();
import { protect, admin } from '../middleware/authMiddleware.js';
import {
    getDashboardSummary,
    getAllUsers,
    updateUserStatus,
    updateUserById,
    deleteUserById,
    // Import task controllers
    getAllTasksForAdmin,
    updateTaskStatusAdmin,
    deleteTaskAdmin,
    // Import leaderboard controllers
    getLeaderboardData,
    resetAllUserPointsAdmin,
    adjustUserPointsAdmin,
    // Import feedback/support controllers
    getFeedbackItemsAdmin,
    replyToFeedbackAdmin
} from '../controllers/adminController.js';

// --- User Management Routes ---
// @desc    Get admin dashboard summary data
// @route   GET /api/admin/dashboard-summary
// @access  Private/Admin
router.get(
    '/dashboard-summary',
    protect,
    admin,
    getDashboardSummary
);

// @desc    Get all users (for admin management)
// @route   GET /api/admin/users
// @access  Private/Admin
router.get(
    '/users',
    protect,
    admin,
    getAllUsers
);

// @desc    Update user status (block/unblock/pending_deletion) by admin
// @route   PUT /api/admin/users/:userId/status
// @access  Private/Admin
router.put(
    '/users/:userId/status',
    protect,
    admin,
    updateUserStatus
);

// @desc    Update user details (e.g., role) by admin
// @route   PUT /api/admin/users/:userId
// @access  Private/Admin
router.put(
    '/users/:userId',
    protect,
    admin,
    updateUserById
);

// @desc    Delete a user by admin
// @route   DELETE /api/admin/users/:userId
// @access  Private/Admin
router.delete(
    '/users/:userId',
    protect,
    admin,
    deleteUserById
);

// --- Task Management Routes ---
// @desc    Get all tasks for admin
// @route   GET /api/admin/tasks
// @access  Private/Admin
router.get(
    '/tasks',
    protect,
    admin,
    getAllTasksForAdmin
);

// @desc    Update task status by admin
// @route   PUT /api/admin/tasks/:taskId/status
// @access  Private/Admin
router.put(
    '/tasks/:taskId/status',
    protect,
    admin,
    updateTaskStatusAdmin
);

// @desc    Delete a task by admin
// @route   DELETE /api/admin/tasks/:taskId
// @access  Private/Admin
router.delete(
    '/tasks/:taskId',
    protect,
    admin,
    deleteTaskAdmin
);

// --- Leaderboard Management Routes ---
// @desc    Get leaderboard data
// @route   GET /api/admin/leaderboard
// @access  Private/Admin
router.get(
    '/leaderboard',
    protect,
    admin,
    getLeaderboardData
);

// @desc    Reset points for all users
// @route   PUT /api/admin/leaderboard/reset-all
// @access  Private/Admin
router.put(
    '/leaderboard/reset-all',
    protect,
    admin,
    resetAllUserPointsAdmin
);

// @desc    Adjust points for a specific user
// @route   PUT /api/admin/leaderboard/:userId/adjust-points
// @access  Private/Admin
router.put(
    '/leaderboard/:userId/adjust-points',
    protect,
    admin,
    adjustUserPointsAdmin
);

// --- Feedback/Support Management Routes (Admin) ---
// @desc    Get all feedback/support items
// @route   GET /api/admin/feedback
// @access  Private/Admin
router.get(
    '/feedback',
    protect,
    admin,
    getFeedbackItemsAdmin
);

// @desc    Reply to a feedback/support item and/or update its status
// @route   PUT /api/admin/feedback/:feedbackId/reply
// @access  Private/Admin
router.put(
    '/feedback/:feedbackId/reply',
    protect,
    admin,
    replyToFeedbackAdmin
);


export default router;
