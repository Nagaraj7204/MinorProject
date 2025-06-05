import apiClient from './axiosConfig';

// Adjust the base endpoint '/api/tasks' if your backend uses a different route
const TASKS_ENDPOINT = '/api/tasks';

/**
 * Fetches all tasks for the logged-in user.
 * @returns {Promise<Array<object>>} - An array of task objects.
 */
export const fetchTasks = async () => {
  try {
    const response = await apiClient.get(TASKS_ENDPOINT);
    return response.data; // Assuming the backend returns an array of tasks
  } catch (error) {
    console.error("Fetch Tasks API error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to fetch tasks.');
  }
};

/**
 * Creates a new task.
 * @param {object} taskData - Data for the new task (e.g., { title, description, status, dueDate })
 * @returns {Promise<object>} - The newly created task object.
 */
export const createTask = async (taskData) => {
  try {
    const response = await apiClient.post(TASKS_ENDPOINT, taskData);
    return response.data; // Assuming the backend returns the created task
  } catch (error) {
    console.error("Create Task API error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to create task.');
  }
};

/**
 * Updates an existing task.
 * @param {string} taskId - The ID of the task to update.
 * @param {object} updatedData - The fields to update.
 * @returns {Promise<object>} - The updated task object.
 */
export const updateTask = async (taskId, updatedData) => {
  try {
    // Assuming the endpoint for a specific task is like /api/tasks/:id
    const response = await apiClient.put(`${TASKS_ENDPOINT}/${taskId}`, updatedData);
    return response.data; // Assuming the backend returns the updated task
  } catch (error) {
    console.error("Update Task API error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to update task.');
  }
};

/**
 * Deletes a task.
 * @param {string} taskId - The ID of the task to delete.
 * @returns {Promise<object>} - The response data from the server (often just a success message).
 */
export const deleteTask = async (taskId) => {
  try {
    // Assuming the endpoint for deleting a specific task is like /api/tasks/:id
    const response = await apiClient.delete(`${TASKS_ENDPOINT}/${taskId}`);
    return response.data; // Assuming the backend returns a confirmation or the deleted task ID
  } catch (error) {
    console.error("Delete Task API error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to delete task.');
  }
};

// You could add functions for fetching a single task by ID if needed:
// export const fetchTaskById = async (taskId) => { ... }