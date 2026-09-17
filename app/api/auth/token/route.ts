import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/server/jwt';
import {
  AUTH_TOKEN_COOKIE,
  EMAIL_VERIFIED_COOKIE,
  clearAuthCookies,
} from '@/lib/server/session-cookies';

/**
 * Décrit la session au JS same-origin SANS jamais renvoyer le JWT :
 * le token reste dans le cookie HttpOnly et n'est ajouté aux appels backend
 * que côté serveur (/api/proxy). Une XSS ne peut donc pas voler la session.
 */
export async function GET(request: NextRequest) {
  const token = request.cookies.get(AUTH_TOKEN_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ success: false, authenticated: false }, { status: 401 });
  }

  const payload = await verifyAuthToken(token);
  if (!payload) {
    const res = NextResponse.json(
      { success: false, authenticated: false, message: 'Session invalide' },
      { status: 401 }
    );
    clearAuthCookies(res);
    return res;
  }

  const emailVerified =
    request.cookies.get(EMAIL_VERIFIED_COOKIE)?.value === 'true' ||
    payload.emailVerified === true;

  return NextResponse.json({
    success: true,
    authenticated: true,
    emailVerified,
    role: payload.role === 'admin' ? 'admin' : 'user',
  });
}
