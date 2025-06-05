// c:/Users/misba/OneDrive/Documents/workopoly1_proj/backend/controllers/userController.js
import User from "../models/User.js";
import Task from "../models/Task.js"; // Import Task model for potential cleanup
import generateToken from "../utils/generateToken.js";
import sendEmail from "../utils/sendEmail.js"; // Import the email utility
import bcrypt from "bcryptjs";
import crypto from "crypto"; // Import Node.js crypto module
// import { v2 as cloudinary } from 'cloudinary'; // Not needed for local storage
import fs from 'fs'; // Import file system module for deleting local files
import path from 'path'; // Import path module
import { fileURLToPath } from 'url'; // Import fileURLToPath

// --- Setup for __dirname in ES Modules ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// --- End Setup ---


// --- Configuration (Mirror frontend or load from shared config) ---
// Define these costs here or import from a config file
const themeCosts = { light: 0, dark: 100, ocean: 250 };
const usernameUnlockCost = 50;

// --- Subscription Tier Configuration (mirror frontend or load from shared config) ---
const TIERS_CONFIG = {
    free: { name: 'Free Plan', pointsRequired: 0, order: 0 },
    silver: { name: 'Silver Tier', pointsRequired: 500, order: 1 },
    gold: { name: 'Gold Tier', pointsRequired: 2000, order: 2 },
    diamond: { name: 'Diamond Tier', pointsRequired: 5000, order: 3 },
};

// Helper function to extract public_id from Cloudinary URL - Not needed for local storage
// const getPublicIdFromUrl = (url) => { ... };


// Register a new user with OTP verification
export const registerUser = async (req, res) => {
    // Destructure role, providing a default if not sent (though schema default handles it too)
    const { name, email, password, role = 'user' } = req.body;

    // Basic input validation
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Please provide name, email, and password.' });
    }

    try {
        const lowerCaseEmail = email.toLowerCase();
        const userExists = await User.findOne({ email: lowerCaseEmail });

        if (userExists) {
            // If user exists but is not verified, inform them to verify or resend OTP
            if (!userExists.isVerified) {
                console.log(`Registration attempt for existing unverified user: ${lowerCaseEmail}`);
                return res.status(400).json({ message: 'Account exists but is not verified. Please check your email for the OTP or request a new one.' });
            }
            // If user exists and is verified
            console.log(`Registration attempt for existing verified user: ${lowerCaseEmail}`);
            return res.status(400).json({ message: "User already exists and is verified." });
        }

        // --- Generate OTP ---
        const otp = crypto.randomInt(100000, 999999).toString(); // 6-digit OTP
        const otpExpires = Date.now() + 15 * 60 * 1000; // OTP valid for 15 minutes

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user instance with OTP details and role
        const user = new User({
            name,
            email: lowerCaseEmail,
            password: hashedPassword,
            role: role, // Assign the role (will default to 'user' if not provided)
            otp: otp,
            otpExpires: otpExpires,
            isVerified: false // Explicitly set to false
        });

        // Save the user to the database
        const savedUser = await user.save();

        // --- Send Verification Email ---
        const message = `Welcome to Workopoly!\n\nYour One-Time Password (OTP) for email verification is: ${otp}\n\nThis OTP is valid for 15 minutes.\n\nPlease enter this code in the verification screen.\n\nIf you didn't request this, please ignore this email.`;

        const emailSent = await sendEmail({
            email: savedUser.email,
            subject: 'Workopoly - Verify Your Email Address',
            message,
        });

        if (emailSent) {
            console.log(`User ${savedUser.email} created and verification email sent.`);
            res.status(201).json({
                success: true,
                message: 'Registration successful! Please check your email for the verification OTP.',
            });
        } else {
            console.error(`User ${savedUser.email} registered but email sending failed.`);
            // Consider deleting the user if email fails critically, or just inform them
            res.status(201).json({
                success: true,
                message: 'Registration successful, but failed to send verification email. Please try requesting a new OTP later.',
                emailError: true
            });
        }

    } catch (error) {
        console.error("Registration error:", error);
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Email address already in use.' });
        }
        // Handle validation errors from Mongoose (e.g., invalid role enum)
        if (error.name === 'ValidationError') {
             return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: "Server Error during registration." });
    }
};

