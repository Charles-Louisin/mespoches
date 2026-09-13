import { NextRequest, NextResponse } from 'next/server';
import { proxyAuthRequest } from '@/lib/server/verification-email';
import {
  applyAuthCookies,
  extractAuthSession,
} from '@/lib/server/session-cookies';
import {
  parseOAuthState,
  resolveCallbackOrigin,
} from '@/lib/server/oauth-origin';
import {
  localGoogleClientId,
  localGoogleClientSecret,
} from '@/lib/server/google-oauth';

const NONCE_COOKIE = 'google_oauth_client_nonce';
const STATE_COOKIE = 'google_oauth_state';

function clearOAuthCookies(response: NextResponse): void {
  for (const name of [STATE_COOKIE, NONCE_COOKIE]) {
    response.cookies.set(name, '', {
      httpOnly: true,
      path: '/',
      maxAge: 0,
    });
  }
}

/** Callback OAuth Google → session MES POCHES (7 jours). */
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const oauthError = request.nextUrl.searchParams.get('error');
  const returnedState = request.nextUrl.searchParams.get('state');
  const stateCookie = request.cookies.get(STATE_COOKIE)?.value;
  const parsedState = parseOAuthState(returnedState);
  const parsedCookie = parseOAuthState(stateCookie ?? null);
  const mobile =
    parsedState?.mobile === true ||
    parsedCookie?.mobile === true ||
    Boolean(request.cookies.get(NONCE_COOKIE)?.value);
  const origin = resolveCallbackOrigin(request, mobile);
  const clientNonce = request.cookies.get(NONCE_COOKIE)?.value;

  if (oauthError || !code) {
    const next = NextResponse.redirect(
      new URL(`/login?error=${oauthError || 'google_denied'}`, origin)
    );
    clearOAuthCookies(next);
    return next;
  }
  if (!returnedState || !parsedState) {
    const next = NextResponse.redirect(
      new URL('/login?error=google_state', origin)
    );
    clearOAuthCookies(next);
    return next;
  }

  // Si le cookie state est présent, il doit correspondre (anti-CSRF).
  // S'il est absent (www ↔ apex), on continue : le code OAuth est à usage unique.
  if (
    stateCookie &&
    (returnedState !== stateCookie ||
      !parsedCookie ||
      parsedState.id !== parsedCookie.id)
  ) {
    const next = NextResponse.redirect(
      new URL('/login?error=google_state', origin)
    );
    clearOAuthCookies(next);
    return next;
  }

  if (mobile && (!clientNonce || clientNonce.length < 32)) {
    const next = NextResponse.redirect(
      new URL('/login?error=google_nonce', origin)
    );
    clearOAuthCookies(next);
    return next;
  }

  const clientId = localGoogleClientId();
  const clientSecret = localGoogleClientSecret();
  const redirectUri = `${origin}/api/auth/google/callback`;

  try {
    let data: Record<string, unknown>;
    let response: Response;

    if (clientId && clientSecret) {
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }),
      });

      const tokenData = (await tokenRes.json()) as {
        id_token?: string;
        error?: string;
        error_description?: string;
      };

      if (!tokenRes.ok || !tokenData.id_token) {
        console.error('Google token exchange failed:', tokenData);
        return NextResponse.redirect(new URL('/login?error=google_token', origin));
      }

      ({ response, data } = await proxyAuthRequest('/auth/google', {
        idToken: tokenData.id_token,
        mobile,
        ...(mobile ? { clientNonce } : {}),
      }));
    } else {
      ({ response, data } = await proxyAuthRequest('/auth/google/exchange', {
        code,
        redirectUri,
        mobile,
        ...(mobile ? { clientNonce } : {}),
      }));
    }

    if (!response.ok || !data.success) {
      const message =
        typeof data.message === 'string' ? data.message : 'google_failed';
      const next = NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(message)}`, origin)
      );
      clearOAuthCookies(next);
      return next;
    }

    if (mobile) {
      const inner =
        data.data && typeof data.data === 'object'
          ? (data.data as Record<string, unknown>)
          : null;
      const handoffCode = inner?.handoffCode;
      if (typeof handoffCode !== 'string') {
        const next = NextResponse.redirect(
          new URL('/login?error=google_session', origin)
        );
        clearOAuthCookies(next);
        return next;
      }

      // Custom scheme → app. Le code seul ne suffit pas sans nonce WebView.
      const next = NextResponse.redirect(
        `mespoches://auth/google?code=${encodeURIComponent(handoffCode)}`
      );
      clearOAuthCookies(next);
      return next;
    }

    const session = extractAuthSession(
      data as Parameters<typeof extractAuthSession>[0]
    );
    if (!session) {
      const next = NextResponse.redirect(
        new URL('/login?error=google_session', origin)
      );
      clearOAuthCookies(next);
      return next;
    }

    const { verifyAuthToken } = await import('@/lib/server/jwt');
    if (!(await verifyAuthToken(session.token))) {
      const next = NextResponse.redirect(
        new URL('/login?error=google_session', origin)
      );
      clearOAuthCookies(next);
      return next;
    }

    const next = NextResponse.redirect(new URL('/auth/complete', `${origin}/`));
    applyAuthCookies(next, session.token, session.emailVerified);
    clearOAuthCookies(next);
    return next;
  } catch (err) {
    console.error('Google callback error:', err);
    const next = NextResponse.redirect(
      new URL('/login?error=google_failed', origin)
    );
    clearOAuthCookies(next);
    return next;
  }
}
