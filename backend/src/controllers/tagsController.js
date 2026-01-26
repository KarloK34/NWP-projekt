const { validationResult } = require('express-validator');
const Tag = require('../models/Tag');

const getTags = async (req, res, next) => {
  try {
    const items = await Tag.find({}).sort({ name: 1 }).lean();
    return res.status(200).json({ success: true, message: 'Tagovi dohvaćeni', data: { items } });
  } catch (error) {
    next(error);
  }
};

const createTag = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Greška pri validaciji', errors: errors.array() });
    }

    const existing = await Tag.findOne({ name: req.body.name.trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Tag s tim imenom već postoji.' });
    }

    const tag = await Tag.create({
      name: req.body.name.trim(),
      type: req.body.type || '',
      color: req.body.color || '',
    });

    return res.status(201).json({ success: true, message: 'Tag kreiran', data: { tag } });
  } catch (error) {
    next(error);
  }
};

module.exports = { getTags, createTag };