// --- Verify User's Email with OTP ---
export const verifyOtp = async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ message: 'Please provide both email and OTP.' });
    }

    try {
        const lowerCaseEmail = email.toLowerCase();
        const user = await User.findOne({ email: lowerCaseEmail });

        if (!user) {
            console.log(`OTP verification attempt for non-existent user: ${lowerCaseEmail}`);
            return res.status(404).json({ message: 'User not found.' });
        }

        if (user.isVerified) {
            console.log(`OTP verification attempt for already verified user: ${lowerCaseEmail}`);
            return res.status(400).json({ message: 'Account already verified.' });
        }

        const isOtpValid = user.otp === otp;
        const isOtpExpired = !user.otpExpires || user.otpExpires < Date.now();

        if (!isOtpValid || isOtpExpired) {
            console.log(`Invalid or expired OTP attempt for user: ${lowerCaseEmail}. Valid: ${isOtpValid}, Expired: ${isOtpExpired}`);
            return res.status(400).json({ message: 'Invalid or expired OTP.' });
        }

        // --- Verification Successful ---
        user.isVerified = true;
        user.otp = null;
        user.otpExpires = null;
        await user.save({ validateBeforeSave: false }); // Skip validation as we are just clearing OTP

        console.log(`Email verified successfully for: ${user.email}`);

        res.status(200).json({
            success: true,
            message: 'Email verified successfully! You can now log in.',
        });

    } catch (error) {
        console.error("Verify OTP Error:", error);
        res.status(500).json({ message: 'Server error during OTP verification.' });
    }
};


// Login User - Updated to check verification status and return role
export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Please provide both email and password.' });
    }

    try {
        const lowerCaseEmail = email.toLowerCase();
        // Select the password field explicitly as it might be excluded by default elsewhere
        const user = await User.findOne({ email: lowerCaseEmail }).select('+password');

        // Check if user exists first
        if (!user) {
            console.log(`Login attempt failed: User not found for ${lowerCaseEmail}`);
            return res.status(401).json({ message: "Invalid email or password" }); // Keep generic for security
        }

        // Check password match
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            console.log(`Login attempt failed: Invalid password for ${lowerCaseEmail}`);
            return res.status(401).json({ message: "Invalid email or password" }); // Keep generic for security
        }

        // --- Check if verified ---
        if (!user.isVerified) {
            console.log(`Login attempt failed: Account not verified for ${lowerCaseEmail}`);
            return res.status(403).json({ // 403 Forbidden
                success: false,
                message: 'Account not verified. Please check your email for the verification OTP or request a new one.',
                accountNotVerified: true
            });
        }
        // --- End verification check ---

        // If password matches AND user is verified, send token and user data
        console.log(`Login successful for: ${user.email}`);
        res.status(200).json({ // Use 200 OK for successful login
            success: true, // Indicate success
            token: generateToken(user._id), // Generate and send token
            user: { // Nest user details inside a 'user' object
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                tier: user.tier || 'free',
                points: user.points // Ensure points are included
            }
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Server Error during login" });
    }
};

// Get all users (Admin Only)
export const getAllUsers = async (req, res) => {
    try {
        // Exclude password and OTP fields from the result
        const users = await User.find().select("-password -otp -otpExpires");
        res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching all users:", error);
        res.status(500).json({ message: "Server Error while fetching users" });
    }
};

// Get user by ID (Admin Only)
export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password -otp -otpExpires");

        if (user) {
            res.status(200).json(user);
        } else {
            console.log(`Get user attempt failed: User not found (ID: ${req.params.id})`);
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        console.error(`Error fetching user (ID: ${req.params.id}):`, error);
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid user ID format.' });
        }
        res.status(500).json({ message: "Server Error while fetching user" });
    }
};

