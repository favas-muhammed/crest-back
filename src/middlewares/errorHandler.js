// Global error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Mongoose validation error
  if (err.name === "ValidationError") {
    return res.status(400).json({
      message: "Validation Error",
      errors: Object.values(err.errors).map((error) => error.message),
    });
  }

  // JWT authentication error
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      message: "Invalid token",
    });
  }

  // JWT token expired error
  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      message: "Token expired",
    });
  }

  // MongoDB duplicate key error
  if (err.code === 11000) {
    return res.status(400).json({
      message: "Duplicate entry found",
    });
  }

  // Default error
  res.status(500).json({
    message: "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { error: err.message }),
  });
};

module.exports = errorHandler;
