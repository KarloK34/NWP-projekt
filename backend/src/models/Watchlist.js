const mongoose = require('mongoose');

const watchlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Molimo unesite korisnika'],
      unique: true, // One watchlist per user
    },
    tools: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tool',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
watchlistSchema.index({ user: 1 });

module.exports = mongoose.model('Watchlist', watchlistSchema);