// Update user details by ID (Admin Only)
export const updateUser = async (req, res) => {
    try {
        // Find user by ID from URL parameter
        const user = await User.findById(req.params.id);

        if (user) {
            // Update fields based on request body
            user.name = req.body.name || user.name;

            // Allow role update if provided and valid
            if (req.body.role && ['user', 'admin'].includes(req.body.role)) {
                 user.role = req.body.role;
            }

            // Update email if changed and check uniqueness
            const newEmail = req.body.email ? req.body.email.toLowerCase() : user.email;
            if (newEmail !== user.email) {
                const emailExists = await User.findOne({ email: newEmail });
                if (emailExists && emailExists._id.toString() !== user._id.toString()) {
                    return res.status(400).json({ message: 'New email address is already in use.' });
                }
                user.email = newEmail;
                // Consider requiring re-verification for email change by admin
                // user.isVerified = false;
            }

            // Allow updating points, level, XP manually via this route
            user.points = req.body.points !== undefined ? req.body.points : user.points;
            user.level = req.body.level !== undefined ? req.body.level : user.level;
            user.currentXP = req.body.currentXP !== undefined ? req.body.currentXP : user.currentXP;
            user.xpForNextLevel = req.body.xpForNextLevel !== undefined ? req.body.xpForNextLevel : user.xpForNextLevel;
            user.theme = req.body.theme || user.theme;
            user.username = req.body.username || user.username; // Allow admin to set/change username
            user.badges = req.body.badges || user.badges; // Allow admin to manage badges
            user.unlockedRewardIds = req.body.unlockedRewardIds || user.unlockedRewardIds; // Allow admin management
            user.equippedAvatarId = req.body.equippedAvatarId || user.equippedAvatarId; // Allow admin management
            user.tier = req.body.tier || user.tier; // Allow admin to update tier

            const updatedUser = await user.save();

            // Respond with updated user data (excluding sensitive fields)
            res.status(200).json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                points: updatedUser.points,
                level: updatedUser.level,
                currentXP: updatedUser.currentXP,
                xpForNextLevel: updatedUser.xpForNextLevel,
                isVerified: updatedUser.isVerified,
                theme: updatedUser.theme,
                username: updatedUser.username,
                badges: updatedUser.badges,
                profilePictureUrl: updatedUser.profilePictureUrl,
                createdAt: updatedUser.createdAt,
                unlockedRewardIds: updatedUser.unlockedRewardIds,
                equippedAvatarId: updatedUser.equippedAvatarId,
                tier: updatedUser.tier,
            });
        } else {
            console.log(`Update attempt failed: User not found (ID: ${req.params.id})`);
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        console.error(`Error updating user (ID: ${req.params.id}):`, error);
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid user ID format.' });
        }
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Email or Username already exists.' });
        }
         if (error.name === 'ValidationError') {
             return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: "Server Error while updating user" });
    }
};

// Delete User by ID (Admin Only)
export const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            const userId = user._id;
            const userEmail = user.email;
            const profilePicUrl = user.profilePictureUrl;

            // 1. Delete associated data (e.g., Tasks) - Optional
            // await Task.deleteMany({ user: userId });
            // console.log(`Deleted tasks for user ${userEmail}`);

            // 2. Delete local profile picture file (if exists)
            if (profilePicUrl && profilePicUrl.startsWith('/uploads/')) {
                // Construct the local file path relative to the project root
                const filePath = path.join(__dirname, '..', profilePicUrl); // Go up one level from controllers to project root
                try {
                    // Use fs.promises for async/await compatibility
                    await fs.promises.unlink(filePath);
                    console.log(`Deleted local profile picture file: ${filePath}`);
                } catch (fileError) {
                    // Log error if file deletion fails (e.g., file not found)
                    if (fileError.code !== 'ENOENT') { // Ignore 'file not found' errors
                        console.error(`Error deleting local profile picture file ${filePath}:`, fileError);
                    }
                }
            }

            // 3. Delete the user document
            await user.deleteOne();
            console.log(`User deleted: ${userEmail} (ID: ${userId})`);
            res.status(200).json({ message: "User and associated data deleted successfully" });

        } else {
            console.log(`Delete attempt failed: User not found (ID: ${req.params.id})`);
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        console.error(`Error deleting user (ID: ${req.params.id}):`, error);
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid user ID format.' });
        }
        res.status(500).json({ message: "Server Error while deleting user" });
    }
};


