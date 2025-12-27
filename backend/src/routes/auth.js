const express = require('express');
const { body } = require('express-validator');
const {
  register,
  login,
  getMe,
  refreshToken,
} = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

/**
 * Validation rules for registration
 */
const registerValidation = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Korisničko ime mora imati između 3 i 30 znakova')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Korisničko ime može sadržavati samo slova, brojeve i podvlake'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Molimo unesite valjanu email adresu')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Lozinka mora imati najmanje 6 znakova')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      'Lozinka mora sadržavati najmanje jedno malo slovo, jedno veliko slovo i jedan broj'
    ),
];

/**
 * Validation rules for login
 */
const loginValidation = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Molimo unesite valjanu email adresu')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Molimo unesite lozinku'),
];

/**
 * @route   POST /api/auth/register
 * @desc    Register new user
 * @access  Public
 */
router.post('/register', registerValidation, register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', loginValidation, login);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 */
router.get('/me', authenticate, getMe);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh JWT token
 * @access  Public (optional - can be protected)
 */
router.post('/refresh', refreshToken);

module.exports = router;

