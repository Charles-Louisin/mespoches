import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Wallet from '@/lib/models/Wallet';
import { getUserFromToken, unauthorized } from '@/lib/serverAuth';

export const dynamic = 'force-dynamic';

// GET /api/wallets/total-balance
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user) return unauthorized();

    await connectDB();

    const wallets = await Wallet.find({ user_id: user._id });

    const total = wallets.reduce((sum, wallet) => sum + wallet.current_balance, 0);

    return NextResponse.json({
      success: true,
      data: {
        total,
        wallets
      }
    });
  } catch (error: any) {
    console.error('Erreur GET total-balance:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Erreur lors du calcul du solde total'
      },
      { status: 500 }
    );
  }
}
