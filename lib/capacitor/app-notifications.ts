import { Capacitor, registerPlugin } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { getNativeApiUrl } from '@/lib/api-config';

const DAILY_REMINDER_ID = 9001;
const PENDING_READY_ID = 9002;
const PENDING_PROCESSING_ID = 9003;
const DAILY_REMINDER_STORAGE_KEY = 'mes_poches_daily_reminder_v2';

/** Une seule programmation du rappel par session JS. */
let dailyReminderScheduledThisSession = false;
let dailyReminderListenerAttached = false;

export interface SmsMonitorPlugin {
  storeAuthToken(options: { token: string; apiUrl?: string }): Promise<void>;
  clearAuthToken(): Promise<void>;
  requestSmsPermission(): Promise<void>;
  openNotificationAccessSettings(): Promise<void>;
}

export const SmsMonitor = registerPlugin<SmsMonitorPlugin>('SmsMonitor');

export async function syncSmsMonitorToken(token: string | undefined): Promise<void> {
  if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android') return;
  try {
    if (!token) {
      await SmsMonitor.clearAuthToken();
      return;
    }
    await SmsMonitor.storeAuthToken({ token, apiUrl: getNativeApiUrl() });
  } catch {
    /* plugin absent en dev web */
  }
}

/** Demande SMS + accès aux notifications système (une seule fois). */
export async function requestAutomationPermissions(): Promise<void> {
  if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android') return;
  if (typeof localStorage !== 'undefined' && localStorage.getItem('automation_perms_asked') === '1') {
    return;
  }
  try {
    await SmsMonitor.requestSmsPermission();
  } catch {
    /* refus utilisateur */
  }
  try {
    await SmsMonitor.openNotificationAccessSettings();
  } catch {
    /* non bloquant */
  }
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('automation_perms_asked', '1');
  }
}

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

/** Marque le jour du 1er déclenchement (évite de traiter un re-fire Android la même minute). */
async function attachDailyReminderGuard(): Promise<void> {
  if (dailyReminderListenerAttached) return;
  dailyReminderListenerAttached = true;
  try {
    await LocalNotifications.addListener('localNotificationReceived', (notification) => {
      if (notification.id !== DAILY_REMINDER_ID) return;
      if (typeof localStorage === 'undefined') return;
      localStorage.setItem(DAILY_REMINDER_STORAGE_KEY, todayKey());
    });
  } catch {
    /* non bloquant */
  }
}

/**
 * Rappel unique chaque jour à 20h00.
 * Utilise uniquement `on` (pas `at` + `every`) — combinaison qui provoquait des multi-fires Android.
 */
export async function scheduleDailyExpenseReminder(hour = 20, minute = 0): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  if (dailyReminderScheduledThisSession) return;

  const perm = await LocalNotifications.checkPermissions();
  if (perm.display !== 'granted') return;

  await attachDailyReminderGuard();

  // Annule toute instance existante (anciennes configs at/every inclus)
  try {
    const pending = await LocalNotifications.getPending();
    const toCancel = pending.notifications
      .filter((n) => n.id === DAILY_REMINDER_ID)
      .map((n) => ({ id: n.id }));
    if (toCancel.length > 0) {
      await LocalNotifications.cancel({ notifications: toCancel });
    } else {
      await LocalNotifications.cancel({ notifications: [{ id: DAILY_REMINDER_ID }] });
    }
  } catch {
    await LocalNotifications.cancel({ notifications: [{ id: DAILY_REMINDER_ID }] });
  }

  await LocalNotifications.schedule({
    notifications: [
      {
        id: DAILY_REMINDER_ID,
        title: 'MES POCHES',
        body: 'N\'oubliez pas d\'enregistrer vos dépenses du jour 💰',
        schedule: {
          allowWhileIdle: true,
          on: {
            hour,
            minute,
            second: 0,
          },
        },
        smallIcon: 'ic_stat_mes_poches',
        largeIcon: 'ic_notification_logo',
      },
    ],
  });

  dailyReminderScheduledThisSession = true;
}

/** Réservé au scan reçu (pas de canal natif Android). */
export async function notifyTransactionProcessing(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  const perm = await LocalNotifications.checkPermissions();
  if (perm.display !== 'granted') return;

  await LocalNotifications.cancel({ notifications: [{ id: PENDING_PROCESSING_ID }] });

  await LocalNotifications.schedule({
    notifications: [
      {
        id: PENDING_PROCESSING_ID,
        title: 'MES POCHES',
        body: 'Analyse de la transaction en cours…',
        schedule: { at: new Date(Date.now() + 200) },
        smallIcon: 'ic_stat_mes_poches',
        largeIcon: 'ic_notification_logo',
      },
    ],
  });
}

/** Réservé au scan reçu (SMS/notif = MesPochesNotifier natif uniquement). */
export async function notifyTransactionReady(message: string): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  const perm = await LocalNotifications.checkPermissions();
  if (perm.display !== 'granted') return;

  await LocalNotifications.cancel({
    notifications: [{ id: PENDING_PROCESSING_ID }, { id: PENDING_READY_ID }],
  });

  await LocalNotifications.schedule({
    notifications: [
      {
        id: PENDING_READY_ID,
        title: 'Transaction prête',
        body: message,
        schedule: { at: new Date(Date.now() + 300) },
        smallIcon: 'ic_stat_mes_poches',
        largeIcon: 'ic_notification_logo',
      },
    ],
  });
}
