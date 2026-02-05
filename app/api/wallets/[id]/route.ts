import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Wallet from '@/lib/models/Wallet';
import Transaction from '@/lib/models/Transaction';
import { getUserFromToken, unauthorized } from '@/lib/serverAuth';

// GET /api/wallets/[id]
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

    return NextResponse.json({
      success: true,
      data: wallet
    });
  } catch (error: any) {
    console.error('Erreur GET wallet:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Erreur lors de la récupération du portefeuille'
      },
      { status: 500 }
    );
  }
}

// PUT /api/wallets/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromToken(request);
    if (!user) return unauthorized();

    await connectDB();

    const { name, currency } = await request.json();

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

    if (name) wallet.name = name;
    if (currency) wallet.currency = currency;

    await wallet.save();

    return NextResponse.json({
      success: true,
      data: wallet
    });
  } catch (error: any) {
    console.error('Erreur PUT wallet:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Erreur lors de la mise à jour du portefeuille'
      },
      { status: 500 }
    );
  }
}

// DELETE /api/wallets/[id]
export async function DELETE(
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

    // Vérifier s'il y a des transactions
    const transactionCount = await Transaction.countDocuments({
      user_id: user._id,
      $or: [{ wallet_id: params.id }, { destination_wallet_id: params.id }]
    });

    if (transactionCount > 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Impossible de supprimer un portefeuille avec des transactions'
        },
        { status: 400 }
      );
    }

    await Wallet.findByIdAndDelete(params.id);

    return NextResponse.json({
      success: true,
      message: 'Portefeuille supprimé avec succès'
    });
  } catch (error: any) {
    console.error('Erreur DELETE wallet:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Erreur lors de la suppression du portefeuille'
      },
      { status: 500 }
    );
  }
}
