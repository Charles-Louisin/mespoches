import { NextRequest, NextResponse } from 'next/server';
import {
  buildOAuthState,
  resolveOAuthOrigin,
} from '@/lib/server/oauth-origin';

const NONCE_COOKIE = 'google_oauth_client_nonce';
const STATE_COOKIE = 'google_oauth_state';

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

  const origin = resolveOAuthOrigin(request);
  const redirectUri = `${origin}/api/auth/google/callback`;
  const mobile = request.nextUrl.searchParams.get('mobile') === '1';
  const clientNonce = request.nextUrl.searchParams.get('client_nonce');

  if (mobile && !isValidClientNonce(clientNonce)) {
    return NextResponse.redirect(
      new URL('/login?error=google_nonce', request.url)
    );
  }

  const state = buildOAuthState(mobile);
  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', 'openid email profile');
  url.searchParams.set('access_type', 'online');
  url.searchParams.set('prompt', 'select_account');
  url.searchParams.set('include_granted_scopes', 'true');
  url.searchParams.set('state', state);

  const secure = origin.startsWith('https://');
  const response = NextResponse.redirect(url.toString());
  response.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge: 10 * 60,
  });

  if (mobile && clientNonce) {
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
