// src/middleware/errorHandler.js

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message || err);

  // Handle Firebase/Firestore specific errors
  if (err.code === 'permission-denied') {
    return res.status(403).json({ error: 'Permission denied' });
  }

  // Handle validation errors
  if (err.code === 'invalid-argument') {
    return res.status(400).json({ error: err.message });
  }

  // Default server error
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
};

module.exports = { errorHandler };