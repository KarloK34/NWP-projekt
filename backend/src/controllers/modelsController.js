const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const AIModel = require('../models/AIModel');
const Tool = require('../models/Tool');

const isObjectId = (v) => mongoose.Types.ObjectId.isValid(v);

const getModels = async (req, res, next) => {
  try {
    const items = await AIModel.find({}).sort({ name: 1 }).lean();
    return res.status(200).json({ success: true, message: 'Modeli dohvaćeni', data: { items } });
  } catch (error) {
    next(error);
  }
};

const createModel = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Greška pri validaciji', errors: errors.array() });
    }

    const existing = await AIModel.findOne({ name: req.body.name.trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Model s tim imenom već postoji.' });
    }

    const model = await AIModel.create({
      name: req.body.name.trim(),
      provider: req.body.provider || '',
      version: req.body.version || '',
      source: req.body.source || '',
      huggingFaceModelId: req.body.huggingFaceModelId || '',
    });

    return res.status(201).json({ success: true, message: 'Model kreiran', data: { model } });
  } catch (error) {
    next(error);
  }
};

const updateModel = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Neispravan ID modela.' });
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Greška pri validaciji', errors: errors.array() });
    }

    const model = await AIModel.findById(id);
    if (!model) {
      return res.status(404).json({ success: false, message: 'Model nije pronađen.' });
    }

    const name = req.body.name?.trim();
    if (name && name !== model.name) {
      const existing = await AIModel.findOne({ name, provider: model.provider });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Model s tim imenom i providerom već postoji.' });
      }
      model.name = name;
    }
    if (req.body.provider !== undefined) model.provider = req.body.provider;
    if (req.body.version !== undefined) model.version = req.body.version || '';
    if (req.body.source !== undefined) model.source = req.body.source || 'proprietary';
    if (req.body.huggingFaceModelId !== undefined) model.huggingFaceModelId = req.body.huggingFaceModelId || '';

    await model.save();
    return res.status(200).json({ success: true, message: 'Model ažuriran', data: { model } });
  } catch (error) {
    next(error);
  }
};

const deleteModel = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Neispravan ID modela.' });
    }

    const inUse = await Tool.findOne({ models: id });
    if (inUse) {
      return res.status(400).json({
        success: false,
        message: 'Model se koristi u jednom ili više alata. Uklonite model s alata prije brisanja.',
      });
    }

    const model = await AIModel.findByIdAndDelete(id);
    if (!model) {
      return res.status(404).json({ success: false, message: 'Model nije pronađen.' });
    }
    return res.status(200).json({ success: true, message: 'Model obrisan' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getModels, createModel, updateModel, deleteModel };
