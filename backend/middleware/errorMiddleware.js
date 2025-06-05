// middleware/errorMiddleware.js

// Middleware for handling 404 Not Found errors
const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error); // Pass the error to the next error handling middleware
  };
  
  // General error handling middleware
  // This should be the last middleware added in server.js
  const errorHandler = (err, req, res, next) => {
    // Sometimes an error might come in with a 200 status code, default to 500
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({
      message: err.message,
      // Show stack trace only in development mode for debugging
      stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
  };
  
  export { notFound, errorHandler };