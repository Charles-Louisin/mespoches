import { NextRequest, NextResponse } from 'next/server';
import { UTApi, UTFile } from 'uploadthing/server';
import { getRequestUserId } from '@/lib/server/request-auth';

const MAX_BYTES = 4 * 1024 * 1024;
const utapi = new UTApi();

export const runtime = 'nodejs';

function isAllowedCorsOrigin(origin: string): boolean {
  try {
    const u = new URL(origin);
    const host = u.hostname.toLowerCase();
    if (host === 'localhost' || host === '127.0.0.1') return true;
    if (/^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.)/.test(host)) return true;
    if (host === 'mespoches.store' || host.endsWith('.mespoches.store')) return true;
    if (host.endsWith('.exp.direct') || host.endsWith('.expo.dev') || host === 'auth.expo.io') {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

function corsHeaders(request: NextRequest): Record<string, string> {
  const origin = request.headers.get('origin') || '';
  return {
    'Access-Control-Allow-Origin': isAllowedCorsOrigin(origin) ? origin : 'https://www.mespoches.store',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    Vary: 'Origin',
  };
}

function json(
  request: NextRequest,
  body: Record<string, unknown>,
  status: number
): NextResponse {
  return NextResponse.json(body, { status, headers: corsHeaders(request) });
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(request) });
}

/** Upload Expo (FormData + Bearer) → même stockage UploadThing que la PWA. */
export async function POST(request: NextRequest) {
  const userId = await getRequestUserId(request);
  if (!userId) {
    return json(request, { success: false, message: 'Non autorisé' }, 401);
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json(request, { success: false, message: 'Fichier illisible' }, 400);
  }

  const raw = form.get('file');
  if (!(raw instanceof Blob)) {
    return json(request, { success: false, message: 'Aucune image' }, 400);
  }

  const type = (raw.type || 'image/jpeg').toLowerCase();
  if (!type.startsWith('image/')) {
    return json(request, { success: false, message: 'Format image requis' }, 400);
  }
  if (raw.size > MAX_BYTES) {
    return json(request, { success: false, message: 'Image trop volumineuse (max 4 Mo)' }, 400);
  }

  const name =
    raw instanceof File && raw.name ? raw.name.replace(/[^\w.-]+/g, '_') : 'mes-poches.jpg';
  const file = new UTFile([raw], name, { type });

  try {
    const result = await utapi.uploadFiles(file);
    const uploaded = Array.isArray(result) ? result[0] : result;
    if (!uploaded || uploaded.error || !uploaded.data) {
      console.error('UploadThing mobile failed:', uploaded?.error);
      return json(request, { success: false, message: 'Envoi impossible' }, 502);
    }
    const url = uploaded.data.ufsUrl || uploaded.data.url;
    if (!url) {
      return json(request, { success: false, message: 'URL image manquante' }, 502);
    }
    return json(request, { success: true, data: { url } }, 200);
  } catch (err) {
    console.error('Upload image error:', err);
    return json(request, { success: false, message: 'Envoi impossible' }, 500);
  }
}
