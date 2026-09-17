import { NextRequest, NextResponse } from 'next/server';
import { proxyAuthRequest } from '@/lib/server/verification-email';
import {
  applyAuthCookies,
  extractAuthSession,
} from '@/lib/server/session-cookies';
import {
  appendHandoffCode,
  isAllowedAppReturnTo,
  parseOAuthState,
  resolveCallbackOrigin,
} from '@/lib/server/oauth-origin';
import {
  localGoogleClientId,
  localGoogleClientSecret,
} from '@/lib/server/google-oauth';

const NONCE_COOKIE = 'google_oauth_client_nonce';
const STATE_COOKIE = 'google_oauth_state';
const RETURN_COOKIE = 'google_oauth_return_to';

function clearOAuthCookies(response: NextResponse): void {
  for (const name of [STATE_COOKIE, NONCE_COOKIE, RETURN_COOKIE]) {
    response.cookies.set(name, '', {
      httpOnly: true,
      path: '/',
      maxAge: 0,
    });
  }
}

function failRedirect(
  request: NextRequest,
  origin: string,
  error: string,
  mobile: boolean,
  parsedState: ReturnType<typeof parseOAuthState>
): NextResponse {
  const returnTo =
    request.cookies.get(RETURN_COOKIE)?.value || parsedState?.returnTo;
  if (mobile && isAllowedAppReturnTo(returnTo)) {
    const sep = returnTo.includes('?') ? '&' : '?';
    const next = NextResponse.redirect(
      `${returnTo}${sep}error=${encodeURIComponent(error)}`
    );
    clearOAuthCookies(next);
    return next;
  }
  const next = NextResponse.redirect(
    new URL(`/login?error=${encodeURIComponent(error)}`, origin)
  );
  clearOAuthCookies(next);
  return next;
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
  const clientNonce =
    request.cookies.get(NONCE_COOKIE)?.value || parsedState?.nonce;

  if (oauthError || !code) {
    return failRedirect(
      request,
      origin,
      oauthError || 'google_denied',
      mobile,
      parsedState
    );
  }
  if (!returnedState || !parsedState) {
    return failRedirect(request, origin, 'google_state', mobile, parsedState);
  }

  // Si le cookie state est présent, il doit correspondre (anti-CSRF).
  // S'il est absent (www ↔ apex), on continue : le code OAuth est à usage unique.
  if (
    stateCookie &&
    (returnedState !== stateCookie ||
      !parsedCookie ||
      parsedState.id !== parsedCookie.id)
  ) {
    return failRedirect(request, origin, 'google_state', mobile, parsedState);
  }

  if (mobile && (!clientNonce || clientNonce.length < 32)) {
    return failRedirect(request, origin, 'google_nonce', mobile, parsedState);
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
        return failRedirect(request, origin, 'google_token', mobile, parsedState);
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
      return failRedirect(request, origin, message, mobile, parsedState);
    }

    if (mobile) {
      const inner =
        data.data && typeof data.data === 'object'
          ? (data.data as Record<string, unknown>)
          : null;
      const handoffCode = inner?.handoffCode;
      if (typeof handoffCode !== 'string') {
        return failRedirect(request, origin, 'google_session', mobile, parsedState);
      }

      const returnTo =
        request.cookies.get(RETURN_COOKIE)?.value || parsedState?.returnTo;
      const appTarget = isAllowedAppReturnTo(returnTo)
        ? returnTo
        : 'mespoches://auth/google';

      const next = NextResponse.redirect(appendHandoffCode(appTarget, handoffCode));
      clearOAuthCookies(next);
      return next;
    }

    const session = extractAuthSession(
      data as Parameters<typeof extractAuthSession>[0]
    );
    if (!session) {
      return failRedirect(request, origin, 'google_session', mobile, parsedState);
    }

    const { verifyAuthToken } = await import('@/lib/server/jwt');
    if (!(await verifyAuthToken(session.token))) {
      return failRedirect(request, origin, 'google_session', mobile, parsedState);
    }

    const next = NextResponse.redirect(new URL('/auth/complete', `${origin}/`));
    applyAuthCookies(next, session.token, session.emailVerified);
    clearOAuthCookies(next);
    return next;
  } catch (err) {
    console.error('Google callback error:', err);
    return failRedirect(request, origin, 'google_failed', mobile, parsedState);
  }
}
