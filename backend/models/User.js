import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true, // Good practice for emails
    },
    password: {
      type: String,
      // Not strictly required, as users can sign up via Google
      // required: true,
    },
    username: { // Add username field
      type: String,
      unique: true,
      sparse: true, // Allows multiple null/undefined values but unique otherwise
      // Optional: Add validation like min/max length or allowed characters
    },
    role: {
      type: String,
      enum: ['user', 'admin'], // Define possible roles
      default: 'user',        // Set a default role for new users
      required: true          // Ensure every user has a role
    },
    status: { // User status for admin management
      type: String,
      enum: ['active', 'blocked', 'pending_deletion'], // Example statuses
      default: 'active',
      required: true
    },
    lastActive: { // Track when the user was last active
      type: Date,
      default: Date.now // Set to current time on creation, update on login/activity
    },
    // --- Gamification Fields ---
    points: { // Total accumulated points (all-time) - Keep this!
      type: Number,
      default: 0,
      index: true, // Index for sorting all-time leaderboard
    },
    dailyPoints: { // Points accumulated today
      type: Number,
      default: 0, index: true,
    },
    weeklyPoints: { // Points accumulated this week
      type: Number, default: 0, index: true,
    },
    level: {
      type: Number,
      default: 1,
    },
    currentXP: {
      type: Number,
      default: 0,
    },
    xpForNextLevel: {
      type: Number,
      default: 100, // Initial XP needed to reach level 2
    },
    // --- Fields potentially used by leaderboard controller (ensure they exist) ---
    tasksCompleted: { type: Number, default: 0 }, // Add if not already present
    badges: [{ type: String }], // Add if not already present
    profilePictureUrl: { type: String, default: null }, // Renamed from profileIconUrl for consistency
    recentlyUnlocked: { type: Boolean, default: false }, // Add if not already present
    theme: { // Add theme field
      type: String,
      default: 'light', // Default theme
    },
    unlockedRewardIds: { // Store IDs of unlocked rewards
      type: [String],
      default: [],
    },
    equippedAvatarId: { // Store ID of the equipped avatar reward (use its reward ID)
      type: String,
      default: null, // Default to no avatar equipped
    },
    // --- OTP verification ---
    isVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: String,
      default: null,
    },
    otpExpires: {
      type: Date,
      default: null,
    },
    // --- Bonus Claim Tracking ---
    lastBonusClaim: {
        type: Date,
        default: null,
    },
    // --- Google OAuth Fields ---
    googleId: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple documents to have a null value for googleId
    },
    // --- Subscription Tier ---
    tier: {
      type: String,
      enum: ['free', 'silver', 'gold', 'diamond'], // Ensure these match frontend tier IDs
      default: 'free',
    },
    // --- End of new fields ---
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// Method to match entered password with the stored hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  // Ensure 'this.password' exists before comparing
  if (!this.password && this.googleId) {
    // User signed up with Google and may not have a password
    return false;
  }
  if (!this.password) { // General case if password is not set
    return false;
  }
  return await bcrypt.compare(enteredPassword, this.password);
};

// --- Static methods for resetting points (for cron jobs) ---
userSchema.statics.resetDailyPoints = async function() {
  try {
    await this.updateMany({}, { $set: { dailyPoints: 0 } });
    console.log('Daily points reset for all users.');
  } catch (error) {
    console.error('Error resetting daily points:', error);
  }
};

userSchema.statics.resetWeeklyPoints = async function() {
  try {
    await this.updateMany({}, { $set: { weeklyPoints: 0 } });
    console.log('Weekly points reset for all users.');
  } catch (error) {
    console.error('Error resetting weekly points:', error);
  }
};
// --- End of static methods ---

const User = mongoose.model("User", userSchema);

export default User;
