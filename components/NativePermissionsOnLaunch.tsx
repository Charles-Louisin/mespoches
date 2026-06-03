'use client';

import { useEffect, useRef } from 'react';
import { requestNativePermissionsOnLaunch } from '@/lib/capacitor/native-permissions';

/**
 * À l’ouverture de l’app native : demande les autorisations système
 * (caméra, galerie, notifications) via les dialogues Android/iOS.
 */
export default function NativePermissionsOnLaunch() {
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void requestNativePermissionsOnLaunch();
  }, []);

  return null;
}