// Get current user's profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req, res) => {
    try {
        // req.user should be populated by the 'protect' middleware
        // Find the user by ID from the token, excluding sensitive fields
        const user = await User.findById(req.user._id).select('-password -otp -otpExpires');

        if (user) {
            // Send back the necessary profile data
            res.status(200).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                points: user.points,
                level: user.level,
                tasksCompleted: user.tasksCompleted, // Add tasksCompleted
                currentXP: user.currentXP,
                xpForNextLevel: user.xpForNextLevel,
                lastBonusClaim: user.lastBonusClaim,
                profilePictureUrl: user.profilePictureUrl, // Add profile picture URL
                theme: user.theme, // Add theme
                badges: user.badges, // Add badges
                createdAt: user.createdAt, // Add createdAt
                username: user.username, // Add username
                unlockedRewardIds: user.unlockedRewardIds || [], // Add unlocked rewards (default empty array)
                equippedAvatarId: user.equippedAvatarId || null, // Add equipped avatar (default null)
                tier: user.tier || 'free', // Add current tier
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Server Error fetching profile' });
    }
};

// Update current user's profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { name, email, theme, username } = req.body;

        // Update basic fields
        user.name = name || user.name;

        // Update email if changed and check uniqueness
        const newEmail = email ? email.toLowerCase() : user.email;
        if (newEmail !== user.email) {
            const emailExists = await User.findOne({ email: newEmail });
            if (emailExists && emailExists._id.toString() !== user._id.toString()) {
                return res.status(400).json({ message: 'New email address is already in use.' });
            }
            user.email = newEmail;
            // Optional: Require email re-verification here
            // user.isVerified = false; // Mark as unverified
            // // Generate and send new OTP...
        }

        // Update theme and handle points deduction
        if (theme && theme !== user.theme) {
            const cost = themeCosts[theme] ?? 0; // Get cost from config, default 0
            const currentThemeCost = themeCosts[user.theme] ?? 0; // Cost of current theme (usually 0 if default)

            // Only charge if the new theme costs more than the current one and is not free
            if (cost > currentThemeCost && cost > 0) {
                 // Check if the theme is unlocked before trying to equip/charge
                if (!user.unlockedRewardIds.includes(theme)) {
                     return res.status(400).json({ message: `Theme "${theme}" must be unlocked first.` });
                }
                // Point deduction should happen during unlock, not equip via profile update
                // if (user.points < cost) {
                //     return res.status(400).json({ message: `Insufficient points to unlock the ${theme} theme. Need ${cost} points.` });
                // }
                // user.points -= cost; // Deduct points
                // console.log(`Deducted ${cost} points from user ${user.email} for ${theme} theme.`);
                console.log(`Equipping unlocked theme "${theme}".`);
            } else if (cost < currentThemeCost) {
                console.log(`Switching to a cheaper or free theme "${theme}". No points deducted.`);
            } else if (theme === user.theme) {
                 console.log(`Theme "${theme}" is already equipped.`);
            }
            user.theme = theme; // Update the theme field
        }

        // Update username if provided and unlocked
        const isUsernameUnlocked = user.points >= usernameUnlockCost || user.unlockedRewardIds.includes('username_custom'); // Check points OR if feature unlocked
        if (username !== undefined && username !== user.username) { // Check if username is provided and different
            // Allow setting username for the first time even if points < cost, OR if points >= cost
            if (!user.username || isUsernameUnlocked) {
                 // Check uniqueness if changing/setting username
                if (username) { // Only check if username is not empty
                    const usernameExists = await User.findOne({ username: username });
                    if (usernameExists && usernameExists._id.toString() !== user._id.toString()) {
                        return res.status(400).json({ message: 'Username is already taken.' });
                    }
                    // Optional: Add validation for username format/length here
                    user.username = username;
                } else {
                    // Allow setting username back to null/empty if desired (and allowed by logic)
                    user.username = null; // Or handle as needed
                }
            } else {
                // Prevent changing if locked AND already set
                 return res.status(403).json({ message: 'Username change is locked. Unlock the reward first.' });
            }
        }

        const updatedUser = await user.save();

        // Return updated user data (excluding sensitive fields)
        // Make sure to return all fields the frontend expects after an update
        res.status(200).json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            points: updatedUser.points,
            level: updatedUser.level,
            tasksCompleted: updatedUser.tasksCompleted,
            currentXP: updatedUser.currentXP,
            xpForNextLevel: updatedUser.xpForNextLevel,
            profilePictureUrl: updatedUser.profilePictureUrl,
            theme: updatedUser.theme,
            badges: updatedUser.badges,
            createdAt: updatedUser.createdAt,
            username: updatedUser.username,
            unlockedRewardIds: updatedUser.unlockedRewardIds,
            equippedAvatarId: updatedUser.equippedAvatarId,
            tier: updatedUser.tier, // Ensure tier is returned here as well
        });

    } catch (error) {
        console.error('Error updating user profile:', error);
        if (error.code === 11000) { // Handle unique constraint errors (email/username)
            return res.status(400).json({ message: 'Email or Username already exists.' });
        }
         if (error.name === 'ValidationError') {
             return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server Error updating profile' });
    }
};

