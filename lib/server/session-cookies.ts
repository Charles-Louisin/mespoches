import { NextResponse } from 'next/server';

export const AUTH_TOKEN_COOKIE = 'auth_token';
export const EMAIL_VERIFIED_COOKIE = 'email_verified';
export const PENDING_EMAIL_COOKIE = 'pending_email';

const TOKEN_MAX_AGE = 60 * 60 * 12; // 12 h — aligné sur JWT_EXPIRES_IN par défaut
const PENDING_MAX_AGE = 60 * 60 * 24; // 1 jour

function cookieSecure(): boolean {
  return process.env.NODE_ENV === 'production';
}

/** Partage www / apex (mespoches.store) en production. */
function cookieDomain(): string | undefined {
  const raw =
    process.env.COOKIE_DOMAIN ||
    process.env.NEXT_PUBLIC_COOKIE_DOMAIN ||
    '';
  const trimmed = raw.trim();
  if (trimmed) return trimmed;
  return undefined;
}

const baseCookie = {
  httpOnly: true,
  secure: cookieSecure(),
  sameSite: 'lax' as const,
  path: '/',
  ...(cookieDomain() ? { domain: cookieDomain() } : {}),
};

export function applyAuthCookies(
  response: NextResponse,
  token: string,
  emailVerified: boolean
): void {
  response.cookies.set(AUTH_TOKEN_COOKIE, token, {
    ...baseCookie,
    maxAge: TOKEN_MAX_AGE,
  });

  if (emailVerified) {
    response.cookies.set(EMAIL_VERIFIED_COOKIE, 'true', {
      ...baseCookie,
      maxAge: TOKEN_MAX_AGE,
    });
  } else {
    response.cookies.set(EMAIL_VERIFIED_COOKIE, '', {
      ...baseCookie,
      maxAge: 0,
    });
  }

  response.cookies.set(PENDING_EMAIL_COOKIE, '', {
    ...baseCookie,
    maxAge: 0,
  });
}

export function clearAuthCookies(response: NextResponse): void {
  for (const name of [
    AUTH_TOKEN_COOKIE,
    EMAIL_VERIFIED_COOKIE,
    PENDING_EMAIL_COOKIE,
  ]) {
    response.cookies.set(name, '', {
      ...baseCookie,
      maxAge: 0,
    });
  }
}

export function applyPendingEmailCookie(
  response: NextResponse,
  email: string
): void {
  response.cookies.set(PENDING_EMAIL_COOKIE, email, {
    ...baseCookie,
    maxAge: PENDING_MAX_AGE,
  });
}

type AuthSuccessBody = {
  success?: boolean;
  data?: {
    user?: { emailVerified?: boolean };
    token?: string;
  };
};

/** Extrait token + statut vérifié d'une réponse auth backend. */
export function extractAuthSession(data: AuthSuccessBody): {
  token: string;
  emailVerified: boolean;
} | null {
  const token = data?.data?.token;
  if (!data?.success || !token || typeof token !== 'string') return null;
  return {
    token,
    emailVerified: Boolean(data.data?.user?.emailVerified),
  };
}
