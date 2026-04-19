/**
 * Not Found Middleware
 * Handles 404 errors
 */
export function notFound(req, res, next) {
  res.status(404);
  next(new Error(`Not found - ${req.originalUrl}`));
}

/**
 * Error Handler Middleware
 * Centralizes error handling and sends consistent error responses
 */
export function errorHandler(err, req, res, next) {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message || "Server Error",
  });
}