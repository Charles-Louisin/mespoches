import { NextRequest, NextResponse } from 'next/server';
import { proxyAuthRequest } from '@/lib/server/verification-email';
import {
  applyAuthCookies,
  extractAuthSession,
} from '@/lib/server/session-cookies';
import { clientIp, rateLimit } from '@/lib/server/rate-limit';
import { verifyAuthToken } from '@/lib/server/jwt';

export async function POST(request: NextRequest) {
  const ip = clientIp(request);
  const limited = rateLimit(`login:${ip}`, 20, 15 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json(
      {
        success: false,
        message: 'Trop de tentatives. Réessayez plus tard.',
        code: 'RATE_LIMITED',
      },
      {
        status: 429,
        headers: { 'Retry-After': String(limited.retryAfterSec) },
      }
    );
  }

  try {
    const body = await request.json();
    const { response, data } = await proxyAuthRequest('/auth/login', body);
    const next = NextResponse.json(data, { status: response.status });

    const session = extractAuthSession(
      data as Parameters<typeof extractAuthSession>[0]
    );
    if (session) {
      const payload = await verifyAuthToken(session.token);
      if (!payload) {
        console.error(
          '[auth/login] JWT non vérifiable — JWT_SECRET Vercel ≠ Railway ?'
        );
        return NextResponse.json(
          {
            success: false,
            code: 'JWT_MISMATCH',
            message:
              'Session impossible : JWT_SECRET sur Vercel doit être identique à celui du backend Railway.',
          },
          { status: 500 }
        );
      }
      applyAuthCookies(next, session.token, session.emailVerified);
    }

    return next;
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Erreur connexion';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
