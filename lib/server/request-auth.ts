import { verifyAuthToken } from '@/lib/server/jwt';
import { AUTH_TOKEN_COOKIE } from '@/lib/server/session-cookies';

/** JWT cookie PWA ou Bearer Expo. */
export function extractRequestAuthToken(req: Request): string | null {
  const header = req.headers.get('authorization');
  if (header?.toLowerCase().startsWith('bearer ')) {
    const token = header.slice(7).trim();
    if (token) return token;
  }

  const cookieHeader = req.headers.get('cookie') ?? '';
  const match = cookieHeader.match(
    new RegExp(`(?:^|;\\s*)${AUTH_TOKEN_COOKIE}=([^;]+)`)
  );
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

export async function getRequestUserId(req: Request): Promise<string | null> {
  const token = extractRequestAuthToken(req);
  if (!token) return null;
  const payload = await verifyAuthToken(token);
  return payload?.id ? String(payload.id) : null;
}
