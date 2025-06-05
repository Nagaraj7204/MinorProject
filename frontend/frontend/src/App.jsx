// c:/Users/misba/OneDrive/Documents/workopoly1_proj/frontend/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext'; // Import ThemeProvider and useTheme

// --- Core Components ---
import Home from './components/Home/Home';
import SignUp from './components/SignUp/SignUp';
import Login from './components/Login/Login';
import OtpVerification from './components/OtpVerification/OtpVerification'; // Import OTP component
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';

// --- User Dashboard Components ---
import DashboardLayout from './components/Layout/DashboardLayout';
import Dashboard from './components/Dashboard/Dashboard';
import TaskListPage from './components/TaskList/TaskList';
import MyProgress from './components/MyProgress/MyProgress';
import Leaderboard from './components/Leaderboard/Leaderboard';
import UserProfile from './components/UserProfile/UserProfile';
import SubscriptionTiersPage from './components/SubscriptionTiers/SubscriptionTiersPage'; // Import the new page
import RewardsPage from './components/RewardsPage/RewardsPage'; // Import the new RewardsPage component
import UserFeedbackPage from './pages/UserFeedbackPage'; // Import the UserFeedbackPage
import GamesPage from './pages/GamesPage/GamesPage'; // Main Games landing page
import FlashQuizRunnerPage from './pages/FlashQuizRunnerPage/FlashQuizRunnerPage'; // Page for running the Flash Quiz
import QuizLevelSelectionPage from './pages/QuizLevelSelectionPage/QuizLevelSelectionPage'; // Page for quiz level selection
import PomodoroTimer from './components/PomodoroTimer/PomodoroTimer'; // Import the new PomodoroTimer component

// --- Feature Pages ---
import TimeManagement from './components/TimeManagement/TimeManagement'; // Import TimeManagement
import TaskManagement from './components/TaskManagement/TaskManagement'; // Import TaskManagement
import GamificationPage from './components/GamificationPage/GamificationPage'; // Import GamificationPage


// --- Admin Components ---
import AdminLayout from './components/Layout/AdminLayout';
import AdminDashboard from './components/AdminDashboard/AdminDashboard';
// Import the actual Admin User Management component
import AdminUserManagement from './components/AdminUserManagement/AdminUserManagement';
// Import the actual Admin Task Management component (assuming it's created)
import AdminTaskManagement from './components/AdminTaskManagement/AdminTaskManagement'; // Make sure this path is correct
// Import the Admin Leaderboard component
import AdminLeaderboard from './components/AdminLeaderboard/AdminLeaderboard';
// Import the Admin Reports component
import AdminReports from './components/AdminReports/AdminReports';
// Import the Admin Support component
import AdminSupport from './components/AdminSupport/AdminSupport';
// Import the Admin Settings component
import AdminSettings from './components/AdminSettings/AdminSettings';


// --- Protected Route Components ---

// For Regular Users
const UserProtectedRoutes = () => {
  const { isLoggedIn, logout /*, userRole */ } = useAuth();
  // Add role check if needed: if (!isLoggedIn || userRole !== 'user') return <Navigate...>;
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return <DashboardLayout logout={logout} />;
};

// For Admins
const AdminProtectedRoutes = () => {
  const { isLoggedIn /*, userRole */ } = useAuth(); // Removed unused 'logout'
  // Add role check if needed: if (!isLoggedIn || userRole !== 'admin') return <Navigate...>;
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  // AdminLayout gets logout via context in its sidebar
  return <AdminLayout />;
};

// Create a new component to consume the theme context
const ThemedApp = () => {
  const { currentTheme } = useTheme();

  return (
    // Apply the data-theme attribute to a wrapper div
    // You might want to add a class like "app-container" for global app styling if needed
    <div data-theme={currentTheme} className="app-container">
      <Router>
        <Navbar />
        <div className="main-content">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<><Home /><Footer /></>} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/login" element={<Login />} />
            <Route path="/verify-otp" element={<OtpVerification />} /> {/* Add OTP verification route */}

            {/* Feature Pages Routes */}
            <Route path="/features/time-management" element={<TimeManagement />} />
            <Route path="/features/task-management" element={<TaskManagement />} />
            <Route path="/features/gamification" element={<GamificationPage />} /> {/* Keep placeholder or replace */}

            {/* User Protected Routes */}
            <Route element={<UserProtectedRoutes />}>
               <Route path="/dashboard" element={<Dashboard />} />
               <Route path="/tasks" element={<TaskListPage />} />
               <Route path="/my-progress" element={<MyProgress />} />
               <Route path="/leaderboard" element={<Leaderboard />} /> {/* Maybe share leaderboard? */}
               <Route path="/user/profile" element={<UserProfile />} />
               <Route path="/rewards" element={<RewardsPage />} /> {/* Add route for RewardsPage */}
               <Route path="/subscription-tiers" element={<SubscriptionTiersPage />} /> {/* Add route for Subscription Tiers */}
               <Route path="/feedback" element={<UserFeedbackPage />} /> {/* Add route for User Feedback Page */}
               {/* Nested routes for Games */}
               <Route path="/games" element={<GamesPage />} /> {/* Main games hub page */}
               <Route path="/games/quiz-levels" element={<QuizLevelSelectionPage />} /> {/* Quiz level selection */}
               <Route path="/pomodoro-timer" element={<PomodoroTimer />} /> {/* Add route for Pomodoro Timer */}
               <Route path="/games/flash-quiz" element={<FlashQuizRunnerPage />} /> {/* Specific page for Flash Quiz */}

            </Route>

            {/* Admin Protected Routes */}
            <Route path="/admin" element={<AdminProtectedRoutes />}> {/* Parent route for admin */}
               <Route path="dashboard" element={<AdminDashboard />} /> {/* Note: relative path */}
               {/* Use the imported component for the users route */}
               <Route path="users" element={<AdminUserManagement />} />
               {/* Use the imported component for the tasks route */}
               <Route path="tasks" element={<AdminTaskManagement />} />
               <Route path="leaderboard" element={<AdminLeaderboard />} />
               <Route path="reports" element={<AdminReports />} /> {/* Updated Route */}
               <Route path="support" element={<AdminSupport />} />
               <Route path="settings" element={<AdminSettings />} />
               {/* Optional: Redirect from /admin to /admin/dashboard */}
               <Route index element={<Navigate to="dashboard" replace />} />
            </Route>

            {/* Catch-all Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </Router>
    </div>
  );
};

// Simple NotFound component (keep as is)
const NotFound = () => {
    return (
        <div style={{ textAlign: 'center', padding: '50px', fontFamily: 'Poppins, sans-serif' }}>
          <h1>404 - Page Not Found</h1>
          <p>Oops! The page you're looking for doesn't seem to exist.</p>
          <Link to="/" style={{ color: '#8685ef', textDecoration: 'none', fontWeight: '600' }}>Go back to Home</Link>
        </div>
      );
};

function App() {
  return (
    // Wrap the entire application with ThemeProvider
    <ThemeProvider>
      <ThemedApp />
    </ThemeProvider>
  );
}

export default App;
