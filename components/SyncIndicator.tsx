'use client';

import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { Cloud, CloudOff, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SyncIndicator() {
  const { online, syncing, pendingSync, showIndicator } = useOnlineStatus();

  return (
    <AnimatePresence>
      {showIndicator && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed bottom-20 right-4 z-50"
        >
          <div
            className={`
              flex items-center gap-2 px-4 py-3 rounded-full shadow-lg
              transition-all duration-300
              ${online 
                ? 'bg-emerald-500 text-white' 
                : 'bg-orange-500 text-white'
              }
              ${syncing ? 'bg-sky-500 text-white' : ''}
            `}
          >
            {syncing ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : online ? (
              <Cloud className="w-5 h-5" />
            ) : (
              <CloudOff className="w-5 h-5" />
            )}
            
            <span className="text-sm font-semibold">
              {syncing ? 'Synchronisation...' : online ? 'De retour en ligne' : 'Mode hors ligne'}
            </span>

            {pendingSync > 0 && !syncing && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="bg-white bg-opacity-30 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center"
              >
                {pendingSync}
              </motion.span>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
