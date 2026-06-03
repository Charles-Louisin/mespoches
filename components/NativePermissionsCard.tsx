'use client';

import { useCallback, useEffect, useState } from 'react';
import { Camera, Bell, CheckCircle2, XCircle, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';
import {
  getCameraPermission,
  getNotificationPermission,
  isNativeApp,
  requestCameraPermission,
  requestNotificationPermission,
  type PermissionState,
} from '@/lib/capacitor/native-permissions';

function StatusBadge({ state }: { state: PermissionState }) {
  if (state === 'granted') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
        <CheckCircle2 size={12} /> Autorisé
      </span>
    );
  }
  if (state === 'denied') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700 bg-red-50 px-2 py-0.5 rounded-full">
        <XCircle size={12} /> Refusé
      </span>
    );
  }
  if (state === 'prompt') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
        <HelpCircle size={12} /> À autoriser
      </span>
    );
  }
  return null;
}

export default function NativePermissionsCard() {
  const [camera, setCamera] = useState<PermissionState>('unsupported');
  const [notifications, setNotifications] = useState<PermissionState>('unsupported');
  const [loading, setLoading] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!isNativeApp()) return;
    setCamera(await getCameraPermission());
    setNotifications(await getNotificationPermission());
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  if (!isNativeApp()) return null;

  const askCamera = async () => {
    setLoading('camera');
    try {
      const state = await requestCameraPermission();
      setCamera(state);
      if (state === 'granted') toast.success('Accès à la caméra autorisé');
      else if (state === 'denied') toast.error('Caméra refusée — activez-la dans les paramètres du téléphone');
    } finally {
      setLoading(null);
    }
  };

  const askNotifications = async () => {
    setLoading('notifications');
    try {
      const state = await requestNotificationPermission();
      setNotifications(state);
      if (state === 'granted') toast.success('Notifications autorisées');
      else if (state === 'denied') toast.error('Notifications refusées — activez-les dans les paramètres du téléphone');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="card p-4 space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-500">Application mobile</h3>
        <p className="text-xs text-gray-500 mt-1">
          Autorisations utilisées pour les photos de poches/catégories et les rappels (si activés).
        </p>
      </div>

      <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
        <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center shrink-0">
          <Camera size={20} className="text-primary-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900">Caméra &amp; photos</p>
          <StatusBadge state={camera} />
        </div>
        {camera !== 'granted' && (
          <button
            type="button"
            onClick={askCamera}
            disabled={loading === 'camera'}
            className="text-sm font-semibold text-primary-600 px-3 py-1.5 rounded-lg hover:bg-primary-50 touch-manipulation disabled:opacity-50"
          >
            Autoriser
          </button>
        )}
      </div>

      <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
        <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center shrink-0">
          <Bell size={20} className="text-primary-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900">Notifications</p>
          <StatusBadge state={notifications} />
        </div>
        {notifications !== 'granted' && (
          <button
            type="button"
            onClick={askNotifications}
            disabled={loading === 'notifications'}
            className="text-sm font-semibold text-primary-600 px-3 py-1.5 rounded-lg hover:bg-primary-50 touch-manipulation disabled:opacity-50"
          >
            Autoriser
          </button>
        )}
      </div>
    </div>
  );
}
