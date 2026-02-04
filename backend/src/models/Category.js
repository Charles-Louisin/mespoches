const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'L\'utilisateur est requis']
  },
  name: {
    type: String,
    required: [true, 'Le nom de la catégorie est requis'],
    trim: true
  },
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: [true, 'Le type est requis']
  },
  created_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

categorySchema.index({ user_id: 1, type: 1 });

module.exports = mongoose.model('Category', categorySchema);
