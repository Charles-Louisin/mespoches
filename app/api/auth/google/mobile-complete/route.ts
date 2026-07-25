import { NextRequest, NextResponse } from 'next/server';
import { proxyAuthRequest } from '@/lib/server/verification-email';
import {
  applyAuthCookies,
  extractAuthSession,
} from '@/lib/server/session-cookies';

function isValidHandoffCode(value: unknown): value is string {
  return typeof value === 'string' && /^[A-Za-z0-9_-]{32,128}$/.test(value);
}

function isValidClientNonce(value: unknown): value is string {
  return typeof value === 'string' && /^[A-Za-z0-9_-]{32,128}$/.test(value);
}

/**
 * Finalise OAuth mobile (POST uniquement).
 * Exige le code deep-link + le nonce généré dans la WebView (anti-hijack).
 */
export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { success: false, message: 'Requête invalide' },
      { status: 400 }
    );
  }

  const code = body.code;
  const clientNonce = body.clientNonce;

  if (!isValidHandoffCode(code) || !isValidClientNonce(clientNonce)) {
    return NextResponse.json(
      { success: false, message: 'Paramètres OAuth invalides' },
      { status: 400 }
    );
  }

  try {
    const { response, data } = await proxyAuthRequest('/auth/google/handoff', {
      code,
      clientNonce,
    });

    if (!response.ok || !data.success) {
      return NextResponse.json(
        {
          success: false,
          message:
            typeof data.message === 'string'
              ? data.message
              : 'Session Google impossible',
        },
        { status: response.status >= 400 ? response.status : 401 }
      );
    }

    const session = extractAuthSession(
      data as Parameters<typeof extractAuthSession>[0]
    );
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Session Google impossible' },
        { status: 401 }
      );
    }

    const next = NextResponse.json({
      success: true,
      data: { redirect: '/auth/complete' },
    });
    applyAuthCookies(next, session.token, session.emailVerified);
    return next;
  } catch (error) {
    console.error('Google mobile handoff error:', error);
    return NextResponse.json(
      { success: false, message: 'Session Google impossible' },
      { status: 500 }
    );
  }
}

/** Ancien GET : ne plus échanger le code (évite fuite via historique / logs). */
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const target = code
    ? `/auth/google/mobile-return?code=${encodeURIComponent(code)}`
    : '/login?error=google_session';
  return NextResponse.redirect(new URL(target, request.url));
}
