import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Transaction from '@/lib/models/Transaction';
import { getUserFromToken, unauthorized } from '@/lib/serverAuth';

export const dynamic = 'force-dynamic';

// GET /api/analytics/current-month
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user) return unauthorized();

    await connectDB();

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const incomeTransactions = await Transaction.find({
      user_id: user._id,
      type: 'income',
      date: { $gte: startOfMonth, $lte: endOfMonth }
    });

    const expenseTransactions = await Transaction.find({
      user_id: user._id,
      type: 'expense',
      date: { $gte: startOfMonth, $lte: endOfMonth }
    });

    const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);

    return NextResponse.json({
      success: true,
      data: {
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
        incomeCount: incomeTransactions.length,
        expenseCount: expenseTransactions.length
      }
    });
  } catch (error: any) {
    console.error('Erreur GET current-month:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Erreur lors de la récupération des statistiques'
      },
      { status: 500 }
    );
  }
}
