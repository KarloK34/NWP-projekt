const express = require('express');
const { body } = require('express-validator');
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const modelsController = require('../controllers/modelsController');

const router = express.Router();

router.get('/models', modelsController.getModels);

router.post(
  '/models',
  authenticate,
  authorizeAdmin,
  [
    body('name').isString().trim().isLength({ min: 1, max: 80 }).withMessage('Name 1-80'),
    body('provider').optional().isString().trim().isLength({ max: 80 }),
    body('version').optional().isString().trim().isLength({ max: 40 }),
    body('source').optional().isString().trim().isLength({ max: 40 }),
    body('huggingFaceModelId').optional().isString().trim().isLength({ max: 200 }),
  ],
  modelsController.createModel
);

module.exports = router;
