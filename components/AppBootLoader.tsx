'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Capacitor } from '@capacitor/core';
import { SplashScreen } from '@capacitor/splash-screen';
import AppLogo from '@/components/AppLogo';

const MIN_DISPLAY_MS = 1100;
const BRAND_BLUE = '#2563EB';

export default function AppBootLoader() {
  const [visible, setVisible] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    setVisible(true);
    const started = Date.now();

    const finish = async () => {
      const elapsed = Date.now() - started;
      const wait = Math.max(0, MIN_DISPLAY_MS - elapsed);
      await new Promise((r) => setTimeout(r, wait));
      setFadeOut(true);
      await new Promise((r) => setTimeout(r, 320));
      try {
        await SplashScreen.hide({ fadeOutDuration: 220 });
      } catch {
        /* ignore */
      }
      setVisible(false);
    };

    if (document.readyState === 'complete') {
      void finish();
    } else {
      window.addEventListener('load', () => void finish(), { once: true });
    }
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-opacity duration-300 ${
        fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{ backgroundColor: BRAND_BLUE }}
      aria-hidden={fadeOut}
      role="status"
      aria-label="Chargement de MES POCHES"
    >
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="flex flex-col items-center"
      >
        <AppLogo size="xl" priority className="shadow-lg" />
        <p className="mt-7 font-display text-xl text-white tracking-wide">MES POCHES</p>
        <p className="text-sm text-white/80 mt-1">Vos finances, en poche</p>
      </motion.div>
    </div>
  );
}
