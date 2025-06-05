// c:/Users/misba/OneDrive/Documents/workopoly1_proj/backend/middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler'; // Handles async errors
import User from '../models/User.js'; // Import User model to find user by ID

// Middleware to protect routes - verifies token and attaches user to req
const protect = asyncHandler(async (req, res, next) => { // Renamed to 'protect' and added asyncHandler
    let token;

    // Check if Authorization header exists and starts with 'Bearer'
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Get token from header (Bearer TOKEN)
            token = req.headers.authorization.split(' ')[1];

            // Verify token using the secret key
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from the token payload (ID) and attach to request
            // Exclude password from the user object attached to req
            req.user = await User.findById(decoded.userId).select('-password'); // Use userId to match token payload

            if (!req.user) {
                // Handle case where user associated with token no longer exists
                res.status(401);
                throw new Error('Not authorized, user not found');
            }

            next(); // Proceed to the next middleware or route handler
        } catch (error) {
            console.error('Token verification failed:', error);
            res.status(401); // Unauthorized
            throw new Error('Not authorized, token failed'); // Use throw for asyncHandler
        }
    }

    if (!token) { // Moved the !token check outside the main if block
        res.status(401); // Unauthorized
        throw new Error('Not authorized, no token');
    }
});

// Middleware to check for admin role (should be used AFTER protect)
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next(); // User is admin, proceed
  } else {
    res.status(403); // Forbidden
    throw new Error('Not authorized as an admin');
  }
};

// Use named exports
export { protect, admin };
