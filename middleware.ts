import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyAuthToken } from '@/lib/server/jwt'
import {
  AUTH_TOKEN_COOKIE,
  EMAIL_VERIFIED_COOKIE,
  PENDING_EMAIL_COOKIE,
} from '@/lib/server/session-cookies'

const PUBLIC_PREFIXES = ['/legal', '/login', '/verify-email', '/forgot-password', '/auth']

function isPublicPath(pathname: string): boolean {
  if (pathname === '/') return true
  return PUBLIC_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
}

export async function middleware(request: NextRequest) {
  const rawToken = request.cookies.get(AUTH_TOKEN_COOKIE)?.value
  const { pathname } = request.nextUrl
  const payload = rawToken ? await verifyAuthToken(rawToken) : null
  const hasValidToken = !!payload
  const emailVerifiedCookie = request.cookies.get(EMAIL_VERIFIED_COOKIE)?.value === 'true'
  const emailVerified = hasValidToken && (emailVerifiedCookie || payload?.emailVerified === true)

  if (rawToken && !hasValidToken) {
    const res = NextResponse.redirect(new URL('/login', request.url))
    res.cookies.set(AUTH_TOKEN_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 })
    res.cookies.set(EMAIL_VERIFIED_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 })
    return res
  }

  if (hasValidToken && !emailVerified && pathname !== '/verify-email') {
    const pendingEmail = request.cookies.get(PENDING_EMAIL_COOKIE)?.value
    const url = pendingEmail
      ? `/verify-email?email=${encodeURIComponent(pendingEmail)}`
      : '/verify-email'
    return NextResponse.redirect(new URL(url, request.url))
  }

  if (pathname.startsWith('/admin') && !hasValidToken) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (!hasValidToken && !isPublicPath(pathname) && pathname !== '/') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (
    hasValidToken &&
    emailVerified &&
    (pathname === '/login' || pathname === '/verify-email' || pathname === '/forgot-password')
  ) {
    const dest = payload?.role === 'admin' ? '/admin' : '/compte'
    return NextResponse.redirect(new URL(dest, request.url))
  }

  if (pathname === '/login' || pathname.startsWith('/admin') || pathname.startsWith('/auth') || pathname.startsWith('/compte')) {
    const res = NextResponse.next()
    res.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive')
    return res
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|manifest.json|icons|logo\\.png|logo\\.svg|apple-touch-icon.png|favicon.png|mes-poches\\.apk).*)'],
}