// Upload profile picture
// @route   POST /api/users/profile/picture
// @access  Private
export const uploadProfilePicture = async (req, res) => {
    try {
        // Check if multer middleware encountered an error (like wrong file type)
        if (req.multerError) {
             return res.status(400).json({ message: req.multerError.message || 'File upload error.' });
        }
        if (!req.file) {
            return res.status(400).json({ message: 'No image file uploaded.' });
        }

        // Construct the URL path based on the filename and static serving path
        // req.file.filename is provided by multer.diskStorage
        const imageUrl = `/uploads/profile_pics/${req.file.filename}`;

        // Find the user to potentially delete the old picture
        const user = await User.findById(req.user._id);
        if (!user) {
            // If user not found, attempt to delete the newly uploaded file
            const newFilePath = path.join(__dirname, '..', 'uploads', 'profile_pics', req.file.filename);
            fs.unlink(newFilePath, (err) => {
                if (err) console.error(`Error deleting orphaned upload ${newFilePath}:`, err);
            });
            return res.status(404).json({ message: 'User not found' });
        }

        const oldImageUrl = user.profilePictureUrl;

        // Update user with the new image URL path
        user.profilePictureUrl = imageUrl;
        const updatedUser = await user.save();

        // Delete the OLD local profile picture file asynchronously
        if (oldImageUrl && oldImageUrl.startsWith('/uploads/')) {
            // Construct the local file path for the old image relative to project root
            const oldFilePath = path.join(__dirname, '..', oldImageUrl); // Go up one level from controllers
            fs.unlink(oldFilePath, (err) => { // Use callback version for fire-and-forget
                if (err && err.code !== 'ENOENT') { // Log error unless it's 'file not found'
                    console.error(`Error deleting old local profile picture file ${oldFilePath}:`, err);
                } else if (!err) {
                    console.log(`Deleted old local profile picture file: ${oldFilePath}`);
                }
            });
        }

        console.log(`Profile picture updated for user ${updatedUser.email}`);
        // Send back the updated user object or just the URL
        res.status(200).json({
             profilePictureUrl: updatedUser.profilePictureUrl
             // Optionally return the full updated user object:
             // user: { _id: updatedUser._id, name: updatedUser.name, ..., profilePictureUrl: updatedUser.profilePictureUrl }
        });

    } catch (error) {
        console.error('Error uploading profile picture:', error);
        // Handle specific multer errors if needed (though middleware catches most now)
        // if (error instanceof multer.MulterError) {
        //     return res.status(400).json({ message: `File upload error: ${error.message}` });
        // }
        res.status(500).json({ message: 'Server Error uploading picture', error: error.message });
    }
};

