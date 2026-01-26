const express = require('express');
const { body } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const reviewsController = require('../controllers/reviewsController');

const router = express.Router();

// GET /api/tools/:toolId/reviews
router.get('/tools/:toolId/reviews', reviewsController.getToolReviews);

// POST /api/tools/:toolId/reviews (auth)
router.post(
  '/tools/:toolId/reviews',
  authenticate,
  [
    body('rating')
      .isInt({ min: 1, max: 5 })
      .withMessage('Ocjena mora biti između 1 i 5'),
    body('comment')
      .optional()
      .isString()
      .isLength({ max: 2000 })
      .withMessage('Komentar može imati maksimalno 2000 znakova'),
    body('pros').optional().isArray().withMessage('Pros mora biti niz'),
    body('cons').optional().isArray().withMessage('Cons mora biti niz'),
  ],
  reviewsController.createReview
);

// PUT /api/reviews/:id (auth)
router.put(
  '/reviews/:id',
  authenticate,
  [
    body('rating')
      .optional()
      .isInt({ min: 1, max: 5 })
      .withMessage('Ocjena mora biti između 1 i 5'),
    body('comment')
      .optional()
      .isString()
      .isLength({ max: 2000 })
      .withMessage('Komentar može imati maksimalno 2000 znakova'),
    body('pros').optional().isArray().withMessage('Pros mora biti niz'),
    body('cons').optional().isArray().withMessage('Cons mora biti niz'),
  ],
  reviewsController.updateReview
);

// DELETE /api/reviews/:id (auth)
router.delete('/reviews/:id', authenticate, reviewsController.deleteReview);

module.exports = router;
