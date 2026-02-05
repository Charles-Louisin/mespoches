import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Transaction from '@/lib/models/Transaction';
import { getUserFromToken, unauthorized } from '@/lib/serverAuth';

export const dynamic = 'force-dynamic';

// GET /api/transactions - Récupérer toutes les transactions
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user) return unauthorized();

    await connectDB();

    const transactions = await Transaction.find({ user_id: user._id })
      .populate('wallet_id')
      .populate('destination_wallet_id')
      .populate('category_id')
      .sort({ date: -1 });

    return NextResponse.json({
      success: true,
      count: transactions.length,
      data: transactions
    });
  } catch (error: any) {
    console.error('Erreur GET transactions:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Erreur lors de la récupération des transactions'
      },
      { status: 500 }
    );
  }
}
