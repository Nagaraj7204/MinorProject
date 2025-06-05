// backend/controllers/feedbackController.js
import Feedback from '../models/Feedback.js';
import User from '../models/User.js';
import sendEmail from '../utils/sendEmail.js'; // Import the email utility

// @desc    Submit new feedback or bug report
// @route   POST /api/feedback
// @access  Private (User)
const submitFeedback = async (req, res) => {
  const { type, message } = req.body;

  if (!type || !message) {
    return res.status(400).json({ message: 'Type and message are required.' });
  }

  if (!['feedback', 'bug'].includes(type)) {
    return res.status(400).json({ message: 'Invalid feedback type.' });
  }

  try {
    const feedback = new Feedback({
      user: req.user._id, // Comes from 'protect' middleware
      type,
      message,
      status: 'open', // Default status
    });

    const createdFeedback = await feedback.save();

    // Send acknowledgment email to the user
    if (req.user && req.user.email) {
      const subject = `Your Workopoly Feedback Received (ID: ${createdFeedback._id})`;
      const messagePreview = message.length > 50 ? message.substring(0, 47) + "..." : message;
      
      const emailHtmlContent = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <p>Hi ${req.user.name || req.user.username || 'User'},</p>
          <p>Thank you for submitting your <strong>${type} report</strong> to Workopoly. We've received it and our team will review it shortly.</p>
          <p><strong>Your Submission:</strong></p>
          <blockquote style="border-left: 4px solid #ccc; padding-left: 1em; margin-left: 0.5em;">
            <em>"${messagePreview}"</em>
          </blockquote>
          <p><strong>Ticket ID:</strong> ${createdFeedback._id}</p>
          <p>We appreciate your help in making Workopoly better!</p>
          <p>Sincerely,<br>The Workopoly Team</p>
        </div>
      `;
      const emailTextContent = `Hi ${req.user.name || req.user.username || 'User'},\n\nThank you for submitting your ${type} report to Workopoly. We've received it and our team will review it shortly.\n\nYour Submission: "${messagePreview}"\nTicket ID: ${createdFeedback._id}\n\nWe appreciate your help in making Workopoly better!\n\nSincerely,\nThe Workopoly Team`;

      await sendEmail({ email: req.user.email, subject, message: emailTextContent, html: emailHtmlContent });
    }

    res.status(201).json({
        message: 'Feedback submitted successfully!',
        feedback: createdFeedback
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(val => val.message);
        return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server error submitting feedback.' });
  }
};

export { submitFeedback };
