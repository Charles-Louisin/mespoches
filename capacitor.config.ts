import type { CapacitorConfig } from '@capacitor/cli';
import fs from 'fs';
import path from 'path';

/**
 * Capacitor ne charge pas .env.local (contrairement à Next.js).
 * On lit le fichier ici pour que `npx cap sync` voie CAPACITOR_SERVER_URL.
 */
function loadEnvLocal(): void {
  const envPath = path.join(__dirname, '.env.local');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnvLocal();

const serverUrl = process.env.CAPACITOR_SERVER_URL?.replace(/\/$/, '');

function hostFromUrl(url: string | undefined): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

const serverHost = hostFromUrl(serverUrl);

if (!serverUrl) {
  console.warn(
    '[Capacitor] CAPACITOR_SERVER_URL non défini — ajoutez-le dans .env.local (ex. https://votre-app.vercel.app)'
  );
} else {
  console.log(`[Capacitor] server.url=${serverUrl} (host=${serverHost})`);
}

const allowNavigation = Array.from(
  new Set(
    [
      serverHost,
      'mespoches.vercel.app',
      '*.vercel.app',
      'mespoches.store',
      'www.mespoches.store',
      'mespochesbackend-production.up.railway.app',
      'mespochesbackend-production-9bfe.up.railway.app',
      '*.up.railway.app',
      'accounts.google.com',
      '*.google.com',
      'localhost',
      '127.0.0.1',
    ].filter((h): h is string => Boolean(h))
  )
);

const config: CapacitorConfig = {
  appId: 'com.mespoches.app',
  appName: 'MES POCHES',
  webDir: 'public',
  android: {
    allowMixedContent: false,
    backgroundColor: '#F8FAFC',
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: false,
      launchShowDuration: 0,
      backgroundColor: '#2563EB',
      androidSplashResourceName: 'splash',
      showSpinner: true,
      androidSpinnerStyle: 'large',
      spinnerColor: '#ffffff',
    },
  },
  ...(serverUrl
    ? {
        server: {
          url: serverUrl,
          allowNavigation,
        },
      }
    : {}),
};

export default config;
