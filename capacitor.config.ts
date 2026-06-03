import type { CapacitorConfig } from '@capacitor/cli';

/**
 * L’app Android charge votre site Next.js déployé en HTTPS.
 * Définissez CAPACITOR_SERVER_URL avant `npm run cap:sync` (voir docs/PLAYSTORE_ANDROID.md).
 */
const serverUrl = process.env.CAPACITOR_SERVER_URL?.replace(/\/$/, '');

if (!serverUrl) {
  console.warn(
    '[Capacitor] CAPACITOR_SERVER_URL non défini — définissez l’URL HTTPS du frontend (ex. https://votre-app.vercel.app)'
  );
}

const config: CapacitorConfig = {
  appId: 'com.mespoches.app',
  appName: 'MES POCHES',
  webDir: 'public',
  android: {
    allowMixedContent: false,
    backgroundColor: '#635bff',
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: false,
      launchShowDuration: 0,
      backgroundColor: '#635bff',
      androidSplashResourceName: 'splash',
      showSpinner: false,
    },
  },
  ...(serverUrl
    ? {
        server: {
          url: serverUrl,
          androidScheme: 'https',
        },
      }
    : {}),
};

export default config;
