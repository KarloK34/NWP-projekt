const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

const Review = require('../models/Review');
const Tool = require('../models/Tool');

const isObjectId = (v) => mongoose.Types.ObjectId.isValid(v);

/**
 * Get current user's reviews (for profile page).
 * GET /api/reviews/me
 * Requires auth.
 */
const getMyReviews = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '10', 10), 1), 50);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Review.find({ user: req.user.id })
        .populate('tool', 'name _id')
        .populate('user', 'username')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Review.countDocuments({ user: req.user.id }),
    ]);

    return res.status(200).json({
      success: true,
      message: 'Recenzije uspješno dohvaćene',
      data: { page, limit, total, pages: Math.ceil(total / limit), items },
    });
  } catch (error) {
    next(error);
  }
};

const getToolReviews = async (req, res, next) => {
  try {
    const { toolId } = req.params;

    if (!isObjectId(toolId)) {
      return res.status(400).json({ success: false, message: 'Neispravan toolId.' });
    }

    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '10', 10), 1), 50);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Review.find({ tool: toolId })
        .populate('user', 'username role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Review.countDocuments({ tool: toolId }),
    ]);

    return res.status(200).json({
      success: true,
      message: 'Recenzije uspješno dohvaćene',
      data: { page, limit, total, pages: Math.ceil(total / limit), items },
    });
  } catch (error) {
    next(error);
  }
};

const createReview = async (req, res, next) => {
  try {
    const { toolId } = req.params;

    if (!isObjectId(toolId)) {
      return res.status(400).json({ success: false, message: 'Neispravan toolId.' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Greška pri validaciji',
        errors: errors.array(),
      });
    }

    // provjeri da alat postoji
    const tool = await Tool.findById(toolId).select('_id');
    if (!tool) {
      return res.status(404).json({ success: false, message: 'Alat nije pronađen.' });
    }

    // 1 review po useru po alatu
    const existing = await Review.findOne({ tool: toolId, user: req.user.id });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Već ste ostavili recenziju za ovaj alat.',
      });
    }

    const review = await Review.create({
      tool: toolId,
      user: req.user.id,
      rating: req.body.rating,
      comment: req.body.comment || '',
      pros: req.body.pros || [],
      cons: req.body.cons || [],
    });

    // Ako imate u Review modelu middleware za update Tool.rating/reviewCount, ovo je dovoljno.
    // Ako nemate, dodaj ručni recalc (dolje je helper).
    await recalcToolRating(toolId);

    const created = await Review.findById(review._id)
      .populate('user', 'username role')
      .lean();

    return res.status(201).json({
      success: true,
      message: 'Recenzija uspješno dodana',
      data: { review: created },
    });
  } catch (error) {
    next(error);
  }
};

const updateReview = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Neispravan ID recenzije.' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Greška pri validaciji',
        errors: errors.array(),
      });
    }

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Recenzija nije pronađena.' });
    }

    // samo owner može mijenjati
    if (String(review.user) !== String(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Nemate pravo uređivati ovu recenziju.' });
    }

    if (req.body.rating !== undefined) review.rating = req.body.rating;
    if (req.body.comment !== undefined) review.comment = req.body.comment;
    if (req.body.pros !== undefined) review.pros = req.body.pros;
    if (req.body.cons !== undefined) review.cons = req.body.cons;

    await review.save();
    await recalcToolRating(review.tool);

    const updated = await Review.findById(review._id)
      .populate('user', 'username role')
      .lean();

    return res.status(200).json({
      success: true,
      message: 'Recenzija uspješno ažurirana',
      data: { review: updated },
    });
  } catch (error) {
    next(error);
  }
};

const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Neispravan ID recenzije.' });
    }

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Recenzija nije pronađena.' });
    }

    // owner ili admin
    const isOwner = String(review.user) === String(req.user.id);
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Nemate pravo brisati ovu recenziju.' });
    }

    const toolId = review.tool;
    await Review.findByIdAndDelete(id);

    await recalcToolRating(toolId);

    return res.status(200).json({
      success: true,
      message: 'Recenzija obrisana',
    });
  } catch (error) {
    next(error);
  }
};

// helper: recalculates Tool.rating + Tool.reviewCount
async function recalcToolRating(toolId) {
  const stats = await Review.aggregate([
    { $match: { tool: new mongoose.Types.ObjectId(toolId) } },
    {
      $group: {
        _id: '$tool',
        avgRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 },
      },
    },
  ]);

  const avgRating = stats[0]?.avgRating ?? 0;
  const reviewCount = stats[0]?.reviewCount ?? 0;

  await Tool.findByIdAndUpdate(toolId, {
    rating: Math.round(avgRating * 10) / 10, // npr. 4.3
    reviewCount,
  });
}

module.exports = {
  getMyReviews,
  getToolReviews,
  createReview,
  updateReview,
  deleteReview,
};
