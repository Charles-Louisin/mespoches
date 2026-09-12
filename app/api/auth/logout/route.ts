import { NextRequest, NextResponse } from 'next/server';
import {
  AUTH_TOKEN_COOKIE,
  clearAuthCookies,
} from '@/lib/server/session-cookies';
import { getServerBackendApiUrl } from '@/lib/api-config';

export async function POST(request: NextRequest) {
  const token = request.cookies.get(AUTH_TOKEN_COOKIE)?.value;

  if (token) {
    try {
      await fetch(`${getServerBackendApiUrl()}/auth/logout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });
    } catch {
      /* cookie cleared even if revoke fails */
    }
  }

  const response = NextResponse.json({ success: true });
  clearAuthCookies(response);
  return response;
}
