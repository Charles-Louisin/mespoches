import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import { generateToken } from '@/lib/serverAuth';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { email, password } = await request.json();

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: 'Veuillez fournir un email et un mot de passe'
        },
        { status: 400 }
      );
    }

    // Récupérer l'utilisateur avec le mot de passe
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'Email ou mot de passe incorrect'
        },
        { status: 401 }
      );
    }

    // Vérifier le mot de passe
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return NextResponse.json(
        {
          success: false,
          message: 'Email ou mot de passe incorrect'
        },
        { status: 401 }
      );
    }

    // Générer le token
    const token = generateToken(user._id.toString());

    return NextResponse.json(
      {
        success: true,
        data: {
          user: {
            id: user._id,
            email: user.email,
            name: user.name
          },
          token
        }
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Erreur login:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Erreur lors de la connexion'
      },
      { status: 500 }
    );
  }
}
