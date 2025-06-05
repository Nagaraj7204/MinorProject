// c:/Users/misba/OneDrive/Documents/workopoly1_proj/backend/routes/taskRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js"; // Assuming 'protect' is the exported function
import {
    createTask, // Import the create controller
    getTasks,   // Gets tasks for the logged-in user (handles filtering)
    getTaskStats, // Import the stats controller
    getTaskById, // Import the get by ID controller
    updateTask, // Import the update controller
    deleteTask, // Import the delete controller
} from "../controllers/taskController.js"; // Ensure path is correct
// No need to import the Task model here if controllers handle DB logic

const router = express.Router();

// --- Protected Task Routes ---

// POST /api/tasks - Create a new task for the logged-in user
router.post("/", protect, createTask); // Use the imported controller

// GET /api/tasks/stats - Get task statistics for the logged-in user
router.get("/stats", protect, getTaskStats);

// GET /api/tasks - Get all tasks *for the logged-in user*
// This route now handles filtering based on query params (e.g., ?status=due)
router.get("/", protect, getTasks);

// GET /api/tasks/:id - Get a single task by ID
router.get("/:id", protect, getTaskById); // Use the imported controller

// PUT /api/tasks/:id - Update a specific task owned by the logged-in user
router.put("/:id", protect, updateTask); // Use the imported controller

// DELETE /api/tasks/:id - Delete a specific task owned by the logged-in user
router.delete("/:id", protect, deleteTask); // Use the imported controller


// --- Optional Routes (Consider adding controllers and protection as needed) ---

// GET /api/tasks/all - Get ALL tasks in the system (e.g., for an admin)
// This would require a separate controller and likely different middleware (e.g., admin check)
// router.get("/all", protect, admin, getAllTasksController); // Assuming admin middleware exists


export default router;
