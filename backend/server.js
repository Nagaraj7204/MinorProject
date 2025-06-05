import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import cron from 'node-cron'; // Import node-cron
import path from 'path'; // Import path module
import { fileURLToPath } from 'url'; // Import fileURLToPath
import userRoutes from "./routes/userRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import authRoutes from "./routes/authRoutes.js"; // Import the new auth routes
import bonusRoutes from "./routes/bonusRoutes.js"; // Import bonus routes
import adminRoutes from "./routes/adminRoutes.js"; // Import admin routes
import leaderboardRoutes from "./routes/leaderboardRoutes.js"; // Import leaderboard routes
import feedbackRoutes from "./routes/feedbackRoutes.js"; // Import feedback routes for user submissions
import { notFound, errorHandler } from './middleware/errorMiddleware.js'; // Assuming you have these
import User from './models/User.js'; // Import User model for cron jobs

// --- Setup for __dirname in ES Modules ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// --- End Setup ---

dotenv.config();
connectDB();

const app = express();

// Body parser middleware
app.use(express.json());

// CORS middleware
app.use(cors({
  origin: "http://localhost:3000", // Allow requests from your frontend
  credentials: true
}));

// --- Mount Routes ---
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes); // Mount auth routes for /api/auth prefix
app.use("/api/tasks", taskRoutes);
app.use("/api/bonuses", bonusRoutes); // Mount bonus routes
app.use("/api/leaderboard", leaderboardRoutes); // Mount leaderboard routes
app.use("/api/admin", adminRoutes); // Mount admin routes
app.use("/api/feedback", feedbackRoutes); // Mount feedback routes for user submissions

// --- Serve Static Files (Uploaded Images) ---
// Make the 'uploads' directory publicly accessible under the '/uploads' path
// path.join ensures correct path separators across OS
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// Simple route for checking if API is running
app.get("/", (req, res) => {
  res.send("API is running...");
});

// --- Custom Error Handling Middleware (Should be after routes) ---
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`)
);

// --- Cron Jobs for Leaderboard Point Resets ---
console.log('Initializing scheduler...');

// Schedule daily reset at midnight (00:00) in your server's timezone
cron.schedule('0 0 * * *', async () => {
  console.log('Running daily points reset job...');
  try {
    await User.resetDailyPoints(); // Call the static method from User model
  } catch (error) {
    console.error('Error running daily points reset job:', error);
  }
}, {
  // IMPORTANT: Replace with your actual server timezone!
  // Find yours here: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
  timezone: "Asia/Kolkata" // Example: India Standard Time - CHANGE THIS
});

// Schedule weekly reset at midnight (00:00) every Monday in your server's timezone
cron.schedule('0 0 * * 1', async () => {
  console.log('Running weekly points reset job...');
  try {
    await User.resetWeeklyPoints(); // Call the static method from User model
  } catch (error) {
    console.error('Error running weekly points reset job:', error);
  }
}, {
  // IMPORTANT: Replace with your actual server timezone!
  timezone: "Asia/Kolkata" // Example: India Standard Time - CHANGE THIS
});

console.log('Scheduler initialized with daily and weekly reset jobs.');
// --- End Cron Jobs ---
