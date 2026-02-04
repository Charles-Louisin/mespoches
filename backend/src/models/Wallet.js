const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'L\'utilisateur est requis']
  },
  name: {
    type: String,
    required: [true, 'Le nom du portefeuille est requis'],
    trim: true
  },
  currency: {
    type: String,
    default: 'XAF',
    trim: true
  },
  current_balance: {
    type: Number,
    default: 0,
    min: [0, 'Le solde ne peut pas être négatif']
  },
  created_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

walletSchema.index({ user_id: 1, created_at: -1 });

module.exports = mongoose.model('Wallet', walletSchema);
