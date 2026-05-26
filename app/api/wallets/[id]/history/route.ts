import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Wallet from '@/lib/models/Wallet';
import Transaction from '@/lib/models/Transaction';
import { getUserFromToken, unauthorized } from '@/lib/serverAuth';

// GET /api/wallets/[id]/history
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromToken(request);
    if (!user) return unauthorized();

    await connectDB();

    const wallet = await Wallet.findOne({ _id: params.id, user_id: user._id });

    if (!wallet) {
      return NextResponse.json(
        {
          success: false,
          message: 'Portefeuille introuvable'
        },
        { status: 404 }
      );
    }

    // Récupérer toutes les transactions liées à ce portefeuille
    const transactions = await Transaction.find({
      user_id: user._id,
      $or: [
        { wallet_id: params.id },
        { destination_wallet_id: params.id }
      ]
    })
      .populate('wallet_id')
      .populate('destination_wallet_id')
      .populate('category_id')
      .sort({ date: -1, created_at: -1 });

    return NextResponse.json({
      success: true,
      data: {
        wallet,
        transactions,
        count: transactions.length
      }
    });
  } catch (error: any) {
    console.error('Erreur GET wallet history:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Erreur lors de la récupération de l\'historique'
      },
      { status: 500 }
    );
  }
}
