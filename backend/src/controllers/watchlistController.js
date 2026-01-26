const mongoose = require('mongoose');
const Watchlist = require('../models/Watchlist');
const Tool = require('../models/Tool');

const isObjectId = (v) => mongoose.Types.ObjectId.isValid(v);

const getWatchlist = async (req, res, next) => {
  try {
    const wl = await Watchlist.findOne({ user: req.user.id })
      .populate('tools')
      .lean();

    return res.status(200).json({
      success: true,
      message: 'Watchlista uspješno dohvaćena',
      data: { watchlist: wl || { user: req.user.id, tools: [] } },
    });
  } catch (error) {
    next(error);
  }
};

const addToWatchlist = async (req, res, next) => {
  try {
    const { toolId } = req.params;

    if (!isObjectId(toolId)) {
      return res.status(400).json({ success: false, message: 'Neispravan toolId.' });
    }

    const tool = await Tool.findById(toolId).select('_id');
    if (!tool) {
      return res.status(404).json({ success: false, message: 'Alat nije pronađen.' });
    }

    const wl = await Watchlist.findOneAndUpdate(
      { user: req.user.id },
      { $addToSet: { tools: toolId } },
      { new: true, upsert: true }
    ).populate('tools');

    return res.status(200).json({
      success: true,
      message: 'Alat dodan u watchlistu',
      data: { watchlist: wl },
    });
  } catch (error) {
    next(error);
  }
};

const removeFromWatchlist = async (req, res, next) => {
  try {
    const { toolId } = req.params;

    if (!isObjectId(toolId)) {
      return res.status(400).json({ success: false, message: 'Neispravan toolId.' });
    }

    const wl = await Watchlist.findOneAndUpdate(
      { user: req.user.id },
      { $pull: { tools: toolId } },
      { new: true }
    ).populate('tools');

    return res.status(200).json({
      success: true,
      message: 'Alat uklonjen iz watchliste',
      data: { watchlist: wl || { user: req.user.id, tools: [] } },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getWatchlist, addToWatchlist, removeFromWatchlist };
