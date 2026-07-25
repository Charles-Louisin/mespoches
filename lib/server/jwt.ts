import { jwtVerify, type JWTPayload } from 'jose';

export type AuthJwtPayload = JWTPayload & {
  id?: string;
  emailVerified?: boolean;
  role?: string;
};

export function getJwtSecretKey(): Uint8Array | null {
  const secret = process.env.JWT_SECRET?.trim();
  if (!secret) return null;
  return new TextEncoder().encode(secret);
}

/** Vérifie la signature JWT (Edge + Node). Retourne null si invalide ou secret absent. */
export async function verifyAuthToken(
  token: string
): Promise<AuthJwtPayload | null> {
  const key = getJwtSecretKey();
  if (!key || !token) return null;

  try {
    const { payload } = await jwtVerify(token, key);
    return payload as AuthJwtPayload;
  } catch {
    return null;
  }
}
