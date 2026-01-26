const { validationResult } = require('express-validator');
const Category = require('../models/Category');

const getCategories = async (req, res, next) => {
  try {
    const items = await Category.find({}).sort({ name: 1 }).lean();
    return res.status(200).json({ success: true, message: 'Kategorije dohvaćene', data: { items } });
  } catch (error) {
    next(error);
  }
};

const createCategory = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Greška pri validaciji', errors: errors.array() });
    }

    const existing = await Category.findOne({ name: req.body.name.trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Kategorija s tim imenom već postoji.' });
    }

    const category = await Category.create({
      name: req.body.name.trim(),
      description: req.body.description || '',
    });

    return res.status(201).json({ success: true, message: 'Kategorija kreirana', data: { category } });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCategories, createCategory };
