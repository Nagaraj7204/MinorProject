// backend/models/Feedback.js
import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User', // Reference to the User model
    },
    type: {
      type: String,
      required: true,
      enum: ['feedback', 'bug'], // Allowed types
    },
    message: {
      type: String,
      required: [true, 'Please provide a message for your feedback.'],
      trim: true,
      minlength: [10, 'Message must be at least 10 characters long.'],
      maxlength: [1000, 'Message cannot exceed 1000 characters.'],
    },
    status: {
      type: String,
      required: true,
      enum: ['open', 'in-progress', 'closed'],
      default: 'open',
    },
    reply: {
      type: String,
      trim: true,
      default: null,
    },
    repliedBy: { // Admin who replied
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    repliedAt: {
        type: Date,
        default: null,
    }
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

const Feedback = mongoose.model('Feedback', feedbackSchema);

export default Feedback;
