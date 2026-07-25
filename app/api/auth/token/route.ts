import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/server/jwt';
import {
  AUTH_TOKEN_COOKIE,
  EMAIL_VERIFIED_COOKIE,
  clearAuthCookies,
} from '@/lib/server/session-cookies';

/**
 * Expose le JWT au JS same-origin pour les appels Bearer vers l'API Express
 * et le bridge Android. Le cookie reste HttpOnly (non lisible via document.cookie).
 */
export async function GET(request: NextRequest) {
  const token = request.cookies.get(AUTH_TOKEN_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ success: false, token: null }, { status: 401 });
  }

  const payload = await verifyAuthToken(token);
  if (!payload) {
    const res = NextResponse.json(
      { success: false, token: null, message: 'Session invalide' },
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
    token,
    emailVerified,
  });
}
