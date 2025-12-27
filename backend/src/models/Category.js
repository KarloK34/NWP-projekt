const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Molimo unesite naziv kategorije'],
      unique: true,
      trim: true,
      maxlength: [50, 'Naziv kategorije ne može imati više od 50 znakova'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Opis ne može imati više od 500 znakova'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    icon: {
      type: String, // URL or icon name
      trim: true,
    },
    parentCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null, // null za glavne kategorije, ObjectId za podkategorije
    },
    isMainCategory: {
      type: Boolean,
      default: false, // true za glavne kategorije, false za podkategorije
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate slug from name if not provided
categorySchema.pre('save', function () {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
});

module.exports = mongoose.model('Category', categorySchema);

