import { NextRequest, NextResponse } from 'next/server';
import { getServerBackendApiUrl } from '@/lib/api-config';
import { verifyAuthToken } from '@/lib/server/jwt';
import { AUTH_TOKEN_COOKIE, clearAuthCookies } from '@/lib/server/session-cookies';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Proxy authentifié : le JWT reste dans le cookie HttpOnly et n'est jamais
 * remis au JavaScript du navigateur. Une XSS ne peut donc pas voler la session.
 *
 * Seuls les chemins ci-dessous sont relayés — sinon ce serait un proxy ouvert.
 */
const ALLOWED_PATHS: RegExp[] = [/^auth\/me$/, /^admin\/[a-z0-9/_-]*$/i];

const FORWARDED_METHODS = new Set(['GET', 'POST', 'PATCH', 'PUT', 'DELETE']);

function isAllowedPath(path: string): boolean {
  if (path.includes('..')) return false;
  return ALLOWED_PATHS.some((re) => re.test(path));
}

async function handle(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
): Promise<NextResponse> {
  if (!FORWARDED_METHODS.has(request.method)) {
    return NextResponse.json({ success: false, message: 'Méthode non autorisée' }, { status: 405 });
  }

  const { path } = await context.params;
  const endpoint = (path || []).join('/');
  if (!isAllowedPath(endpoint)) {
    return NextResponse.json({ success: false, message: 'Route API introuvable' }, { status: 404 });
  }

  const token = request.cookies.get(AUTH_TOKEN_COOKIE)?.value;
  if (!token || !(await verifyAuthToken(token))) {
    const res = NextResponse.json(
      { success: false, code: 'SESSION_REVOKED', message: 'Session expirée. Reconnectez-vous.' },
      { status: 401 }
    );
    if (token) clearAuthCookies(res);
    return res;
  }

  const target = `${getServerBackendApiUrl()}/${endpoint}${request.nextUrl.search}`;
  const hasBody = request.method !== 'GET' && request.method !== 'DELETE';

  try {
    const upstream = await fetch(target, {
      method: request.method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      ...(hasBody ? { body: await request.text() } : {}),
      cache: 'no-store',
    });

    const contentType = upstream.headers.get('content-type') ?? '';
    if (!contentType.includes('application/json')) {
      return NextResponse.json(
        { success: false, message: `Erreur serveur (${upstream.status})` },
        { status: upstream.status === 200 ? 502 : upstream.status }
      );
    }

    return NextResponse.json(await upstream.json(), { status: upstream.status });
  } catch (error) {
    console.error('[api/proxy]', endpoint, error);
    return NextResponse.json(
      { success: false, message: 'Impossible de joindre le serveur' },
      { status: 502 }
    );
  }
}

export const GET = handle;
export const POST = handle;
export const PATCH = handle;
export const PUT = handle;
export const DELETE = handle;
