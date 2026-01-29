const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

const Tool = require('../models/Tool');
const Category = require('../models/Category');
const Tag = require('../models/Tag');
const AIModel = require('../models/AIModel');
const User = require('../models/User');
const Review = require('../models/Review');

const { ValidationError } = require('../middleware/errorHandler');

const isObjectId = (v) => mongoose.Types.ObjectId.isValid(v);

const parseCommaList = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) {
    return val.flatMap((v) => String(v).split(',')).map((s) => s.trim()).filter(Boolean);
  }
  return String(val).split(',').map((s) => s.trim()).filter(Boolean);
};

const clampInt = (val, def, min, max) => {
  const n = parseInt(val, 10);
  if (Number.isNaN(n)) return def;
  return Math.max(min, Math.min(max, n));
};

const getSortObject = (sort, order) => {
  const dir = String(order || 'desc').toLowerCase() === 'asc' ? 1 : -1;

  switch (String(sort || '').toLowerCase()) {
    case 'name':
      return { name: dir };
    case 'createdat':
      return { createdAt: dir };
    case 'newest':
      return { createdAt: -1 };
    case 'oldest':
      return { createdAt: 1 };
    case 'rating':
    default:
      return { rating: dir, reviewCount: dir, createdAt: dir };
  }
};

/**
 * GET /api/tools
 * Query params:
 * category, categories (comma-separated), tags, pricing, minRating, search, page, limit, sort, order, models (bonus)
 */
