const express = require('express');
const { body } = require('express-validator');
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const tagsController = require('../controllers/tagsController');

const router = express.Router();

router.get('/tags', tagsController.getTags);

router.post(
  '/tags',
  authenticate,
  authorizeAdmin,
  [
    body('name').isString().trim().isLength({ min: 1, max: 40 }).withMessage('Name 1-40'),
    body('type').optional().isString().trim().isLength({ max: 30 }).withMessage('Type max 30'),
    body('color').optional().isString().trim().isLength({ max: 30 }).withMessage('Color max 30'),
  ],
  tagsController.createTag
);

module.exports = router;
