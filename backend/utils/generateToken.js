import jwt from "jsonwebtoken";

const generateToken = (userId) => { // Changed parameter name for clarity, though not strictly necessary
    return jwt.sign({ userId: userId }, process.env.JWT_SECRET, { // Changed claim from 'id' to 'userId'
        expiresIn: "30d", // Or your preferred expiration
    });
};

export default generateToken;
