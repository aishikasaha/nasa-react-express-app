const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error('Error Handler:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method
  });

  // Default error
  let error = { ...err };
  error.message = err.message;

  // NASA API rate limit error
  if (err.response && err.response.status === 429) {
    const message = 'NASA API rate limit exceeded. Please try again later.';
    return res.status(429).json({
      success: false,
      error: message
    });
  }

  // NASA API errors
  if (err.response && err.response.status >= 400) {
    const message = `NASA API Error: ${err.response.data?.error?.message || err.message}`;
    return res.status(err.response.status).json({
      success: false,
      error: message
    });
  }

  // Default server error
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;