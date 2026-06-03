'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Capacitor } from '@capacitor/core';
import { SplashScreen } from '@capacitor/splash-screen';

const MIN_DISPLAY_MS = 900;

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
      await new Promise((r) => setTimeout(r, 350));
      try {
        await SplashScreen.hide({ fadeOutDuration: 200 });
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
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-primary-400 via-primary-500 to-primary-800 transition-opacity duration-300 ${
        fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      aria-hidden={fadeOut}
      role="status"
      aria-label="Chargement de MES POCHES"
    >
      <div className="relative mb-8">
        <div className="absolute inset-0 rounded-3xl bg-white/20 blur-2xl scale-110 animate-pulse" />
        <div className="relative w-28 h-28 rounded-3xl overflow-hidden shadow-2xl ring-4 ring-white/30">
          <Image src="/icons/icon-192x192.png" alt="" fill className="object-cover" priority />
        </div>
      </div>
      <h1 className="text-2xl font-bold text-white tracking-tight mb-1">MES POCHES</h1>
      <p className="text-sm text-white/80 mb-10">Vos finances, en poche</p>
      <div className="flex items-end gap-1.5 h-8" aria-hidden>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2 rounded-full bg-white/90 animate-bounce"
            style={{
              height: `${12 + i * 6}px`,
              animationDelay: `${i * 120}ms`,
              animationDuration: '0.9s',
            }}
          />
        ))}
      </div>
    </div>
  );
}
