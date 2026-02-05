import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Transaction from '@/lib/models/Transaction';
import { getUserFromToken, unauthorized } from '@/lib/serverAuth';

export const dynamic = 'force-dynamic';

// GET /api/analytics/expenses-by-category
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user) return unauthorized();

    await connectDB();

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const query: any = {
      user_id: user._id,
      type: 'expense',
      category_id: { $ne: null }
    };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(query).populate('category_id');

    const categoryMap: { [key: string]: { category: string; total: number; count: number } } = {};

    transactions.forEach((transaction: any) => {
      if (transaction.category_id) {
        const categoryName = transaction.category_id.name;
        if (!categoryMap[categoryName]) {
          categoryMap[categoryName] = {
            category: categoryName,
            total: 0,
            count: 0
          };
        }
        categoryMap[categoryName].total += transaction.amount;
        categoryMap[categoryName].count += 1;
      }
    });

    const result = Object.values(categoryMap).sort((a, b) => b.total - a.total);

    return NextResponse.json({
      success: true,
      count: result.length,
      data: result
    });
  } catch (error: any) {
    console.error('Erreur GET expenses-by-category:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Erreur lors de la récupération des dépenses par catégorie'
      },
      { status: 500 }
    );
  }
}
