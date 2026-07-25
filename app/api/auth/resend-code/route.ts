import { NextRequest, NextResponse } from 'next/server';
import {
  proxyAuthRequest,
  sanitizeAuthResponseForClient,
} from '@/lib/server/verification-email';
import { clientIp, rateLimit } from '@/lib/server/rate-limit';

export async function POST(request: NextRequest) {
  const ip = clientIp(request);
  const limited = rateLimit(`resend:${ip}`, 8, 15 * 60 * 1000);
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
    const { response, data } = await proxyAuthRequest('/auth/resend-code', body);

    return NextResponse.json(sanitizeAuthResponseForClient(data), {
      status: response.status,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur envoi code';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
