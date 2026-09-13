import { getServerBackendApiUrl } from '@/lib/api-config';

export function localGoogleClientId(): string {
  return (
    process.env.GOOGLE_CLIENT_ID?.trim() ||
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim() ||
    ''
  );
}

export function localGoogleClientSecret(): string {
  return process.env.GOOGLE_CLIENT_SECRET?.trim() || '';
}

/** Client ID : env Vercel, sinon celui du backend Railway. */
export async function resolveGoogleClientId(): Promise<string> {
  const local = localGoogleClientId();
  if (local) return local;

  try {
    const backend = getServerBackendApiUrl();
    const response = await fetch(`${backend}/auth/google/client`, {
      cache: 'no-store',
    });
    if (!response.ok) return '';
    const data = (await response.json()) as {
      success?: boolean;
      data?: { clientId?: string };
    };
    return data.data?.clientId?.trim() || '';
  } catch {
    return '';
  }
}
