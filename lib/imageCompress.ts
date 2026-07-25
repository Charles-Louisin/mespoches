/** Compresse une image pour l'API ai-scan (évite HTTP 413 via ngrok/Express). */
export async function compressImageForScan(
  input: string,
  mimeType = 'image/jpeg',
  maxWidth = 960,
  maxBytes = 450_000
): Promise<{ image: string; mimeType: string }> {
  const dataUrl = input.startsWith('data:') ? input : `data:${mimeType};base64,${input}`;

  const img = await loadImage(dataUrl);
  let width = img.width;
  let height = img.height;
  let targetMaxW = maxWidth;
  let quality = 0.7;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas indisponible');

  let output = '';

  for (let attempt = 0; attempt < 8; attempt++) {
    const size = fitSize(width, height, targetMaxW);
    canvas.width = size.width;
    canvas.height = size.height;
    ctx.drawImage(img, 0, 0, size.width, size.height);
    output = canvas.toDataURL('image/jpeg', quality);

    if (base64ByteSize(output) <= maxBytes) {
      return { image: stripDataUrl(output), mimeType: 'image/jpeg' };
    }

    if (quality > 0.4) {
      quality -= 0.08;
    } else {
      targetMaxW = Math.round(targetMaxW * 0.82);
      quality = 0.65;
    }
  }

  return { image: stripDataUrl(output), mimeType: 'image/jpeg' };
}

/** Base64 pur (sans préfixe data:) — réduit la taille du JSON. */
export function stripDataUrl(dataUrl: string): string {
  const i = dataUrl.indexOf(',');
  return i >= 0 ? dataUrl.slice(i + 1) : dataUrl;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Image illisible'));
    img.src = src;
  });
}

function fitSize(w: number, h: number, maxW: number) {
  if (w <= maxW) return { width: w, height: h };
  const ratio = maxW / w;
  return { width: maxW, height: Math.round(h * ratio) };
}

function base64ByteSize(dataUrl: string): number {
  const base64 = stripDataUrl(dataUrl);
  return Math.ceil((base64.length * 3) / 4);
}
