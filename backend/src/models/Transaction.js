const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'L\'utilisateur est requis']
  },
  type: {
    type: String,
    enum: ['income', 'expense', 'transfer'],
    required: [true, 'Le type de transaction est requis']
  },
  amount: {
    type: Number,
    required: [true, 'Le montant est requis'],
    min: [0.01, 'Le montant doit être supérieur à 0']
  },
  wallet_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wallet',
    required: [true, 'Le portefeuille source est requis']
  },
  destination_wallet_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wallet',
    default: null
  },
  category_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  date: {
    type: Date,
    default: Date.now
  },
  balance_before: {
    type: Number,
    required: true
  },
  balance_after: {
    type: Number,
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

transactionSchema.index({ user_id: 1, wallet_id: 1, date: -1 });
transactionSchema.index({ user_id: 1, date: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);
