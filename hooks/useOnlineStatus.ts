import { useState, useEffect, useRef } from 'react';
import { syncData, isOnline, markLastSync, getSyncStatus } from '@/lib/sync';

export const useOnlineStatus = () => {
  const [online, setOnline] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [pendingSync, setPendingSync] = useState(0);
  const [showIndicator, setShowIndicator] = useState(false);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showIndicatorTemporarily = (duration: number = 4000) => {
    setShowIndicator(true);
    
    // Annuler le timeout précédent s'il existe
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    
    // Masquer après le délai
    hideTimeoutRef.current = setTimeout(() => {
      setShowIndicator(false);
    }, duration);
  };

  useEffect(() => {
    // Initialiser le statut
    setOnline(isOnline());

    // Charger le statut de synchronisation
    loadSyncStatus();

    // Écouter les changements de connexion
    const handleOnline = async () => {
      setOnline(true);
      showIndicatorTemporarily(6000); // Afficher pendant 6 secondes
      
      // Synchroniser automatiquement après un court délai
      setTimeout(async () => {
        await handleSync();
      }, 500);
    };

    const handleOffline = () => {
      setOnline(false);
      showIndicatorTemporarily(5000); // Afficher pendant 5 secondes
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Synchroniser périodiquement si en ligne (silencieusement)
    const syncInterval = setInterval(async () => {
      if (isOnline()) {
        await handleSync(true); // Synchronisation silencieuse
      }
    }, 60000); // Toutes les minutes

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(syncInterval);
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  const loadSyncStatus = async () => {
    const status = await getSyncStatus();
    setPendingSync(status.pending);
  };

  const handleSync = async (silent = false) => {
    if (!isOnline()) {
      return;
    }

    setSyncing(true);
    
    if (!silent) {
      showIndicatorTemporarily(8000); // Afficher pendant la sync + résultat
    }

    try {
      const result = await syncData();
      
      if (result.success) {
        markLastSync();
        await loadSyncStatus();
        
        // Ne rien faire si silent et pas de changements
        if (silent && result.synced === 0) {
          setSyncing(false);
          return;
        }
      }
    } catch (error) {
      console.error('Erreur de synchronisation:', error);
    } finally {
      setSyncing(false);
    }
  };

  return {
    online,
    syncing,
    pendingSync,
    showIndicator,
    handleSync,
    loadSyncStatus
  };
};
