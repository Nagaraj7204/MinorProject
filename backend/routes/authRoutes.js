// c:/Users/misba/OneDrive/Documents/workopoly1_proj/backend/routes/authRoutes.js
import express from 'express';
import User from '../models/User.js'; // Adjust path if necessary
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';

const router = express.Router();
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const JWT_SECRET = process.env.JWT_SECRET;
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

router.post('/google-signin', async (req, res) => {
    const { token: googleIdToken } = req.body;
    console.log("Backend: Received Google ID Token for processing:", googleIdToken ? "Present" : "Missing");

    if (!googleIdToken) {
        return res.status(400).json({ message: 'Google ID Token not provided.' });
    }

    try {
        const ticket = await googleClient.verifyIdToken({
            idToken: googleIdToken,
            audience: GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        console.log("Backend: Google Token Payload from Google:", JSON.stringify(payload, null, 2));

        if (!payload || !payload.email_verified || !payload.email || !payload.sub) {
            return res.status(400).json({ message: 'Invalid Google token or email not verified.' });
        }
        
        const { sub: googleIdFromToken, email: emailFromToken, name: nameFromToken, picture: profilePictureUrlFromGoogle, email_verified } = payload;
        console.log(`Backend: Details from Google Token - googleId: ${googleIdFromToken}, email: ${emailFromToken}, name: ${nameFromToken}`);

        if (!email_verified) {
            return res.status(400).json({ message: 'Google email not verified.' });
        }

        let user; 

        console.log(`Backend: Attempting to find user by googleId: ${googleIdFromToken}`);
        user = await User.findOne({ googleId: googleIdFromToken });

        if (user) {
            console.log(`Backend: Found existing user by googleId: ${user.email}, ID: ${user._id}`);
            // Optionally update name/picture if they've changed in Google
            if (user.name !== nameFromToken && nameFromToken) user.name = nameFromToken;
            if (user.profilePictureUrl !== profilePictureUrlFromGoogle && profilePictureUrlFromGoogle) user.profilePictureUrl = profilePictureUrlFromGoogle;
            if (!user.isVerified) user.isVerified = true; // Should be true if found by googleId
            // Consider if a save is needed if details were updated and changed
            // if (user.isModified()) await user.save();
        } else {
            console.log(`Backend: User not found by googleId. Attempting to find by email: ${emailFromToken}`);
            user = await User.findOne({ email: emailFromToken });

            if (user) {
                console.log(`Backend: Found existing user by email: ${user.email}, ID: ${user._id}. Linking googleId.`);
                // Link Google ID to existing account
                user.googleId = googleIdFromToken;
                if (!user.name && nameFromToken) user.name = nameFromToken; // Set name if not already set
                if (!user.profilePictureUrl && profilePictureUrlFromGoogle) user.profilePictureUrl = profilePictureUrlFromGoogle; // Set picture if not set
                user.isVerified = true; // Mark as verified
                await user.save();
                console.log(`Backend: Linked Google ID to existing email. User after save:`, JSON.stringify(user, null, 2));
            } else {
                console.log(`Backend: No user found by email. Creating new user for email: ${emailFromToken}`);
                user = await User.create({
                    googleId: googleIdFromToken,
                    email: emailFromToken,
                    name: nameFromToken,
                    profilePictureUrl: profilePictureUrlFromGoogle,
                    isVerified: true,
                    role: 'user',
                    // points will default to 0 based on your User model
                    // tier will default to 'free' based on your User model
                });
                console.log(`Backend: New user created:`, JSON.stringify(user, null, 2));
            }
        }

        console.log(`Backend: CRITICAL CHECK - User object before token generation: ID: ${user?._id}, Email: ${user?.email}, Name: ${user?.name}, Tier: ${user?.tier}, Points: ${user?.points}`);

        if (!user || !user._id) {
            console.error("Backend: CRITICAL ERROR - User object is invalid or missing before token generation.");
            return res.status(500).json({ message: "Failed to identify or create user." });
        }

        const appTokenPayload = {
            userId: user._id,
            email: user.email,
            role: user.role,
        };
        console.log("Backend: App Token Payload to be signed:", appTokenPayload);

        const appToken = jwt.sign(appTokenPayload, JWT_SECRET, { expiresIn: '7d' });

        const userDataForClient = {
            _id: user._id,
            id: user._id,
            name: user.name,
            email: user.email,
            username: user.username,
            profilePictureUrl: user.profilePictureUrl,
            role: user.role,
            isVerified: user.isVerified,
            points: user.points, // Ensure points are included
            tier: user.tier || 'free', // Ensure tier is included
        };
        console.log("Backend: User data being sent to client:", JSON.stringify(userDataForClient, null, 2));

        res.status(200).json({
            message: 'Sign-in with Google successful',
            token: appToken,
            user: userDataForClient,
        });

    } catch (error) {
        console.error('Backend: Google Sign-In Error on Backend:', error);
        if (error.message && (error.message.includes("Invalid token") || error.message.includes("Token used too late") || error.message.includes("Wrong recipient"))) {
            return res.status(401).json({ message: 'Invalid or expired Google token.' });
        }
        res.status(500).json({ message: 'Internal server error during Google sign-in.' });
    }
});

export default router;
