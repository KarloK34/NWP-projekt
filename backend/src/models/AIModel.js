const mongoose = require('mongoose');

const aiModelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Molimo unesite naziv modela'],
      trim: true,
      maxlength: [100, 'Naziv modela ne može imati više od 100 znakova'],
    },
    provider: {
      type: String,
      required: [true, 'Molimo unesite providera (davatelja usluge)'],
      trim: true,
      enum: [
        'OpenAI',
        'Anthropic',
        'Google',
        'Meta',
        'Hugging Face',
        'Cohere',
        'Mistral AI',
        'Other',
      ],
    },
    version: {
      type: String,
      trim: true,
      maxlength: [50, 'Verzija ne može imati više od 50 znakova'],
    },
    huggingFaceModelId: {
      type: String,
      trim: true,
      // Format: username/model-name
    },
    source: {
      type: String,
      enum: ['open-source', 'proprietary', 'hybrid'],
      default: 'proprietary',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for unique model name + provider combination
aiModelSchema.index({ name: 1, provider: 1 }, { unique: true });

module.exports = mongoose.model('AIModel', aiModelSchema);

