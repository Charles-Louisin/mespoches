import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import { generateToken } from '@/lib/serverAuth';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { email, password, name } = await request.json();

    // Vérifier si l'utilisateur existe déjà
    const userExists = await User.findOne({ email });
    if (userExists) {
      return NextResponse.json(
        {
          success: false,
          message: 'Un compte existe déjà avec cet email'
        },
        { status: 400 }
      );
    }

    // Créer l'utilisateur
    const user = await User.create({
      email,
      password,
      name
    });

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
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Erreur register:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Erreur lors de l\'inscription'
      },
      { status: 500 }
    );
  }
}
