import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const { pathname } = request.nextUrl;

  // Routes publiques
  const publicRoutes = ['/login', '/onboarding'];
  const isPublicRoute = publicRoutes.includes(pathname);

  // Si pas de token et route protégée, rediriger vers onboarding/login
  if (!token && !isPublicRoute) {
    // Vérifier si l'onboarding a été vu (via un cookie ou localStorage - on va utiliser un cookie)
    const onboardingSeen = request.cookies.get('onboarding_seen')?.value;
    
    if (onboardingSeen) {
      return NextResponse.redirect(new URL('/login', request.url));
    } else {
      return NextResponse.redirect(new URL('/onboarding', request.url));
    }
  }

  // Si token présent et sur une route publique, rediriger vers l'accueil
  if (token && isPublicRoute) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sw.js|workbox|manifest.json|icons|apple-touch-icon.png|favicon.png).*)',
  ],
};
