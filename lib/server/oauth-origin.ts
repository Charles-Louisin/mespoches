import type { NextRequest } from 'next/server';

function stripSlash(value: string): string {
  return value.replace(/\/$/, '');
}

function isLocalHost(host: string): boolean {
  return /^(localhost|127\.0\.0\.1)(:\d+)?$/i.test(host);
}

function envPublicOrigin(): string {
  return stripSlash(
    process.env.GOOGLE_REDIRECT_ORIGIN ||
      process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_ORIGIN ||
      process.env.NEXT_PUBLIC_APP_URL ||
      ''
  );
}

/**
 * Origine OAuth (redirect_uri).
 * - App (mobile=1) → tunnel / URL publique du .env
 * - Web sur localhost → reste sur localhost (jamais ngrok)
 */
export function resolveOAuthOrigin(request: NextRequest): string {
  const forwardedHost = request.headers
    .get('x-forwarded-host')
    ?.split(',')[0]
    ?.trim();
  const requestHost = request.headers.get('host')?.split(',')[0]?.trim();
  const forwardedProto =
    request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim();
  const mobile = request.nextUrl.searchParams.get('mobile') === '1';
  const override = envPublicOrigin();

  // 1) App native : toujours l'URL publique (ngrok / prod)
  if (mobile && override.startsWith('http')) {
    try {
      const parsed = new URL(override);
      if (!isLocalHost(parsed.host)) return stripSlash(override);
    } catch {
      /* ignore */
    }
  }

  // 2) Navigateur local : Host localhost → jamais le .env ngrok
  if (requestHost && isLocalHost(requestHost)) {
    return `http://${requestHost}`;
  }

  // 3) Tunnel / reverse-proxy
  if (forwardedHost && !isLocalHost(forwardedHost)) {
    const proto = forwardedProto || 'https';
    return `${proto}://${forwardedHost}`.replace(/\/$/, '');
  }

  const host = requestHost || forwardedHost || request.nextUrl.host;
  if (host && isLocalHost(host)) {
    return `http://${host}`;
  }

  if (override.startsWith('http')) {
    try {
      const parsed = new URL(override);
      if (!isLocalHost(parsed.host)) return stripSlash(override);
    } catch {
      /* ignore */
    }
  }

  const origin = request.nextUrl.origin.replace(
    /^https:\/\/(localhost|127\.0\.0\.1)/i,
    'http://$1'
  );
  return stripSlash(origin);
}

/** Callback : mobile → URL publique ; web → origine de la requête (localhost). */
export function resolveCallbackOrigin(
  request: NextRequest,
  mobile: boolean
): string {
  if (mobile) {
    const override = envPublicOrigin();
    if (override.startsWith('http')) {
      try {
        const parsed = new URL(override);
        if (!isLocalHost(parsed.host)) return stripSlash(override);
      } catch {
        /* ignore */
      }
    }
  }

  const requestHost = request.headers.get('host')?.split(',')[0]?.trim();
  if (requestHost && isLocalHost(requestHost)) {
    return `http://${requestHost}`;
  }

  return resolveOAuthOrigin(request);
}

/** state OAuth : uuid + flag mobile (survit même si le cookie tombe). */
export function buildOAuthState(mobile: boolean): string {
  return `${crypto.randomUUID()}:${mobile ? '1' : '0'}`;
}

export function parseOAuthState(returnedState: string | null): {
  id: string;
  mobile: boolean;
} | null {
  if (!returnedState) return null;
  const separator = returnedState.lastIndexOf(':');
  if (separator < 0) return { id: returnedState, mobile: false };
  const id = returnedState.slice(0, separator);
  const flag = returnedState.slice(separator + 1);
  if (!id) return null;
  return { id, mobile: flag === '1' };
}
