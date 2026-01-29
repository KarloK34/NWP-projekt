const express = require('express');
const { body } = require('express-validator');
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const categoriesController = require('../controllers/categoriesController');

const router = express.Router();

router.get('/', categoriesController.getCategories);

router.post(
  '/',
  authenticate,
  authorizeAdmin,
  [
    body('name').isString().trim().isLength({ min: 2, max: 80 }).withMessage('Name mora imati 2-80 znakova'),
    body('description').optional().isString().isLength({ max: 500 }).withMessage('Opis max 500 znakova'),
  ],
  categoriesController.createCategory
);

router.put(
  '/:id',
  authenticate,
  authorizeAdmin,
  [
    body('name').optional().isString().trim().isLength({ min: 2, max: 80 }).withMessage('Name mora imati 2-80 znakova'),
    body('description').optional().isString().isLength({ max: 500 }).withMessage('Opis max 500 znakova'),
  ],
  categoriesController.updateCategory
);

router.delete('/:id', authenticate, authorizeAdmin, categoriesController.deleteCategory);

module.exports = router;
