'use client'

import { WifiOff, Wifi, RefreshCw } from 'lucide-react'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import { motion, AnimatePresence } from 'framer-motion'

export default function OfflineIndicator() {
  const { online, syncing, pendingSync, showIndicator } = useOnlineStatus()

  if (!showIndicator) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.2 }}
        className="fixed top-0 left-0 right-0 z-[200] pointer-events-none"
      >
        <div className="flex justify-center pt-[max(0.5rem,env(safe-area-inset-top))]">
          <div
            className={`px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-medium ${
              online
                ? 'bg-green-500 text-white'
                : 'bg-gray-800 text-white'
            }`}
          >
            {syncing ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                <span>Synchronisation...</span>
              </>
            ) : online ? (
              <>
                <Wifi size={16} />
                <span>Connexion rétablie</span>
              </>
            ) : (
              <>
                <WifiOff size={16} />
                <span>Mode hors ligne</span>
                {pendingSync > 0 && (
                  <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                    {pendingSync}
                  </span>
                )}
              </>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
