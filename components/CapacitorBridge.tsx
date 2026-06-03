'use client';

import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';

/** Barre de statut native (Capacitor). Le splash est masqué par AppBootLoader. */
export default function CapacitorBridge() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    StatusBar.setStyle({ style: Style.Light }).catch(() => {});
    if (Capacitor.getPlatform() === 'android') {
      StatusBar.setBackgroundColor({ color: '#635bff' }).catch(() => {});
    }
  }, []);

  return null;
}
