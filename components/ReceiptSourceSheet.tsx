'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Camera, Image as ImageIcon } from 'lucide-react'

interface ReceiptSourceSheetProps {
  open: boolean
  onSelectCamera: () => void
  onSelectGallery: () => void
  onCancel: () => void
}

export default function ReceiptSourceSheet({
  open,
  onSelectCamera,
  onSelectGallery,
  onCancel,
}: ReceiptSourceSheetProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm"
        >
          <button
            type="button"
            className="absolute inset-0"
            aria-label="Annuler"
            onClick={onCancel}
          />

          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            className="absolute bottom-[104px] left-0 right-0 w-full max-w-md mx-auto px-4"
          >
            <div className="rounded-[1.75rem] bg-white shadow-2xl border border-gray-100 px-4 pt-4 pb-5">
              <p className="text-center text-sm font-semibold text-gray-800 mb-4">
                Importer une image
              </p>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={onSelectCamera}
                  className="flex flex-col items-center gap-2 py-3 rounded-2xl bg-primary-50 text-primary-800 touch-manipulation active:scale-[0.98] transition"
                >
                  <span className="w-11 h-11 rounded-full bg-white shadow-sm flex items-center justify-center">
                    <Camera size={20} strokeWidth={2.25} />
                  </span>
                  <span className="text-xs font-semibold">Caméra</span>
                </button>

                <button
                  type="button"
                  onClick={onSelectGallery}
                  className="flex flex-col items-center gap-2 py-3 rounded-2xl bg-primary-50 text-primary-800 touch-manipulation active:scale-[0.98] transition"
                >
                  <span className="w-11 h-11 rounded-full bg-white shadow-sm flex items-center justify-center">
                    <ImageIcon size={20} strokeWidth={2.25} />
                  </span>
                  <span className="text-xs font-semibold">Galerie</span>
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
