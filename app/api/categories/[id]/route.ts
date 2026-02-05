import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Category from '@/lib/models/Category';
import { getUserFromToken, unauthorized } from '@/lib/serverAuth';

// GET /api/categories/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromToken(request);
    if (!user) return unauthorized();

    await connectDB();

    const category = await Category.findOne({ _id: params.id, user_id: user._id });

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          message: 'Catégorie introuvable'
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: category
    });
  } catch (error: any) {
    console.error('Erreur GET category:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Erreur lors de la récupération de la catégorie'
      },
      { status: 500 }
    );
  }
}

// PUT /api/categories/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromToken(request);
    if (!user) return unauthorized();

    await connectDB();

    const { name, type } = await request.json();

    const category = await Category.findOne({ _id: params.id, user_id: user._id });

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          message: 'Catégorie introuvable'
        },
        { status: 404 }
      );
    }

    if (name) category.name = name;
    if (type) category.type = type;

    await category.save();

    return NextResponse.json({
      success: true,
      data: category
    });
  } catch (error: any) {
    console.error('Erreur PUT category:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Erreur lors de la mise à jour de la catégorie'
      },
      { status: 500 }
    );
  }
}

// DELETE /api/categories/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromToken(request);
    if (!user) return unauthorized();

    await connectDB();

    const category = await Category.findOne({ _id: params.id, user_id: user._id });

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          message: 'Catégorie introuvable'
        },
        { status: 404 }
      );
    }

    await Category.findByIdAndDelete(params.id);

    return NextResponse.json({
      success: true,
      message: 'Catégorie supprimée avec succès'
    });
  } catch (error: any) {
    console.error('Erreur DELETE category:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Erreur lors de la suppression de la catégorie'
      },
      { status: 500 }
    );
  }
}
