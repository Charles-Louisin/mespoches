import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from './mongodb';
import User, { IUser } from './models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface AuthenticatedRequest extends NextRequest {
  user?: IUser;
}

export async function getUserFromToken(request: NextRequest): Promise<IUser | null> {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return null;
    }

    // Vérifier le token
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };

    // Connecter à la base de données
    await connectDB();

    // Récupérer l'utilisateur
    const user = await User.findById(decoded.id).select('-password');

    return user;
  } catch (error) {
    console.error('Erreur auth:', error);
    return null;
  }
}

export function generateToken(userId: string): string {
  return jwt.sign({ id: userId }, JWT_SECRET, {
    expiresIn: '30d'
  });
}

export function unauthorized() {
  return Response.json(
    {
      success: false,
      message: 'Non autorisé'
    },
    { status: 401 }
  );
}
