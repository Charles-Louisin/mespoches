'use client';

import { useEffect, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { getToken } from '@/lib/auth';
import { pendingTransactionApi } from '@/lib/api';
import {
  notifyPendingTransactions,
  scheduleDailyExpenseReminder,
  syncSmsMonitorToken,
} from '@/lib/capacitor/app-notifications';

/** Notifications locales + sync token SMS (Android). */
export default function AutomationBridge() {
  const lastCount = useRef<number | null>(null);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const token = getToken();
    void syncSmsMonitorToken(token);
    void scheduleDailyExpenseReminder(20, 0);

    const poll = async () => {
      if (!getToken()) return;
      try {
        const { count } = await pendingTransactionApi.getCount();
        if (lastCount.current !== null && count > lastCount.current) {
          await notifyPendingTransactions(count);
        } else if (lastCount.current === null && count > 0) {
          await notifyPendingTransactions(count);
        }
        lastCount.current = count;
      } catch {
        /* hors ligne */
      }
    };

    void poll();
    const interval = setInterval(poll, 60_000);
    return () => clearInterval(interval);
  }, []);

  return null;
}
