const express = require('express');
const { body } = require('express-validator');
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const modelsController = require('../controllers/modelsController');

const router = express.Router();

router.get('/', modelsController.getModels);
router.get('/hf/search', modelsController.hfSearchModels);
router.post(
  '/',
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

router.put(
  '/:id',
  authenticate,
  authorizeAdmin,
  [
    body('name').optional().isString().trim().isLength({ min: 1, max: 80 }).withMessage('Name 1-80'),
    body('provider').optional().isString().trim().isLength({ max: 80 }),
    body('version').optional().isString().trim().isLength({ max: 40 }),
    body('source').optional().isString().trim().isLength({ max: 40 }),
    body('huggingFaceModelId').optional().isString().trim().isLength({ max: 200 }),
  ],
  modelsController.updateModel
);

router.delete('/:id', authenticate, authorizeAdmin, modelsController.deleteModel);

module.exports = router;
