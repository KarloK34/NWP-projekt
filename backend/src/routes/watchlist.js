const express = require('express');
const { authenticate } = require('../middleware/auth');
const watchlistController = require('../controllers/watchlistController');

const router = express.Router();

router.get('/', authenticate, watchlistController.getWatchlist);
router.post('/:toolId', authenticate, watchlistController.addToWatchlist);
router.delete('/:toolId', authenticate, watchlistController.removeFromWatchlist);

module.exports = router;
