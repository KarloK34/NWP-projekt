const express = require('express');
const { authenticate } = require('../middleware/auth');
const watchlistController = require('../controllers/watchlistController');

const router = express.Router();

router.get('/watchlist', authenticate, watchlistController.getWatchlist);
router.post('/watchlist/:toolId', authenticate, watchlistController.addToWatchlist);
router.delete('/watchlist/:toolId', authenticate, watchlistController.removeFromWatchlist);

module.exports = router;
