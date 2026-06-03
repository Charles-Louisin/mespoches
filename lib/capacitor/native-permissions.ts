import { Capacitor } from '@capacitor/core';
import { Camera } from '@capacitor/camera';
import { LocalNotifications } from '@capacitor/local-notifications';

export type PermissionState = 'granted' | 'denied' | 'prompt' | 'unsupported';

export function isNativeApp(): boolean {
  return Capacitor.isNativePlatform();
}

export async function getCameraPermission(): Promise<PermissionState> {
  if (!isNativeApp()) return 'unsupported';
  try {
    const status = await Camera.checkPermissions();
    const camera = mapState(status.camera);
    const photos = mapState(status.photos);
    if (camera === 'granted' && photos === 'granted') return 'granted';
    if (camera === 'denied' || photos === 'denied') return 'denied';
    return 'prompt';
  } catch {
    return 'unsupported';
  }
}

export async function getNotificationPermission(): Promise<PermissionState> {
  if (!isNativeApp()) return 'unsupported';
  try {
    const status = await LocalNotifications.checkPermissions();
    return mapState(status.display);
  } catch {
    return 'unsupported';
  }
}

/** Dialogues système caméra + galerie (photos). */
export async function requestCameraAndGalleryPermission(): Promise<void> {
  if (!isNativeApp()) return;
  const current = await Camera.checkPermissions();
  if (current.camera === 'granted' && current.photos === 'granted') return;
  await Camera.requestPermissions({ permissions: ['camera', 'photos'] });
}

/** Dialogue système notifications (préparation rappels futurs). */
export async function requestNotificationPermission(): Promise<void> {
  if (!isNativeApp()) return;
  const current = await LocalNotifications.checkPermissions();
  if (current.display === 'granted') return;
  await LocalNotifications.requestPermissions();
}

/**
 * Appelé à l’ouverture de l’app : enchaîne les demandes natives
 * si l’accès n’est pas déjà accordé (comportement classique mobile).
 */
export async function requestNativePermissionsOnLaunch(): Promise<void> {
  if (!isNativeApp()) return;
  await requestCameraAndGalleryPermission();
  await requestNotificationPermission();
}

/** Rétrocompatibilité (ex. upload image si refus au premier lancement). */
export async function requestCameraPermission(): Promise<PermissionState> {
  if (!isNativeApp()) return 'unsupported';
  await requestCameraAndGalleryPermission();
  return getCameraPermission();
}

function mapState(value: string | undefined): PermissionState {
  if (value === 'granted') return 'granted';
  if (value === 'denied') return 'denied';
  if (value === 'prompt' || value === 'prompt-with-rationale') return 'prompt';
  return 'denied';
}
