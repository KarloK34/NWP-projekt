const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    tool: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tool',
      required: [true, 'Molimo unesite alat'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Molimo unesite korisnika'],
    },
    rating: {
      type: Number,
      required: [true, 'Molimo unesite ocjenu'],
      min: [1, 'Ocjena mora biti najmanje 1'],
      max: [5, 'Ocjena ne može biti veća od 5'],
    },
    comment: {
      type: String,
      required: [true, 'Molimo unesite komentar'],
      trim: true,
      maxlength: [1000, 'Komentar ne može imati više od 1000 znakova'],
    },
    pros: [
      {
        type: String,
        trim: true,
        maxlength: [200, 'Svaki prednost ne može imati više od 200 znakova'],
      },
    ],
    cons: [
      {
        type: String,
        trim: true,
        maxlength: [200, 'Svaki nedostatak ne može imati više od 200 znakova'],
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate reviews (one user can only review a tool once)
reviewSchema.index({ tool: 1, user: 1 }, { unique: true });

// Middleware to update tool rating and review count after review is saved
reviewSchema.post('save', async function () {
  await this.constructor.updateToolRating(this.tool);
});

// Middleware to update tool rating and review count after review is deleted
reviewSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    await doc.constructor.updateToolRating(doc.tool);
  }
});

// Static method to update tool rating
reviewSchema.statics.updateToolRating = async function (toolId) {
  const stats = await this.aggregate([
    {
      $match: { tool: new mongoose.Types.ObjectId(toolId) },
    },
    {
      $group: {
        _id: '$tool',
        averageRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 },
      },
    },
  ]);

  try {
    const Tool = mongoose.model('Tool');
    if (stats.length > 0) {
      await Tool.findByIdAndUpdate(toolId, {
        rating: Math.round(stats[0].averageRating * 10) / 10, // Round to 1 decimal
        reviewCount: stats[0].reviewCount,
      });
    } else {
      // No reviews, reset to default
      await Tool.findByIdAndUpdate(toolId, {
        rating: 0,
        reviewCount: 0,
      });
    }
  } catch (error) {
    console.error('Error updating tool rating:', error);
  }
};

module.exports = mongoose.model('Review', reviewSchema);

