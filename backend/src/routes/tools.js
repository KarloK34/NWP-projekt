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
const apiIntegrationController = require('../controllers/apiIntegrationController');

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
  body('isPublished')
    .optional()
    .isBoolean()
    .withMessage('isPublished mora biti boolean'),
];

// Public
router.get('/', getTools);

// Admin/Integration - specifične rute FIRST
router.post('/import-from-github', authenticate, authorizeAdmin, [
    body('useLocalFile').optional().isBoolean(),
    body('localFilePath').optional().isString(),
    body('categories').optional().isArray(),
    body('dryRun').optional().isBoolean(),
    body('limit').optional().isInt({ min: 1, max: 2000 }),
    body('skipWithoutWebsite').optional().isBoolean(),
  ], apiIntegrationController.importFromGithub);
router.get('/stats', authenticate, authorizeAdmin, getToolsStats);

// Tool-specific integration routes (mora prije /:id)
router.post('/:id/enrich', authenticate, authorizeAdmin, apiIntegrationController.enrichTool);
router.get('/:id/external-data', apiIntegrationController.getExternalData);

// CRUD
router.post('/', authenticate, authorizeAdmin, toolValidation, createTool);

// Public single tool LAST
router.get('/:id', getToolById);

router.put('/:id', authenticate, authorizeAdmin, toolValidation, updateTool);
router.delete('/:id', authenticate, authorizeAdmin, deleteTool);

module.exports = router;
