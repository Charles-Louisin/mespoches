import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Transaction from '@/lib/models/Transaction';
import { getUserFromToken, unauthorized } from '@/lib/serverAuth';

// GET /api/transactions/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromToken(request);
    if (!user) return unauthorized();

    await connectDB();

    const transaction = await Transaction.findOne({ _id: params.id, user_id: user._id })
      .populate('wallet_id')
      .populate('destination_wallet_id')
      .populate('category_id');

    if (!transaction) {
      return NextResponse.json(
        {
          success: false,
          message: 'Transaction introuvable'
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: transaction
    });
  } catch (error: any) {
    console.error('Erreur GET transaction:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Erreur lors de la récupération de la transaction'
      },
      { status: 500 }
    );
  }
}
