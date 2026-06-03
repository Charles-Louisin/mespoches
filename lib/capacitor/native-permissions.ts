import { Capacitor } from '@capacitor/core';
import { Camera } from '@capacitor/camera';
import { LocalNotifications } from '@capacitor/local-notifications';

export type NativePermissionKind = 'camera' | 'notifications';

export type PermissionState = 'granted' | 'denied' | 'prompt' | 'unsupported';

export function isNativeApp(): boolean {
  return Capacitor.isNativePlatform();
}

export async function getCameraPermission(): Promise<PermissionState> {
  if (!isNativeApp()) return 'unsupported';
  try {
    const status = await Camera.checkPermissions();
    return mapState(status.camera);
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

export async function requestCameraPermission(): Promise<PermissionState> {
  if (!isNativeApp()) return 'unsupported';
  const status = await Camera.requestPermissions({ permissions: ['camera', 'photos'] });
  return mapState(status.camera);
}

export async function requestNotificationPermission(): Promise<PermissionState> {
  if (!isNativeApp()) return 'unsupported';
  const status = await LocalNotifications.requestPermissions();
  return mapState(status.display);
}

function mapState(value: string | undefined): PermissionState {
  if (value === 'granted') return 'granted';
  if (value === 'denied') return 'denied';
  if (value === 'prompt' || value === 'prompt-with-rationale') return 'prompt';
  return 'denied';
}
