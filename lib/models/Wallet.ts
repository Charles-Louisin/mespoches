import mongoose, { Schema, Model, Types } from 'mongoose';

export interface IWallet {
  _id: string;
  user_id: Types.ObjectId;
  name: string;
  currency: string;
  current_balance: number;
  created_at: Date;
}

const walletSchema = new Schema<IWallet>({
  user_id: {
    type: Schema.Types.ObjectId as any,
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

const Wallet: Model<IWallet> = mongoose.models.Wallet || mongoose.model<IWallet>('Wallet', walletSchema);

export default Wallet;