const getTools = async (req, res, next) => {
  try {
    const {
      category,
      categories,
      tags,
      pricing,
      minRating,
      search,
      sort,
      order,
      models, // bonus
    } = req.query;

    const page = clampInt(req.query.page, 1, 1, 1000000);
    const limit = clampInt(req.query.limit, 12, 1, 100);
    const skip = (page - 1) * limit;

    const filter = {};

    // categories: više kategorija (comma-separated), ili category: jedna (backward compat)
    const categoryList = parseCommaList(categories || category);
    if (categoryList.length > 0) {
      const ids = categoryList.filter(isObjectId);
      const slugs = categoryList.filter((c) => !isObjectId(c));

      let categoryIds = [...ids];

      if (slugs.length > 0) {
        const found = await Category.find({ slug: { $in: slugs } }).select('_id');
        categoryIds = categoryIds.concat(found.map((c) => c._id));
      }

      filter.category = categoryIds.length === 0 ? { $in: [] } : { $in: categoryIds };
    }

    // pricing
    if (pricing) {
      const p = String(pricing).toLowerCase();
      if (['free', 'paid', 'freemium'].includes(p)) filter.pricing = p;
    }

    // minRating
    if (minRating !== undefined) {
      const r = Number(minRating);
      if (!Number.isNaN(r)) filter.rating = { $gte: Math.max(0, Math.min(5, r)) };
    }

    // tags: id-evi ili imena (comma-separated)
    const tagList = parseCommaList(tags);
    if (tagList.length > 0) {
      const ids = tagList.filter(isObjectId);
      const names = tagList.filter((t) => !isObjectId(t));

      let tagIds = [...ids];

      if (names.length > 0) {
        const found = await Tag.find({ name: { $in: names } }).select('_id');
        tagIds = tagIds.concat(found.map((t) => String(t._id)));
      }

      filter.tags = tagIds.length === 0 ? { $in: [] } : { $in: tagIds };
    }

    // models (bonus): id-evi ili imena
    const modelList = parseCommaList(models);
    if (modelList.length > 0) {
      const ids = modelList.filter(isObjectId);
      const names = modelList.filter((m) => !isObjectId(m));

      let modelIds = [...ids];

      if (names.length > 0) {
        const found = await AIModel.find({ name: { $in: names } }).select('_id');
        modelIds = modelIds.concat(found.map((m) => String(m._id)));
      }

      filter.models = modelIds.length === 0 ? { $in: [] } : { $in: modelIds };
    }

    // search by name only (case-insensitive)
    const hasSearch = search && String(search).trim().length > 0;

    const sortObj = getSortObject(sort, order);
    const sortByName = sort && String(sort).toLowerCase() === 'name';

    const findQuery = hasSearch
      ? { ...filter, name: { $regex: String(search).trim(), $options: 'i' } }
      : filter;

    let query = Tool.find(findQuery)
      .populate('category', 'name slug')
      .populate('tags', 'name')
      .populate('models', 'name');

    if (sortByName) {
      query = query.collation({ locale: 'en', strength: 2 });
    }

    const [items, total] = await Promise.all([
      query
        .sort(sort ? sortObj : (hasSearch ? { createdAt: -1 } : { rating: -1, reviewCount: -1, createdAt: -1 }))
        .skip(skip)
        .limit(limit)
        .lean(),
      Tool.countDocuments(findQuery),
    ]);

    res.status(200).json({
      success: true,
      message: 'Lista alata uspješno dohvaćena',
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
 * GET /api/tools/:id
 */
const getToolById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Neispravan ID alata.',
      });
    }

    const tool = await Tool.findById(id)
      .populate('category', 'name slug')
      .populate('tags', 'name')
      .populate('models', 'name')
      .populate('createdBy', 'username email')
      .lean();

    if (!tool) {
      return res.status(404).json({
        success: false,
        message: 'Alat nije pronađen.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Detalji alata uspješno dohvaćeni',
      data: { tool },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/tools (admin)
 */
const createTool = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Greška pri validaciji',
        errors: errors.array(),
      });
    }

    const {
      name,
      description,
      website,
      logo,
      pricing,
      category,
      tags = [],
      models = [],
      metadata,
    } = req.body;

    const toolData = {
      name,
      description,
      website,
      pricing,
      category,
      tags,
      models,
      createdBy: req.user?.id || req.user?._id,
    };
    if (logo !== undefined) toolData.logo = logo || '';
    if (metadata && typeof metadata === 'object') {
      toolData.metadata = {};
      if (metadata.githubUrl) toolData.metadata.githubUrl = metadata.githubUrl;
      if (metadata.huggingFaceUrl) toolData.metadata.huggingFaceUrl = metadata.huggingFaceUrl;
      if (metadata.apiDocumentation) toolData.metadata.apiDocumentation = metadata.apiDocumentation;
    }

    const tool = await Tool.create(toolData);

    const created = await Tool.findById(tool._id)
      .populate('category', 'name slug')
      .populate('tags', 'name')
      .populate('models', 'name')
      .lean();

    res.status(201).json({
      success: true,
      message: 'Alat uspješno kreiran',
      data: { tool: created },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/tools/:id (admin)
 */
const updateTool = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Neispravan ID alata.',
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Greška pri validaciji',
        errors: errors.array(),
      });
    }

    const update = {
      name: req.body.name,
      description: req.body.description,
      website: req.body.website,
      pricing: req.body.pricing,
      category: req.body.category,
      tags: req.body.tags,
      models: req.body.models,
      logo: req.body.logo,
      metadata: req.body.metadata,
    };

    // partial update - makni undefined
    Object.keys(update).forEach((k) => update[k] === undefined && delete update[k]);
    if (update.metadata && typeof update.metadata === 'object') {
      const m = update.metadata;
      update.metadata = {
        githubUrl: m.githubUrl || '',
        huggingFaceUrl: m.huggingFaceUrl || '',
        apiDocumentation: m.apiDocumentation || '',
      };
    }

    const tool = await Tool.findByIdAndUpdate(id, update, { new: true })
      .populate('category', 'name slug')
      .populate('tags', 'name')
      .populate('models', 'name')
      .lean();

    if (!tool) {
      return res.status(404).json({
        success: false,
        message: 'Alat nije pronađen.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Alat uspješno ažuriran',
      data: { tool },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/tools/:id (admin)
 */
const deleteTool = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Neispravan ID alata.',
      });
    }

    const tool = await Tool.findByIdAndDelete(id);

    if (!tool) {
      return res.status(404).json({
        success: false,
        message: 'Alat nije pronađen.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Alat obrisan',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/tools/stats (admin)
 * Aggregations for dashboard
 */
const getToolsStats = async (req, res, next) => {
  try {
    const [overview] = await Tool.aggregate([
      {
        $group: {
          _id: null,
          totalTools: { $sum: 1 },
          avgRating: { $avg: '$rating' },
          totalReviews: { $sum: '$reviewCount' },
        },
      },
      {
        $project: {
          _id: 0,
          totalTools: 1,
          avgRating: { $ifNull: ['$avgRating', 0] },
          totalReviews: 1,
        },
      },
    ]);

    const topCategories = await Tool.aggregate([
      { $group: { _id: '$category', toolsCount: { $sum: 1 } } },
      { $sort: { toolsCount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'category',
        },
      },
      { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          categoryId: '$_id',
          toolsCount: 1,
          name: '$category.name',
          slug: '$category.slug',
        },
      },
    ]);

    const [totalUsers, totalReviewCount] = await Promise.all([
      User.countDocuments(),
      Review.countDocuments(),
    ]);

    const overviewData = overview || { totalTools: 0, avgRating: 0, totalReviews: 0 };
    res.status(200).json({
      success: true,
      message: 'Statistike uspješno dohvaćene',
      data: {
        overview: {
          ...overviewData,
          totalUsers,
          totalReviews: totalReviewCount,
        },
        topCategories,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/tools/:id/enrich (admin)
 * Obogaćivanje alata s podacima iz vanjskih API-ja. Minimalna implementacija – Hugging Face integracija opcionalna.
 */
const enrichTool = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Neispravan ID alata.' });
    }

    const tool = await Tool.findById(id);
    if (!tool) {
      return res.status(404).json({ success: false, message: 'Alat nije pronađen.' });
    }

    // Placeholder: Hugging Face / vanjski API integracija može se dodati kasnije
    res.status(200).json({
      success: true,
      message: 'Obogaćivanje trenutno nije implementirano. Možete ručno ažurirati podatke alata.',
      data: { tool: await Tool.findById(id).populate('category', 'name').populate('tags', 'name').populate('models', 'name').lean() },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTools,
  getToolById,
  createTool,
  updateTool,
  deleteTool,
  getToolsStats,
  enrichTool,
};
