'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, AlertCircle, Sparkles } from 'lucide-react'
import Button from '@/components/Button'

type ScanPhase = 'idle' | 'scanning' | 'success' | 'error'

interface ReceiptScanOverlayProps {
  open: boolean
  phase: ScanPhase
  imagePreview: string | null
  message: string
  createdCount: number
  onClose: () => void
  onCancel: () => void
  onRetry: () => void
}

export default function ReceiptScanOverlay({
  open,
  phase,
  imagePreview,
  message,
  createdCount,
  onClose,
  onCancel,
  onRetry,
}: ReceiptScanOverlayProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-sm rounded-2xl bg-white shadow-2xl overflow-hidden"
          >
            <div className="relative aspect-[4/5] max-h-[55vh] bg-gray-900 overflow-hidden">
              {imagePreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imagePreview}
                  alt="Reçu en cours d'analyse"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
                  Préparation…
                </div>
              )}

              {phase === 'scanning' && (
                <>
                  <motion.div
                    className="absolute inset-0 opacity-60 mix-blend-screen"
                    style={{
                      background:
                        'linear-gradient(120deg, #4285f4, #9b72cb, #d96570, #f4c430, #4285f4)',
                      backgroundSize: '300% 300%',
                    }}
                    animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }}
                  />
                  <motion.div
                    className="absolute inset-x-0 h-1/3 bg-gradient-to-b from-white/30 via-white/10 to-transparent"
                    animate={{ top: ['-35%', '100%'] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                  />
                </>
              )}

              {phase === 'success' && (
                <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
                  <CheckCircle2 size={64} className="text-emerald-500 drop-shadow-lg" />
                </div>
              )}

              {phase === 'error' && (
                <div className="absolute inset-0 bg-red-500/15 flex items-center justify-center">
                  <AlertCircle size={64} className="text-red-500 drop-shadow-lg" />
                </div>
              )}
            </div>

            <div className="p-5 space-y-3 text-center">
              <div className="flex items-center justify-center gap-2 text-primary-700 font-semibold">
                {phase === 'scanning' && (
                  <>
                    <Sparkles size={18} className="animate-pulse" />
                    <span>Analyse IA</span>
                  </>
                )}
                {phase === 'success' && <span>Succès</span>}
                {phase === 'error' && <span>Échec</span>}
              </div>

              <p className="text-sm text-gray-600">{message}</p>

              {phase === 'scanning' && (
                <>
                  <p className="text-xs text-gray-400">Extraction des montants et libellés…</p>
                  <Button variant="outline" fullWidth onClick={onCancel}>
                    Annuler l’analyse
                  </Button>
                </>
              )}

              {phase === 'success' && (
                <p className="text-xs text-emerald-600 font-medium">
                  Redirection vers les transactions à valider…
                </p>
              )}

              {phase === 'error' && (
                <div className="flex gap-2 pt-1">
                  <Button variant="outline" fullWidth onClick={onClose}>
                    Fermer
                  </Button>
                  <Button fullWidth onClick={onRetry} disabled={!imagePreview}>
                    Réessayer
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
