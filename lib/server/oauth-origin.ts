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
 * Origine OAuth (redirect_uri) = host réel de la requête.
 * Ne jamais forcer www : le cookie state doit rester sur le même host.
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

  // App native : URL publique (Vercel / domaine custom)
  if (mobile && override.startsWith('http')) {
    try {
      const parsed = new URL(override);
      if (!isLocalHost(parsed.host)) return stripSlash(override);
    } catch {
      /* ignore */
    }
  }

  if (requestHost && isLocalHost(requestHost)) {
    return `http://${requestHost}`;
  }

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

/** Callback : même host que la requête (ou override mobile). */
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

  // Priorité au host réel du callback (cookie state sur ce host)
  const forwardedHost = request.headers
    .get('x-forwarded-host')
    ?.split(',')[0]
    ?.trim();
  const forwardedProto =
    request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim();
  if (forwardedHost && !isLocalHost(forwardedHost)) {
    return `${forwardedProto || 'https'}://${forwardedHost}`.replace(/\/$/, '');
  }
  if (requestHost) {
    return `https://${requestHost}`.replace(/\/$/, '');
  }

  return resolveOAuthOrigin(request);
}

export function buildOAuthState(
  mobile: boolean,
  extra?: { returnTo?: string; nonce?: string }
): string {
  const base = `${crypto.randomUUID()}:${mobile ? '1' : '0'}`;
  if (!extra?.returnTo && !extra?.nonce) return base;
  const packed = Buffer.from(
    JSON.stringify({
      r: extra.returnTo || '',
      n: extra.nonce || '',
    }),
    'utf8'
  ).toString('base64url');
  return `${base}:${packed}`;
}

export function parseOAuthState(returnedState: string | null): {
  id: string;
  mobile: boolean;
  returnTo?: string;
  nonce?: string;
} | null {
  if (!returnedState) return null;
  const match = returnedState.match(
    /^([0-9a-f-]{36}):([01])(?::([A-Za-z0-9_-]+))?$/i
  );
  if (!match) {
    const separator = returnedState.lastIndexOf(':');
    if (separator < 0) return { id: returnedState, mobile: false };
    const id = returnedState.slice(0, separator);
    const flag = returnedState.slice(separator + 1);
    if (!id) return null;
    return { id, mobile: flag === '1' };
  }

  const extraRaw = match[3];
  let returnTo: string | undefined;
  let nonce: string | undefined;
  if (extraRaw) {
    try {
      const extra = JSON.parse(
        Buffer.from(extraRaw, 'base64url').toString('utf8')
      ) as { r?: string; n?: string };
      if (typeof extra.r === 'string' && extra.r) returnTo = extra.r;
      if (typeof extra.n === 'string' && extra.n) nonce = extra.n;
    } catch {
      /* state PWA classique sans extra */
    }
  }
  return { id: match[1], mobile: match[2] === '1', returnTo, nonce };
}

const RETURN_TO_MAX = 512;

/** Deep link Expo / app après le callback Google (anti open-redirect). */
export function isAllowedAppReturnTo(value: string | null | undefined): value is string {
  if (!value || value.length > RETURN_TO_MAX) return false;
  try {
    const u = new URL(value);
    const scheme = u.protocol.replace(':', '').toLowerCase();
    if (scheme === 'mespoches') return true;
    if (scheme === 'exp' || scheme === 'exps') return true;
    if (scheme === 'http' && (u.hostname === 'localhost' || u.hostname === '127.0.0.1')) {
      return true;
    }
    if (
      scheme === 'https' &&
      (u.hostname === 'auth.expo.io' ||
        u.hostname.endsWith('.exp.direct') ||
        u.hostname.endsWith('.expo.dev'))
    ) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export function appendHandoffCode(returnTo: string, code: string): string {
  const sep = returnTo.includes('?') ? '&' : '?';
  return `${returnTo}${sep}code=${encodeURIComponent(code)}`;
}
