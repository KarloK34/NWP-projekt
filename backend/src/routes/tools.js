const express = require('express');
const { body } = require('express-validator');
const {
  getTools,
  getToolById,
  createTool,
  updateTool,
  deleteTool,
  getToolsStats,
  enrichTool,
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
  body('website')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage('website predugačak'),
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
  body('logo')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage('logo predugačak'),
  body('metadata')
    .optional()
    .isObject()
    .withMessage('metadata mora biti objekt'),
  body('metadata.githubUrl')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 500 }),
  body('metadata.huggingFaceUrl')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 500 }),
  body('metadata.apiDocumentation')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 500 }),
];

// Public
router.get('/', getTools);
// Admin – mora biti ispred GET /:id da /stats ne hvata getToolById
router.get('/stats', authenticate, authorizeAdmin, getToolsStats);
router.get('/:id', getToolById);

// Admin
router.post('/', authenticate, authorizeAdmin, toolValidation, createTool);
router.put('/:id', authenticate, authorizeAdmin, toolValidation, updateTool);
router.delete('/:id', authenticate, authorizeAdmin, deleteTool);
router.post('/:id/enrich', authenticate, authorizeAdmin, enrichTool);

module.exports = router;
