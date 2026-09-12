'use client';

import { useEffect, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { getToken, hydrateAuthSession } from '@/lib/auth';
import {
  scheduleDailyExpenseReminder,
  syncSmsMonitorToken,
  requestAutomationPermissions,
} from '@/lib/capacitor/app-notifications';

/**
 * Sync token Android + rappel quotidien.
 * Pour SMS & notifications système : seule la notif « Transaction prête »
 * est affichée (MesPochesNotifier), sans « analyse en cours ».
 */
export default function AutomationBridge() {
  const permsRequested = useRef(false);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const setup = async () => {
      await hydrateAuthSession();
      const token = getToken();
      await syncSmsMonitorToken(token);
      await scheduleDailyExpenseReminder(20, 0);

      if (!permsRequested.current && token) {
        permsRequested.current = true;
        await requestAutomationPermissions();
      }
    };

    void setup();

    const onFocus = () => {
      void (async () => {
        await hydrateAuthSession();
        await syncSmsMonitorToken(getToken());
      })();
    };
    window.addEventListener('focus', onFocus);

    return () => {
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  return null;
}
