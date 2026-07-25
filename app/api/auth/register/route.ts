import { NextRequest, NextResponse } from 'next/server';
import {
  proxyAuthRequest,
  sanitizeAuthResponseForClient,
} from '@/lib/server/verification-email';
import { applyPendingEmailCookie } from '@/lib/server/session-cookies';
import { clientIp, rateLimit } from '@/lib/server/rate-limit';

export async function POST(request: NextRequest) {
  const ip = clientIp(request);
  const limited = rateLimit(`register:${ip}`, 10, 15 * 60 * 1000);
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
    const { response, data } = await proxyAuthRequest('/auth/register', body);

    const next = NextResponse.json(sanitizeAuthResponseForClient(data), {
      status: response.status,
    });
    if (response.ok && typeof body.email === 'string') {
      applyPendingEmailCookie(next, body.email);
    }
    return next;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur inscription';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
