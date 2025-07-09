// middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
  console.error("Caught by error handler:", err.stack);

  // Check for specific error types or codes
  if (err.name === "AxiosError" && err.response) {
    return res.status(err.response.status).json({
      success: false,
      message: `External API error: ${err.response.status} - ${
        err.response.data?.msg || err.message
      }`,
    });
  }

  // Handle Multer errors
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ success: false, message: err.message });
  }

  // Generic server error
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "An unexpected server error occurred.",
  });
};

module.exports = errorHandler;
