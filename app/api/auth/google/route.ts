import { NextRequest, NextResponse } from 'next/server';

const NONCE_COOKIE = 'google_oauth_client_nonce';
const STATE_COOKIE = 'google_oauth_state';

function appOrigin(request: NextRequest): string {
  const override = (
    process.env.GOOGLE_REDIRECT_ORIGIN ||
    process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_ORIGIN ||
    process.env.NEXT_PUBLIC_APP_URL ||
    ''
  ).replace(/\/$/, '');
  if (override.startsWith('http')) return override;

  // Derrière ngrok / reverse-proxy : préférer le Host public
  const forwardedHost = request.headers.get('x-forwarded-host')?.split(',')[0]?.trim();
  const forwardedProto =
    request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim() || 'https';
  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`.replace(/\/$/, '');
  }

  return request.nextUrl.origin;
}

function isValidClientNonce(value: string | null): value is string {
  return !!value && /^[A-Za-z0-9_-]{32,128}$/.test(value);
}

/** Démarre le flux OAuth Google (prioritaire). */
export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  if (!clientId) {
    return NextResponse.redirect(
      new URL('/login?error=google_config', request.url)
    );
  }

  const redirectUri = `${appOrigin(request)}/api/auth/google/callback`;
  const mobile = request.nextUrl.searchParams.get('mobile') === '1';
  const clientNonce = request.nextUrl.searchParams.get('client_nonce');

  if (mobile && !isValidClientNonce(clientNonce)) {
    return NextResponse.redirect(
      new URL('/login?error=google_nonce', request.url)
    );
  }

  const state = crypto.randomUUID();
  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', 'openid email profile');
  url.searchParams.set('access_type', 'online');
  url.searchParams.set('prompt', 'select_account');
  url.searchParams.set('include_granted_scopes', 'true');
  url.searchParams.set('state', state);

  const secure = request.nextUrl.protocol === 'https:';
  const response = NextResponse.redirect(url.toString());
  response.cookies.set(STATE_COOKIE, `${state}:${mobile ? '1' : '0'}`, {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge: 10 * 60,
  });

  if (mobile && clientNonce) {
    // Cookie HttpOnly côté Custom Tab — lié au handoff serveur
    response.cookies.set(NONCE_COOKIE, clientNonce, {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      path: '/',
      maxAge: 10 * 60,
    });
  } else {
    response.cookies.set(NONCE_COOKIE, '', {
      httpOnly: true,
      path: '/',
      maxAge: 0,
    });
  }

  return response;
}
