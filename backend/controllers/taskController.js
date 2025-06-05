// c:/Users/misba/OneDrive/Documents/workopoly1_proj/backend/controllers/taskController.js
import Task from '../models/Task.js';
import User from '../models/User.js'; // Import User model for point updates
import mongoose from 'mongoose';
// Import the badge awarding function
import { awardBadge } from '../utils/gamificationUtils.js';

// @desc    Get task statistics for the logged-in user
// @route   GET /api/tasks/stats
// @access  Private
export const getTaskStats = async (req, res) => {
    try {
        const userId = req.user._id; // Get user ID from protect middleware

        // Get current date at the start of the day for overdue comparison
        const now = new Date();
        const todayStart = new Date(new Date().setHours(0, 0, 0, 0)); // Start of today

        // --- Fetch counts using countDocuments for efficiency ---

        // Total tasks for the user
        const total = await Task.countDocuments({ user: userId });

        // Completed tasks
        const completed = await Task.countDocuments({ user: userId, completed: true });

        // Pending tasks (not completed and not overdue)
        const pending = await Task.countDocuments({
            user: userId,
            completed: false, // Use completed field
            // Ensure dueDate is null OR greater than or equal to the start of today
            $or: [
                { dueDate: null },
                { dueDate: { $gte: todayStart } }
            ]
        });

        // Overdue tasks (not completed AND dueDate is before todayStart)
        const overdue = await Task.countDocuments({
            user: userId,
            completed: false, // Use completed field
            dueDate: { $lt: todayStart, $ne: null } // Due date is before today and not null
        });

        res.status(200).json({
            total,
            completed,
            pending,
            overdue,
        });

    } catch (error) {
        console.error('Error fetching task stats:', error);
        res.status(500).json({ message: 'Server Error fetching task statistics' });
    }
};


// @desc    Get tasks for the logged-in user (filtered, e.g., due soon/overdue)
// @route   GET /api/tasks
// @access  Private
export const getTasks = async (req, res) => {
    try {
        const userId = req.user._id;
        const { completed, status, limit = 10, sortBy = 'dueDate:asc' } = req.query; // Get query params (keep 'status' for 'due' filter for now)

        let query = { user: userId }; // Base query for the logged-in user

        // --- Filtering Logic ---
        if (status === 'due') {
            // Find tasks that are not completed and are due soon or overdue
            const now = new Date();
            const todayStart = new Date(new Date().setHours(0, 0, 0, 0));
            // Example: Define "due soon" as within the next 7 days
            const sevenDaysFromNow = new Date(todayStart);
            sevenDaysFromNow.setDate(todayStart.getDate() + 7);

            query.completed = false; // Use completed field
            query.dueDate = {
                $ne: null, // Must have a due date
                $lt: sevenDaysFromNow // Due date is before 7 days from now (includes overdue)
            };
        } else if (completed !== undefined) {
            // Allow filtering directly by completed status (true/false)
            query.completed = completed === 'true'; // Convert string query param to boolean
        }
        // Add more filters as needed (e.g., by priority, date range)

        // --- Sorting Logic ---
        const sortOptions = {};
        if (sortBy) {
            const parts = sortBy.split(':');
            sortOptions[parts[0]] = parts[1] === 'desc' ? -1 : 1; // -1 for desc, 1 for asc
        } else {
            sortOptions.createdAt = -1; // Default sort by newest created
        }

        // --- Execute Query ---
        const tasks = await Task.find(query)
            .sort(sortOptions)
            .limit(parseInt(limit)); // Apply limit

        // Add an 'isOverdue' flag to each task for the frontend
        const nowForOverdueCheck = new Date();
        const tasksWithOverdueFlag = tasks.map(task => {
            const isOverdue = task.dueDate && task.dueDate < nowForOverdueCheck && !task.completed; // Use completed field
            // Return a plain object to avoid Mongoose object issues if modifying directly
            return { ...task.toObject(), isOverdue };
        });


        res.status(200).json(tasksWithOverdueFlag);

    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ message: 'Server Error fetching tasks' });
    }
};


// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
export const createTask = async (req, res) => {
    const { title, description, dueDate, priority, points } = req.body; // Add points here

    if (!title) {
        return res.status(400).json({ message: 'Task title is required' });
    }

    try {
        const task = new Task({
            user: req.user._id, // Link task to the logged-in user
            title,
            description,
            dueDate: dueDate || null, // Handle empty date string
            priority: priority || 'Medium', // Use provided priority or default
            points: points || 10, // Use provided points or default to 10
            completed: false // New tasks are not completed
        });

        const createdTask = await task.save();
        console.log(`Task created for user ${req.user.email}: ${createdTask.title}`);
        res.status(201).json(createdTask);
    } catch (error) {
        console.error('Error creating task:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server Error creating task' });
    }
};

// @desc    Get a single task by ID
// @route   GET /api/tasks/:id
// @access  Private
export const getTaskById = async (req, res) => {
    try {
        const taskId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(taskId)) {
            return res.status(400).json({ message: 'Invalid Task ID format' });
        }

        const task = await Task.findById(taskId);

        // Ensure the task exists and belongs to the logged-in user
        if (!task || task.user.toString() !== req.user._id.toString()) {
            return res.status(404).json({ message: 'Task not found' });
        }

        res.status(200).json(task);
    } catch (error) {
        console.error(`Error fetching task ${req.params.id}:`, error);
        res.status(500).json({ message: 'Server Error fetching task' });
    }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
