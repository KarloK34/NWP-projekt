const express = require('express');
const { body } = require('express-validator');
const {
  getTools,
  getToolById,
  createTool,
  updateTool,
  deleteTool,
  getToolsStats,
} = require('../controllers/toolsController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

const router = express.Router();

const pricingEnum = ['free', 'paid', 'freemium'];

const toolValidation = [
  body('name')
    .isString()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name mora imati 2-100 znakova'),
  body('description')
    .isString()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Opis mora imati 10-2000 znakova'),
  body('websiteUrl')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage('websiteUrl predugačak'),
  body('pricing')
    .optional()
    .isIn(pricingEnum)
    .withMessage(`pricing mora biti jedan od: ${pricingEnum.join(', ')}`),
  body('category')
    .isString()
    .notEmpty()
    .withMessage('category je obavezna'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('tags mora biti array'),
  body('models')
    .optional()
    .isArray()
    .withMessage('models mora biti array'),
  body('isPublished')
    .optional()
    .isBoolean()
    .withMessage('isPublished mora biti boolean'),
];

// Public
router.get('/', getTools);
router.get('/:id', getToolById);

// Admin
router.get('/stats', authenticate, authorizeAdmin, getToolsStats);
router.post('/', authenticate, authorizeAdmin, toolValidation, createTool);
router.put('/:id', authenticate, authorizeAdmin, toolValidation, updateTool);
router.delete('/:id', authenticate, authorizeAdmin, deleteTool);

module.exports = router;
