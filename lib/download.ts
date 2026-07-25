import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

export async function downloadBlob(blob: Blob, filename: string): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    const base64 = await blobToBase64(blob);
    const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');

    const result = await Filesystem.writeFile({
      path: `MES-POCHES/${safeName}`,
      data: base64,
      directory: Directory.Documents,
      recursive: true,
    });

    try {
      await Share.share({
        title: safeName,
        text: safeName,
        url: result.uri,
        dialogTitle: 'Enregistrer le fichier',
      });
    } catch {
      /* partage annulé */
    }
    return;
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const data = reader.result as string;
      resolve(data.split(',')[1] ?? data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
