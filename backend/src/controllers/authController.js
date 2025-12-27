const { validationResult } = require('express-validator');
const User = require('../models/User');
const { ValidationError, AuthError } = require('../middleware/errorHandler');

/**
 * Register new user
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Greška pri validaciji',
        errors: errors.array(),
      });
    }

    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Korisnik s ovim emailom ili korisničkim imenom već postoji.',
      });
    }

    // Create user (password will be hashed by pre-save hook)
    const user = await User.create({
      username,
      email,
      password,
      role: 'user', // Default role
    });

    // Generate JWT token
    const token = user.generateJWT();

    // Return user data (without password) and token
    res.status(201).json({
      success: true,
      message: 'Registracija uspješna',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Greška pri validaciji',
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;

    // Find user by email and include password (since it's select: false by default)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Nevažeći email ili lozinka.',
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Nevažeći email ili lozinka.',
      });
    }

    // Generate JWT token
    const token = user.generateJWT();

    // Return user data (without password) and token
    res.status(200).json({
      success: true,
      message: 'Prijava uspješna',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user
 * GET /api/auth/me
 * Protected route - requires authentication
 */
const getMe = async (req, res, next) => {
  try {
    // User is already attached to req by authenticate middleware
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Korisnik nije pronađen.',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh token (optional - for future implementation)
 * POST /api/auth/refresh
 */
const refreshToken = async (req, res, next) => {
  try {
    // For now, just return a message that refresh is not implemented
    // In the future, this could validate a refresh token and issue a new access token
    res.status(501).json({
      success: false,
      message: 'Refresh token funkcionalnost još nije implementirana.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  refreshToken,
};

