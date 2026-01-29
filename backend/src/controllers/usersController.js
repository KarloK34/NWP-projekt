const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const User = require('../models/User');

const isObjectId = (v) => mongoose.Types.ObjectId.isValid(v);

const clampInt = (val, def, min, max) => {
  const n = parseInt(val, 10);
  if (Number.isNaN(n)) return def;
  return Math.max(min, Math.min(max, n));
};

/**
 * GET /api/users (admin)
 * Query: page, limit, search (username/email)
 */
const getUsers = async (req, res, next) => {
  try {
    const page = clampInt(req.query.page, 1, 1, 10000);
    const limit = clampInt(req.query.limit, 20, 1, 100);
    const skip = (page - 1) * limit;
    const search = (req.query.search && String(req.query.search).trim()) || '';

    const filter = {};
    if (search.length > 0) {
      const re = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ username: re }, { email: re }];
    }

    const [items, total] = await Promise.all([
      User.find(filter).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      User.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      message: 'Korisnici dohvaćeni',
      data: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        items,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/users/:id/role (admin)
 * Body: { role: 'admin' | 'user' }
 * Ne dopusti promjenu role samome sebi.
 */
const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Neispravan ID korisnika.' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Greška pri validaciji', errors: errors.array() });
    }

    const currentUserId = String(req.user?.id || req.user?._id);
    if (currentUserId === id) {
      return res.status(400).json({
        success: false,
        message: 'Ne možete promijeniti vlastitu ulogu.',
      });
    }

    const role = req.body.role;
    if (!['admin', 'user'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Uloga mora biti admin ili user.' });
    }

    const user = await User.findById(id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'Korisnik nije pronađen.' });
    }

    if (user.role === 'admin' && role === 'user') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Ne možete ukloniti posljednjeg administratora.',
        });
      }
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Uloga korisnika ažurirana',
      data: { user: { ...user.toObject(), role: user.role } },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getUsers, updateUserRole };
