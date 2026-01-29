const express = require('express');
const { body } = require('express-validator');
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const usersController = require('../controllers/usersController');

const router = express.Router();

router.get('/', authenticate, authorizeAdmin, usersController.getUsers);

router.patch(
  '/:id/role',
  authenticate,
  authorizeAdmin,
  [body('role').isIn(['admin', 'user']).withMessage('Uloga mora biti admin ili user.')],
  usersController.updateUserRole
);

module.exports = router;
