import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Transaction from '@/lib/models/Transaction';
import Wallet from '@/lib/models/Wallet';
import { getUserFromToken, unauthorized } from '@/lib/serverAuth';

// POST /api/transactions/transfer
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user) return unauthorized();

    await connectDB();

    const { amount, wallet_id, destination_wallet_id, description, date } = await request.json();

    const sourceWallet = await Wallet.findOne({ _id: wallet_id, user_id: user._id });
    const destWallet = await Wallet.findOne({ _id: destination_wallet_id, user_id: user._id });

    if (!sourceWallet || !destWallet) {
      return NextResponse.json(
        {
          success: false,
          message: 'Portefeuille introuvable'
        },
        { status: 404 }
      );
    }

    if (wallet_id === destination_wallet_id) {
      return NextResponse.json(
        {
          success: false,
          message: 'Impossible de transférer vers le même portefeuille'
        },
        { status: 400 }
      );
    }

    const source_balance_before = sourceWallet.current_balance;
    const source_balance_after = source_balance_before - amount;

    if (source_balance_after < 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Solde insuffisant pour ce transfert'
        },
        { status: 400 }
      );
    }

    const dest_balance_before = destWallet.current_balance;
    const dest_balance_after = dest_balance_before + amount;

    // Transaction de débit (source)
    const debitTransaction = await Transaction.create({
      user_id: user._id,
      type: 'transfer',
      amount,
      wallet_id,
      destination_wallet_id,
      description: description || `Transfert vers ${destWallet.name}`,
      date: date || new Date(),
      balance_before: source_balance_before,
      balance_after: source_balance_after
    });

    // Transaction de crédit (destination)
    const creditTransaction = await Transaction.create({
      user_id: user._id,
      type: 'transfer',
      amount,
      wallet_id: destination_wallet_id,
      destination_wallet_id: wallet_id,
      description: description || `Transfert de ${sourceWallet.name}`,
      date: date || new Date(),
      balance_before: dest_balance_before,
      balance_after: dest_balance_after
    });

    sourceWallet.current_balance = source_balance_after;
    destWallet.current_balance = dest_balance_after;

    await sourceWallet.save();
    await destWallet.save();

    const populatedDebit = await Transaction.findById(debitTransaction._id)
      .populate('wallet_id')
      .populate('destination_wallet_id');

    const populatedCredit = await Transaction.findById(creditTransaction._id)
      .populate('wallet_id')
      .populate('destination_wallet_id');

    return NextResponse.json(
      {
        success: true,
        data: {
          debit: populatedDebit,
          credit: populatedCredit
        }
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Erreur POST transfer:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Erreur lors du transfert'
      },
      { status: 500 }
    );
  }
}
