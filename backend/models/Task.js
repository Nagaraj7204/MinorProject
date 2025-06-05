// c:/Users/misba/OneDrive/Documents/workopoly1_proj/backend/models/Task.js
import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Correct: Reference the Model name directly
      required: true, // Recommended: Ensures tasks are linked to users
    },
    title: {
      type: String,
      required: [true, "Task title is required"],
    },
    description: {
      type: String,
    },
    // Use 'completed' boolean to match frontend
    completed: {
      type: Boolean,
      default: false,
    },
    // Add 'priority' field to match frontend form
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'], // Match frontend options
      default: 'Medium',
    },
    dueDate: {
      type: Date,
    },
    points: {
      type: Number,
      default: 10, // Points earned upon task completion (can be adjusted in controller)
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields automatically
  }
);

const Task = mongoose.model("Task", taskSchema);

export default Task;
