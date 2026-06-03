'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Capacitor } from '@capacitor/core';
import { SplashScreen } from '@capacitor/splash-screen';
import AppLogo from '@/components/AppLogo';

const MIN_DISPLAY_MS = 1200;
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
      await new Promise((r) => setTimeout(r, 400));
      try {
        await SplashScreen.hide({ fadeOutDuration: 250 });
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
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-opacity duration-400 ${
        fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{ backgroundColor: BRAND_BLUE }}
      aria-hidden={fadeOut}
      role="status"
      aria-label="Chargement de MES POCHES"
    >
      <div className="relative flex flex-col items-center">
        {/* Anneau pulsant */}
        <motion.div
          className="absolute rounded-full border-2 border-white/40"
          style={{ width: 136, height: 136, top: -8, left: -8 }}
          animate={{ scale: [1, 1.18, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
          aria-hidden
        />

        {/* Logo entrant + respiration */}
        <motion.div
          initial={{ scale: 0.72, opacity: 0, y: 12 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        >
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          >
            <AppLogo size="xl" priority className="shadow-2xl ring-4 ring-white/25" />
          </motion.div>
        </motion.div>

        {/* Reflet balayant */}
        <motion.div
          className="absolute inset-0 rounded-full overflow-hidden pointer-events-none"
          style={{ width: 120, height: 120 }}
          aria-hidden
        >
          <motion.div
            className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-12"
            initial={{ x: '-120%' }}
            animate={{ x: '220%' }}
            transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut', repeatDelay: 0.4 }}
          />
        </motion.div>
      </div>

      <motion.p
        className="mt-8 text-lg font-bold text-white tracking-wide"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        MES POCHES
      </motion.p>
      <motion.p
        className="text-sm text-white/75 mt-1 mb-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        Vos finances, en poche
      </motion.p>

      {/* Barre de progression indéterminée */}
      <div className="w-40 h-1 rounded-full bg-white/20 overflow-hidden" aria-hidden>
        <motion.div
          className="h-full w-1/3 rounded-full bg-white/90"
          animate={{ x: ['-100%', '320%'] }}
          transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
        />
      </div>
    </div>
  );
}
