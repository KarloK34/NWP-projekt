const mongoose = require('mongoose');

const toolSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Molimo unesite naziv alata'],
      trim: true,
      maxlength: [100, 'Naziv alata ne može imati više od 100 znakova'],
    },
    description: {
      type: String,
      required: [true, 'Molimo unesite opis'],
      trim: true,
      maxlength: [2000, 'Opis ne može imati više od 2000 znakova'],
    },
    website: {
      type: String,
      required: [true, 'Molimo unesite URL web stranice'],
      trim: true,
      match: [
        /^https?:\/\/.+/,
        'Molimo unesite valjanu URL adresu koja počinje s http:// ili https://',
      ],
    },
    logo: {
      type: String, // URL to logo image
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Molimo unesite kategoriju'],
    },
    subcategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null, // null ako nema podkategorije, ObjectId za podkategoriju
    },
    models: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AIModel',
      },
    ],
    tags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tag',
      },
    ],
    pricing: {
      type: String,
      enum: ['free', 'paid', 'freemium'],
      required: [true, 'Molimo unesite informacije o cijeni'],
    },
    rating: {
      type: Number,
      default: 0,
      min: [0, 'Ocjena ne može biti negativna'],
      max: [5, 'Ocjena ne može biti veća od 5'],
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: [0, 'Broj recenzija ne može biti negativan'],
    },
    metadata: {
      githubUrl: {
        type: String,
        trim: true,
      },
      huggingFaceUrl: {
        type: String,
        trim: true,
      },
      apiDocumentation: {
        type: String,
        trim: true,
      },
      // Additional metadata can be added here
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
toolSchema.index({ name: 'text', description: 'text' }); // Text search
toolSchema.index({ category: 1 });
toolSchema.index({ tags: 1 });
toolSchema.index({ rating: -1 }); // Descending for sorting
toolSchema.index({ pricing: 1 });
toolSchema.index({ createdAt: -1 }); // For sorting by newest

module.exports = mongoose.model('Tool', toolSchema);