// Delete current user's profile
// @route   DELETE /api/users/profile
// @access  Private
export const deleteUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const userId = user._id;
        const userEmail = user.email;
        const profilePicUrl = user.profilePictureUrl;

        // 1. Delete associated data (e.g., Tasks) - Optional, uncomment if needed
        // await Task.deleteMany({ user: userId });
        // console.log(`Deleted tasks for user ${userEmail}`);

        // 2. Delete local profile picture file (if exists) - Await this
        if (profilePicUrl && profilePicUrl.startsWith('/uploads/')) {
            // Construct the local file path relative to project root
            const filePath = path.join(__dirname, '..', profilePicUrl); // Go up one level from controllers
            try {
                // Use fs.promises for async/await compatibility
                await fs.promises.unlink(filePath);
                console.log(`Deleted local profile picture file: ${filePath}`);
            } catch (fileError) {
                if (fileError.code !== 'ENOENT') { // Ignore 'file not found' errors
                     console.error(`Error deleting local profile picture file ${filePath}:`, fileError);
                     // Log error but continue deletion process
                }
            }
        }

        // 3. Delete the user document - Await this
        await user.deleteOne();

        console.log(`User account deleted: ${userEmail} (ID: ${userId})`);
        res.status(200).json({ message: 'Account deleted successfully' });

    } catch (error) {
        console.error('Error deleting user profile:', error);
        res.status(500).json({ message: 'Server Error deleting account' });
    }
};

// Upgrade user's subscription tier
// @route   PUT /api/users/profile/upgrade-tier
// @access  Private
export const upgradeUserTier = async (req, res) => {
    const { targetTierId } = req.body; // e.g., 'silver', 'gold'
    const userId = req.user._id;

    if (!targetTierId || !TIERS_CONFIG[targetTierId]) {
        return res.status(400).json({ message: 'Invalid target tier specified.' });
    }

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const currentTierId = user.tier || 'free';
        const targetTierConfig = TIERS_CONFIG[targetTierId];
        const currentTierConfig = TIERS_CONFIG[currentTierId];

        // Check if already at or above the target tier
        if (currentTierConfig.order >= targetTierConfig.order) {
            return res.status(400).json({ message: `You are already at the ${targetTierConfig.name} or higher.` });
        }

        // Check if user has enough points
        // This assumes pointsRequired is the total points needed for that tier,
        // and the cost is the full amount for that tier.
        // If you want incremental cost (cost to upgrade FROM current TO target),
        // the calculation would be: targetTierConfig.pointsRequired - currentTierConfig.pointsRequired
        // For simplicity, we'll use the full pointsRequired of the target tier as the cost.
        const costToUpgrade = targetTierConfig.pointsRequired;

        if (user.points < costToUpgrade) {
            return res.status(400).json({ message: `Insufficient points to upgrade to ${targetTierConfig.name}. You need ${costToUpgrade} points.` });
        }

        // Deduct points and update tier
        user.points -= costToUpgrade;
        user.tier = targetTierId;

        const updatedUser = await user.save();

        console.log(`User ${user.email} upgraded to ${targetTierConfig.name}. Points deducted: ${costToUpgrade}`);

        // Return the full updated user profile, similar to getUserProfile
        // Ensure all fields expected by the frontend AuthContext and profile pages are included
        res.status(200).json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            points: updatedUser.points,
            level: updatedUser.level,
            tasksCompleted: updatedUser.tasksCompleted,
            currentXP: updatedUser.currentXP,
            xpForNextLevel: updatedUser.xpForNextLevel,
            lastBonusClaim: updatedUser.lastBonusClaim,
            profilePictureUrl: updatedUser.profilePictureUrl,
            theme: updatedUser.theme,
            badges: updatedUser.badges,
            createdAt: updatedUser.createdAt,
            username: updatedUser.username,
            unlockedRewardIds: updatedUser.unlockedRewardIds || [],
            equippedAvatarId: updatedUser.equippedAvatarId || null,
            tier: updatedUser.tier,
        });

    } catch (error) {
        console.error('Error upgrading user tier:', error);
        res.status(500).json({ message: 'Server error during tier upgrade.' });
    }
};
