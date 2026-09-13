import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyAuthToken } from '@/lib/server/jwt'
import {
  AUTH_TOKEN_COOKIE,
  EMAIL_VERIFIED_COOKIE,
  PENDING_EMAIL_COOKIE,
} from '@/lib/server/session-cookies'
import {
  NATIVE_APP_COOKIE,
  NATIVE_QUERY_PARAM,
  isLandingPublicPath,
  isNativeUserAgent,
  shouldShowPublicLanding,
} from '@/lib/web-gate'

const PUBLIC_PREFIXES = [
  '/legal',
  '/login',
  '/onboarding',
  '/verify-email',
  '/auth',
  '/download',
]

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  )
}

function withNativeCookie(res: NextResponse, request: NextRequest): NextResponse {
  const secure = request.nextUrl.protocol === 'https:'
  res.cookies.set(NATIVE_APP_COOKIE, '1', {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
    secure,
    httpOnly: false,
  })
  return res
}

export async function middleware(request: NextRequest) {
  const rawToken = request.cookies.get(AUTH_TOKEN_COOKIE)?.value
  const { pathname, searchParams } = request.nextUrl
  const hostname = request.nextUrl.hostname

  const nativeFromQuery = searchParams.get(NATIVE_QUERY_PARAM) === '1'
  const isNative =
    nativeFromQuery ||
    request.cookies.get(NATIVE_APP_COOKIE)?.value === '1' ||
    isNativeUserAgent(request.headers.get('user-agent'))

  const publicLanding = shouldShowPublicLanding({
    hostname,
    isDev: process.env.NODE_ENV === 'development',
    isNative,
  })

  // APK qui aurait atterri sur /download → renvoyer dans l'app
  if (isNative && pathname === '/download') {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.delete(NATIVE_QUERY_PARAM)
    return withNativeCookie(NextResponse.redirect(url), request)
  }

  if (publicLanding && !isLandingPublicPath(pathname)) {
    return NextResponse.redirect(new URL('/download', request.url))
  }

  // Retirer ?native=1 de l'URL tout en posant le cookie (1er lancement APK)
  if (nativeFromQuery) {
    const url = request.nextUrl.clone()
    url.searchParams.delete(NATIVE_QUERY_PARAM)
    const res =
      url.toString() !== request.nextUrl.toString()
        ? NextResponse.redirect(url)
        : NextResponse.next()
    return withNativeCookie(res, request)
  }

  const isPublicRoute = isPublicPath(pathname)

  const payload = rawToken ? await verifyAuthToken(rawToken) : null
  const hasValidToken = !!payload

  const emailVerifiedCookie =
    request.cookies.get(EMAIL_VERIFIED_COOKIE)?.value === 'true'
  const emailVerified =
    hasValidToken &&
    (emailVerifiedCookie || payload?.emailVerified === true)

  if (rawToken && !hasValidToken) {
    const res = NextResponse.redirect(
      new URL(
        request.cookies.get('onboarding_seen')?.value ? '/login' : '/onboarding',
        request.url
      )
    )
    res.cookies.set(AUTH_TOKEN_COOKIE, '', {
      httpOnly: true,
      path: '/',
      maxAge: 0,
    })
    res.cookies.set(EMAIL_VERIFIED_COOKIE, '', {
      httpOnly: true,
      path: '/',
      maxAge: 0,
    })
    return isNative ? withNativeCookie(res, request) : res
  }

  if (hasValidToken && !emailVerified && pathname !== '/verify-email') {
    const pendingEmail = request.cookies.get(PENDING_EMAIL_COOKIE)?.value
    const url = pendingEmail
      ? `/verify-email?email=${encodeURIComponent(pendingEmail)}`
      : '/verify-email'
    const res = NextResponse.redirect(new URL(url, request.url))
    return isNative ? withNativeCookie(res, request) : res
  }

  if (!hasValidToken && !isPublicRoute) {
    const onboardingSeen = request.cookies.get('onboarding_seen')?.value
    const res = NextResponse.redirect(
      new URL(onboardingSeen ? '/login' : '/onboarding', request.url)
    )
    return isNative ? withNativeCookie(res, request) : res
  }

  if (
    hasValidToken &&
    emailVerified &&
    (pathname === '/login' ||
      pathname === '/onboarding' ||
      pathname === '/verify-email')
  ) {
    const res = NextResponse.redirect(new URL('/', request.url))
    return isNative ? withNativeCookie(res, request) : res
  }

  const res = NextResponse.next()
  return isNative ? withNativeCookie(res, request) : res
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sw.js|workbox|manifest.json|icons|logo\\.png|logo\\.svg|logo1\\.jpeg|apple-touch-icon.png|favicon.png|mes-poches\\.apk).*)',
  ],
}
