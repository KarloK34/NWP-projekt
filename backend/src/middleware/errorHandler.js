/**
 * Custom Error Classes
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message) {
    super(message, 400);
    this.name = 'ValidationError';
  }
}

class AuthError extends AppError {
  constructor(message) {
    super(message, 401);
    this.name = 'AuthError';
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resurs nije pronađen') {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Nemate dozvolu za pristup') {
    super(message, 403);
    this.name = 'ForbiddenError';
  }
}

/**
 * Centralized Error Handler Middleware
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for debugging
  console.error('Error:', err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Nevažeći ID resursa';
    error = new ValidationError(message);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    const message = `${field} već postoji u bazi podataka`;
    error = new ValidationError(message);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    const message = messages.join(', ');
    error = new ValidationError(message);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Nevažeći token';
    error = new AuthError(message);
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token je istekao';
    error = new AuthError(message);
  }

  // Default to 500 server error
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Interna greška servera';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      error: err,
    }),
  });
};

module.exports = {
  errorHandler,
  AppError,
  ValidationError,
  AuthError,
  NotFoundError,
  ForbiddenError,
};

