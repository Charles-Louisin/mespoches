import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from './mongodb';
import User, { IUser } from './models/User';

function requireJwtSecret(): string {
  const secret = process.env.JWT_SECRET?.trim();
  if (!secret) {
    throw new Error(
      'JWT_SECRET manquant. Définissez-le dans les variables d\'environnement.'
    );
  }
  return secret;
}

export interface AuthenticatedRequest extends NextRequest {
  user?: IUser;
}

export async function getUserFromToken(request: NextRequest): Promise<IUser | null> {
  try {
    const authHeader = request.headers.get('authorization');
    const cookieToken = request.cookies.get('auth_token')?.value;

    let token: string | undefined;
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (cookieToken) {
      token = cookieToken;
    }

    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, requireJwtSecret()) as { id: string };

    await connectDB();

    const user = await User.findById(decoded.id).select('-password');

    return user;
  } catch (error) {
    console.error('Erreur auth:', error);
    return null;
  }
}

export function generateToken(userId: string): string {
  return jwt.sign({ id: userId }, requireJwtSecret(), {
    expiresIn: (process.env.JWT_EXPIRES_IN ||
      '7d') as jwt.SignOptions['expiresIn'],
  });
}

export function unauthorized() {
  return Response.json(
    {
      success: false,
      message: 'Non autorisé',
    },
    { status: 401 }
  );
}