export const updateTask = async (req, res) => {
    try {
        const taskId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(taskId)) {
            return res.status(400).json({ message: 'Invalid Task ID format' });
        }

        const task = await Task.findById(taskId);

        // Ensure the task exists and belongs to the logged-in user
        if (!task || task.user.toString() !== req.user._id.toString()) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // --- Update fields ---
        // Include 'points' in the destructured body if you allow updating points
        const { title, description, dueDate, priority, completed, points } = req.body;
        const wasCompletedBefore = task.completed; // Check status before update

        task.title = title !== undefined ? title : task.title;
        task.description = description !== undefined ? description : task.description;
        task.dueDate = dueDate !== undefined ? (dueDate || null) : task.dueDate; // Allow setting null
        task.priority = priority !== undefined ? priority : task.priority;
        task.completed = completed !== undefined ? completed : task.completed;
        task.points = points !== undefined ? points : task.points; // Update points if provided

        // Set completedAt timestamp ONLY when task is marked completed
        if (task.completed && !wasCompletedBefore) {
            task.completedAt = new Date();
        } else if (!task.completed && wasCompletedBefore) {
            // Optional: Clear completedAt if task is marked incomplete again
            task.completedAt = null;
        }

        const updatedTask = await task.save();

        // --- Award points, XP, and Handle Level Ups if task was just completed ---
        if (updatedTask.completed && !wasCompletedBefore) {
            // Use the points value from the task itself (which might have been updated)
            const pointsAwarded = updatedTask.points || 10; // Use task's points value or a default

            // --- Update User Scores, XP, and Level ---
            // Fetch the user first to check current XP/Level
            const user = await User.findById(req.user._id);

            if (user) {
                const xpGained = 15; // XP awarded for completing a task (Adjust as needed)

                // Prepare updates
                user.points += pointsAwarded;
                user.dailyPoints += pointsAwarded;
                user.weeklyPoints += pointsAwarded;
                user.tasksCompleted += 1;
                user.currentXP += xpGained;

                let leveledUp = false;
                // Check for level up (using a while loop for multiple level ups)
                while (user.currentXP >= user.xpForNextLevel) {
                    user.level += 1;
                    const leftoverXP = user.currentXP - user.xpForNextLevel;
                    // Calculate XP needed for the *new* next level (e.g., Level 2 needs 200, Level 3 needs 300)
                    user.xpForNextLevel = user.level * 100; // Adjust formula if needed
                    user.currentXP = leftoverXP;
                    console.log(`User ${user.name} leveled up to Level ${user.level}! Next level at ${user.xpForNextLevel} XP.`);
                    leveledUp = true; // Ensure leveledUp is set correctly inside the loop

                    // --- Award Level-Up Badges ---
                    if (user.level === 5) { await awardBadge(user._id, '🌟'); } // Award '🌟' badge at level 5
                    // Add more level badges here, e.g.:
                    // if (user.level === 10) { await awardBadge(user._id, '🏆'); }
                }

                try {
                    await user.save(); // Save all updates (points, XP, level, etc.)
                    console.log(`Updated user ${user.name}: Points=${user.points}, XP=${user.currentXP}/${user.xpForNextLevel}, Level=${user.level}`);

                    // --- Award Task Completion Badges (Check after saving user data) ---
                    // Check these *after* saving so tasksCompleted is definitely updated
                    if (user.tasksCompleted === 1) { await awardBadge(user._id, '☝️'); } // First Task!
                    if (user.tasksCompleted === 10) { await awardBadge(user._id, '🔟'); } // Ten Tasks!
                    // Add more task completion badges as needed, e.g.:
                    // if (user.tasksCompleted === 25) { await awardBadge(user._id, '🚀'); }

                    if (leveledUp) {
                        // You could potentially emit a notification here if using websockets
                    }
                } catch (saveError) {
                    console.error(`Error saving user ${user._id} after task completion:`, saveError);
                    // Handle potential save errors (e.g., validation)
                }
            } else {
                console.error(`Failed to find user ${req.user._id} after task completion.`);
            }
        }
        // --- End points/XP/Level logic ---

        console.log(`Task updated for user ${req.user.email}: ${updatedTask.title}`);
        res.status(200).json(updatedTask);

    } catch (error) {
        console.error(`Error updating task ${req.params.id}:`, error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server Error updating task' });
    }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
export const deleteTask = async (req, res) => {
    try {
        const taskId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(taskId)) {
            return res.status(400).json({ message: 'Invalid Task ID format' });
        }

        const task = await Task.findById(taskId);

        // Ensure the task exists and belongs to the logged-in user
        if (!task || task.user.toString() !== req.user._id.toString()) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Optional: Deduct points/XP if deleting a completed task? (Usually not done)
        // if (task.completed) { ... logic to decrement user points/XP ... }

        await task.deleteOne(); // Use deleteOne() on the document instance
        console.log(`Task deleted for user ${req.user.email}: ${taskId}`);
        res.status(200).json({ message: 'Task deleted successfully' });

    } catch (error) {
        console.error(`Error deleting task ${req.params.id}:`, error);
        res.status(500).json({ message: 'Server Error deleting task' });
    }
};
