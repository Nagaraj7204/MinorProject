// src/pages/UserFeedbackPage.jsx
import React, { useState } from 'react';
import styles from './UserFeedbackPage.module.css'; // Create this CSS module
import { FaPaperPlane, FaBug, FaLightbulb } from 'react-icons/fa';

// Helper function to get auth token
const getAuthToken = () => {
  const userInfoString = localStorage.getItem('userInfo');
  if (userInfoString) {
    try {
      const userInfo = JSON.parse(userInfoString);
      return userInfo?.token || null;
    } catch (e) {
      console.error("Error parsing userInfo from localStorage:", e);
      return null;
    }
  }
  return null;
};


const UserFeedbackPage = () => {
  const [feedbackType, setFeedbackType] = useState('feedback'); // 'feedback' or 'bug'
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      setError('Please enter your message before submitting.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccessMessage('');

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('You must be logged in to submit feedback.');
      }

      const response = await fetch('/api/feedback', { // New endpoint
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ type: feedbackType, message }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to submit feedback. Please try again.');
      }

      setSuccessMessage('Thank you! Your feedback has been submitted successfully.');
      setMessage(''); // Clear the form
      setFeedbackType('feedback'); // Reset type
    } catch (err) {
      console.error('Feedback submission error:', err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.feedbackPageContainer}>
      <div className={styles.feedbackFormCard}>
        <h1 className={styles.pageTitle}>
          {feedbackType === 'bug' ? <FaBug /> : <FaLightbulb />}
          Submit Feedback or Report a Bug
        </h1>
        <p className={styles.subTitle}>We value your input! Let us know how we can improve or if you've found an issue.</p>

        {error && <p className={styles.errorMessage}>{error}</p>}
        {successMessage && <p className={styles.successMessage}>{successMessage}</p>}

        <form onSubmit={handleSubmit} className={styles.feedbackForm}>
          <div className={styles.formGroup}>
            <label htmlFor="feedbackType" className={styles.label}>Type:</label>
            <select
              id="feedbackType"
              value={feedbackType}
              onChange={(e) => setFeedbackType(e.target.value)}
              className={styles.selectInput}
            >
              <option value="feedback">General Feedback</option>
              <option value="bug">Bug Report</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="message" className={styles.label}>Your Message:</label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={feedbackType === 'bug' ? "Please describe the bug in detail, including steps to reproduce it if possible." : "Share your thoughts, suggestions, or ideas..."}
              rows="6"
              className={styles.textareaInput}
              required
            />
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : <><FaPaperPlane /> Submit</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserFeedbackPage;
