const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const Category = require('../models/Category');
const Tool = require('../models/Tool');

const isObjectId = (v) => mongoose.Types.ObjectId.isValid(v);

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

const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Neispravan ID kategorije.' });
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Greška pri validaciji', errors: errors.array() });
    }

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Kategorija nije pronađena.' });
    }

    const name = req.body.name?.trim();
    if (name && name !== category.name) {
      const existing = await Category.findOne({ name });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Kategorija s tim imenom već postoji.' });
      }
      category.name = name;
    }
    if (req.body.description !== undefined) category.description = req.body.description || '';

    await category.save();
    return res.status(200).json({ success: true, message: 'Kategorija ažurirana', data: { category } });
  } catch (error) {
    next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Neispravan ID kategorije.' });
    }

    const inUse = await Tool.findOne({ category: id });
    if (inUse) {
      return res.status(400).json({
        success: false,
        message: 'Kategorija se koristi u jednom ili više alata. Uklonite alate s ove kategorije prije brisanja.',
      });
    }

    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Kategorija nije pronađena.' });
    }
    return res.status(200).json({ success: true, message: 'Kategorija obrisana' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
