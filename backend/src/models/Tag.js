const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Molimo unesite naziv tag-a'],
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: [30, 'Naziv tag-a ne može imati više od 30 znakova'],
    },
    type: {
      type: String,
      enum: ['price', 'feature', 'use-case', 'technology', 'other'],
      default: 'other',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Tag', tagSchema);

