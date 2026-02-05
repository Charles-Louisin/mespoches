import mongoose, { Schema, Model, Types } from 'mongoose';

export interface ITransaction {
  _id: string;
  user_id: Types.ObjectId;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  wallet_id: Types.ObjectId;
  destination_wallet_id?: Types.ObjectId;
  category_id?: Types.ObjectId;
  description: string;
  date: Date;
  balance_before: number;
  balance_after: number;
  created_at: Date;
}

const transactionSchema = new Schema<ITransaction>({
  user_id: {
    type: Schema.Types.ObjectId as any,
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
    type: Schema.Types.ObjectId as any,
    ref: 'Wallet',
    required: [true, 'Le portefeuille source est requis']
  },
  destination_wallet_id: {
    type: Schema.Types.ObjectId as any,
    ref: 'Wallet',
    default: null
  },
  category_id: {
    type: Schema.Types.ObjectId as any,
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

const Transaction: Model<ITransaction> = mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', transactionSchema);

export default Transaction;
