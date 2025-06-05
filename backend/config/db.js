// c:\Users\misba\OneDrive\Documents\backend\backend\config\db.js
import mongoose from "mongoose";
import dotenv from 'dotenv'; // Import dotenv if you use process.env here

// Ensure dotenv is configured if you rely on process.env.MONGO_URI here
// It's often better to configure dotenv once in your main server file (server.js)
// dotenv.config(); // Usually not needed here if done in server.js

const connectDB = async () => {
    try {
        // Make sure MONGO_URI is loaded from .env before this runs
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI not defined in environment variables');
        }
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            // useNewUrlParser and useUnifiedTopology are deprecated and default to true
            // You might not need them depending on your Mongoose version
            // useNewUrlParser: true, // Remove if using Mongoose 6+
            // useUnifiedTopology: true, // Remove if using Mongoose 6+
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        process.exit(1); // Exit process with failure
    }
};

// Use ES Module export default
export default connectDB;
