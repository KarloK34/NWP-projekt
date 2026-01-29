const { validationResult } = require('express-validator');
const AIModel = require('../models/AIModel');
const huggingFaceService = require('../services/huggingFaceService');


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

/**
 * Hugging Face model search by task (pipeline_tag)
 * GET /api/models/hf/search?task=text-generation&limit=10
 */
const hfSearchModels = async (req, res, next) => {
  try {
    const task = (req.query.task || '').trim();
    const limit = req.query.limit ?? 10;

    if (!task) {
      return res.status(400).json({
        success: false,
        message: 'Query param "task" je obavezan. Primjer: ?task=text-generation',
      });
    }

    const results = await huggingFaceService.searchModelsByTask(task, limit);

    return res.status(200).json({
      success: true,
      message: 'Hugging Face search uspješan',
      data: {
        task,
        limit: Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50),
        results,
      },
    });
  } catch (error) {
    next(error);
  }
};


module.exports = { getModels, createModel, hfSearchModels };
