import { getServerBackendApiUrl } from '@/lib/api-config';

export async function proxyAuthRequest(
  path: string,
  body: Record<string, unknown>
): Promise<{ response: Response; data: Record<string, unknown> }> {
  const backend = getServerBackendApiUrl();

  const response = await fetch(`${backend}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = (await response.json()) as Record<string, unknown>;
  return { response, data };
}

/**
 * Retire code / contenu d'e-mail de vérification des réponses renvoyées au client.
 * L'envoi se fait uniquement côté backend (Resend) vers l'adresse de l'utilisateur.
 */
export function sanitizeAuthResponseForClient(
  data: Record<string, unknown>
): Record<string, unknown> {
  if (!data || typeof data !== 'object') return data;
  const copy = { ...data };
  delete copy.verificationCode;
  delete copy.verificationEmailContent;
  if (copy.data && typeof copy.data === 'object') {
    const inner = { ...(copy.data as Record<string, unknown>) };
    delete inner.verificationCode;
    delete inner.verificationEmailContent;
    copy.data = inner;
  }
  return copy;
}
