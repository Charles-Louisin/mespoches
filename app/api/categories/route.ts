import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Category from '@/lib/models/Category';
import { getUserFromToken, unauthorized } from '@/lib/serverAuth';

export const dynamic = 'force-dynamic';

// GET /api/categories
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user) return unauthorized();

    await connectDB();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    let query: any = { user_id: user._id };
    if (type) {
      query.type = type;
    }

    const categories = await Category.find(query).sort({ name: 1 });

    return NextResponse.json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error: any) {
    console.error('Erreur GET categories:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Erreur lors de la récupération des catégories'
      },
      { status: 500 }
    );
  }
}

// POST /api/categories
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user) return unauthorized();

    await connectDB();

    const { name, type } = await request.json();

    const category = await Category.create({
      user_id: user._id,
      name,
      type
    });

    return NextResponse.json(
      {
        success: true,
        data: category
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Erreur POST category:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Erreur lors de la création de la catégorie'
      },
      { status: 500 }
    );
  }
}
