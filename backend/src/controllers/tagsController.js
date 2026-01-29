const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const Tag = require('../models/Tag');
const Tool = require('../models/Tool');

const isObjectId = (v) => mongoose.Types.ObjectId.isValid(v);

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
    });

    return res.status(201).json({ success: true, message: 'Tag kreiran', data: { tag } });
  } catch (error) {
    next(error);
  }
};

const updateTag = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Neispravan ID tag-a.' });
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Greška pri validaciji', errors: errors.array() });
    }

    const tag = await Tag.findById(id);
    if (!tag) {
      return res.status(404).json({ success: false, message: 'Tag nije pronađen.' });
    }

    const name = req.body.name?.trim();
    if (name && name !== tag.name) {
      const existing = await Tag.findOne({ name: name.toLowerCase() });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Tag s tim imenom već postoji.' });
      }
      tag.name = name.toLowerCase();
    }
    if (req.body.type !== undefined) tag.type = req.body.type || 'other';

    await tag.save();
    return res.status(200).json({ success: true, message: 'Tag ažuriran', data: { tag } });
  } catch (error) {
    next(error);
  }
};

const deleteTag = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Neispravan ID tag-a.' });
    }

    const tag = await Tag.findById(id);
    if (!tag) {
      return res.status(404).json({ success: false, message: 'Tag nije pronađen.' });
    }

    await Tool.updateMany({ tags: id }, { $pull: { tags: id } });
    await Tag.findByIdAndDelete(id);

    return res.status(200).json({ success: true, message: 'Tag uklonjen sa svih alata i obrisan' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getTags, createTag, updateTag, deleteTag };
