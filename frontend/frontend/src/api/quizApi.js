// frontend/src/api/quizApi.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '/api';

/**
 * Fetches quiz questions from the backend.
 * @param {string} token - User's auth token.
 * @param {number} level - The quiz level for which to fetch questions.
 * @param {number} count - The number of questions to fetch for the level (e.g., 5).
 * @returns {Promise<Array>} A promise that resolves to an array of question objects.
 */
export const fetchQuizQuestions = async (token, level, count = 5) => {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        level, // Add level to params
        count,
      },
    };
    // Assuming your backend endpoint for questions is /api/quiz/questions
    const response = await axios.get(`${API_URL}/quiz/questions`, config);
    // Ensure your backend returns an array of questions directly, or an object like { questions: [...] }
    // If it's an object, you might need to return response.data.questions
    return response.data;
  } catch (error) {
    console.error('Error fetching quiz questions:', error.response || error.message);
    throw error.response?.data?.message || error.message || 'Failed to fetch quiz questions.';
  }
};

/**
 * Submits the user's quiz level completion data to the backend.
 * @param {string} token - User's auth token.
 * @param {number} level - The level that was completed/attempted.
 * @param {number} score - The score earned by the user in the quiz for that level.
 * @param {boolean} passed - Whether the user passed the level.
 * @returns {Promise<Object>} A promise that resolves to the updated user data or a success message.
 */
export const completeQuizLevel = async (token, level, score, passed) => {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    // Assuming a new backend endpoint or an updated one for level completion
    const response = await axios.post(`${API_URL}/quiz/level-complete`, { level, score, passed }, config);
    return response.data; // Assuming backend returns updated user or success message
  } catch (error) {
    console.error('Error submitting quiz level completion:', error.response || error.message);
    throw error.response?.data?.message || error.message || 'Failed to submit quiz level completion.';
  }
};
