import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Transaction from '@/lib/models/Transaction';
import Wallet from '@/lib/models/Wallet';
import { getUserFromToken, unauthorized } from '@/lib/serverAuth';

// POST /api/transactions/expense
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user) return unauthorized();

    await connectDB();

    const { amount, wallet_id, category_id, description, date } = await request.json();

    const wallet = await Wallet.findOne({ _id: wallet_id, user_id: user._id });

    if (!wallet) {
      return NextResponse.json(
        {
          success: false,
          message: 'Portefeuille introuvable'
        },
        { status: 404 }
      );
    }

    const balance_before = wallet.current_balance;
    const balance_after = balance_before - amount;

    if (balance_after < 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Solde insuffisant pour cette dépense'
        },
        { status: 400 }
      );
    }

    const transaction = await Transaction.create({
      user_id: user._id,
      type: 'expense',
      amount,
      wallet_id,
      category_id,
      description: description || '',
      date: date || new Date(),
      balance_before,
      balance_after
    });

    wallet.current_balance = balance_after;
    await wallet.save();

    const populatedTransaction = await Transaction.findById(transaction._id)
      .populate('wallet_id')
      .populate('category_id');

    return NextResponse.json(
      {
        success: true,
        data: populatedTransaction
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Erreur POST expense:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Erreur lors de la création de la dépense'
      },
      { status: 500 }
    );
  }
}
