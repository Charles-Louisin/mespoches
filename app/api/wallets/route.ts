import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Wallet from '@/lib/models/Wallet';
import { getUserFromToken, unauthorized } from '@/lib/serverAuth';

export const dynamic = 'force-dynamic';

// GET /api/wallets - Récupérer tous les portefeuilles
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user) return unauthorized();

    await connectDB();

    const wallets = await Wallet.find({ user_id: user._id }).sort({ created_at: -1 });

    return NextResponse.json({
      success: true,
      count: wallets.length,
      data: wallets
    });
  } catch (error: any) {
    console.error('Erreur GET wallets:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Erreur lors de la récupération des portefeuilles'
      },
      { status: 500 }
    );
  }
}

// POST /api/wallets - Créer un portefeuille
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user) return unauthorized();

    await connectDB();

    const { name, currency } = await request.json();

    const wallet = await Wallet.create({
      user_id: user._id,
      name,
      currency: currency || 'XAF',
      current_balance: 0
    });

    return NextResponse.json(
      {
        success: true,
        data: wallet
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Erreur POST wallet:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Erreur lors de la création du portefeuille'
      },
      { status: 500 }
    );
  }
}
