import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAuthToken } from '@/lib/server/jwt';
import {
  AUTH_TOKEN_COOKIE,
  EMAIL_VERIFIED_COOKIE,
  PENDING_EMAIL_COOKIE,
} from '@/lib/server/session-cookies';

const PUBLIC_PREFIXES = ['/legal', '/login', '/onboarding', '/verify-email', '/auth'];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export async function middleware(request: NextRequest) {
  const rawToken = request.cookies.get(AUTH_TOKEN_COOKIE)?.value;
  const { pathname } = request.nextUrl;
  const isPublicRoute = isPublicPath(pathname);

  const payload = rawToken ? await verifyAuthToken(rawToken) : null;
  const hasValidToken = !!payload;

  // Cookie email_verified HttpOnly (posé uniquement par le serveur) + claim JWT éventuel
  const emailVerifiedCookie =
    request.cookies.get(EMAIL_VERIFIED_COOKIE)?.value === 'true';
  const emailVerified =
    hasValidToken &&
    (emailVerifiedCookie || payload?.emailVerified === true);

  // Token cookie présent mais signature invalide → nettoyer et traiter comme anonyme
  if (rawToken && !hasValidToken) {
    const res = NextResponse.redirect(
      new URL(
        request.cookies.get('onboarding_seen')?.value ? '/login' : '/onboarding',
        request.url
      )
    );
    res.cookies.set(AUTH_TOKEN_COOKIE, '', {
      httpOnly: true,
      path: '/',
      maxAge: 0,
    });
    res.cookies.set(EMAIL_VERIFIED_COOKIE, '', {
      httpOnly: true,
      path: '/',
      maxAge: 0,
    });
    return res;
  }

  if (hasValidToken && !emailVerified && pathname !== '/verify-email') {
    const pendingEmail = request.cookies.get(PENDING_EMAIL_COOKIE)?.value;
    const url = pendingEmail
      ? `/verify-email?email=${encodeURIComponent(pendingEmail)}`
      : '/verify-email';
    return NextResponse.redirect(new URL(url, request.url));
  }

  if (!hasValidToken && !isPublicRoute) {
    const onboardingSeen = request.cookies.get('onboarding_seen')?.value;

    if (onboardingSeen) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.redirect(new URL('/onboarding', request.url));
  }

  if (
    hasValidToken &&
    emailVerified &&
    (pathname === '/login' ||
      pathname === '/onboarding' ||
      pathname === '/verify-email')
  ) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sw.js|workbox|manifest.json|icons|logo\\.png|logo\\.svg|logo1\\.jpeg|apple-touch-icon.png|favicon.png).*)',
  ],
};
