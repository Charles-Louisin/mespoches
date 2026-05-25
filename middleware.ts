import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const emailVerified = request.cookies.get('email_verified')?.value === 'true';
  const { pathname } = request.nextUrl;

  const publicRoutes = ['/login', '/onboarding', '/verify-email'];
  const isPublicRoute = publicRoutes.includes(pathname);

  // Token présent mais email non vérifié → page de vérification
  if (token && !emailVerified && pathname !== '/verify-email') {
    const pendingEmail = request.cookies.get('pending_email')?.value;
    const url = pendingEmail
      ? `/verify-email?email=${encodeURIComponent(pendingEmail)}`
      : '/verify-email';
    return NextResponse.redirect(new URL(url, request.url));
  }

  if (!token && !isPublicRoute) {
    const onboardingSeen = request.cookies.get('onboarding_seen')?.value;

    if (onboardingSeen) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.redirect(new URL('/onboarding', request.url));
  }

  if (token && emailVerified && isPublicRoute) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sw.js|workbox|manifest.json|icons|apple-touch-icon.png|favicon.png).*)',
  ],
};
