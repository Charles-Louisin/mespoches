import { Capacitor, registerPlugin } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

const DAILY_REMINDER_ID = 9001;
const PENDING_CHECK_ID = 9002;

export interface SmsMonitorPlugin {
  storeAuthToken(options: { token: string; apiUrl?: string }): Promise<void>;
}

export const SmsMonitor = registerPlugin<SmsMonitorPlugin>('SmsMonitor');

export async function syncSmsMonitorToken(token: string | undefined): Promise<void> {
  if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android' || !token) return;
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    await SmsMonitor.storeAuthToken({ token, apiUrl });
  } catch {
    /* plugin absent en dev web */
  }
}

export async function scheduleDailyExpenseReminder(hour = 20, minute = 0): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  const perm = await LocalNotifications.checkPermissions();
  if (perm.display !== 'granted') return;

  await LocalNotifications.cancel({ notifications: [{ id: DAILY_REMINDER_ID }] });

  const now = new Date();
  const first = new Date();
  first.setHours(hour, minute, 0, 0);
  if (first <= now) first.setDate(first.getDate() + 1);

  await LocalNotifications.schedule({
    notifications: [
      {
        id: DAILY_REMINDER_ID,
        title: 'MES POCHES',
        body: 'N\'oubliez pas d\'enregistrer vos dépenses du jour 💰',
        schedule: {
          at: first,
          repeats: true,
          every: 'day',
        },
        smallIcon: 'ic_launcher',
      },
    ],
  });
}

export async function notifyPendingTransactions(count: number): Promise<void> {
  if (!Capacitor.isNativePlatform() || count <= 0) return;

  const perm = await LocalNotifications.checkPermissions();
  if (perm.display !== 'granted') return;

  await LocalNotifications.schedule({
    notifications: [
      {
        id: PENDING_CHECK_ID,
        title: 'Transactions à valider',
        body:
          count === 1
            ? '1 transaction détectée — ouvrez MES POCHES pour la valider'
            : `${count} transactions détectées — ouvrez MES POCHES pour les valider`,
        schedule: { at: new Date(Date.now() + 500) },
        smallIcon: 'ic_launcher',
      },
    ],
  });
}
