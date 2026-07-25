import { NextRequest, NextResponse } from 'next/server';
import { proxyAuthRequest } from '@/lib/server/verification-email';
import {
  applyAuthCookies,
  extractAuthSession,
} from '@/lib/server/session-cookies';
import { clientIp, rateLimit } from '@/lib/server/rate-limit';

export async function POST(request: NextRequest) {
  const ip = clientIp(request);
  const limited = rateLimit(`verify:${ip}`, 30, 15 * 60 * 1000);
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
    const { response, data } = await proxyAuthRequest(
      '/auth/verify-email',
      body
    );
    const next = NextResponse.json(data, { status: response.status });

    const session = extractAuthSession(
      data as Parameters<typeof extractAuthSession>[0]
    );
    if (session) {
      applyAuthCookies(next, session.token, session.emailVerified);
    }

    return next;
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Erreur vérification';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
