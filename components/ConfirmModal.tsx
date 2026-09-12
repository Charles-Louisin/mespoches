'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X } from 'lucide-react'
import Button from './Button'

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  variant = 'danger'
}: ConfirmModalProps) {
  const [confirming, setConfirming] = useState(false)

  useEffect(() => {
    if (!isOpen) setConfirming(false)
  }, [isOpen])

  const colors = {
    danger: {
      bg: 'bg-red-100',
      text: 'text-red-600',
      icon: 'text-red-500',
      button: 'bg-red-500 hover:bg-red-600'
    },
    warning: {
      bg: 'bg-orange-100',
      text: 'text-orange-600',
      icon: 'text-orange-500',
      button: 'bg-orange-500 hover:bg-orange-600'
    },
    info: {
      bg: 'bg-blue-100',
      text: 'text-blue-600',
      icon: 'text-blue-500',
      button: 'bg-blue-500 hover:bg-blue-600'
    }
  }

  const colorScheme = colors[variant]

  const handleConfirm = () => {
    if (confirming) return
    setConfirming(true)
    onConfirm()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={confirming ? undefined : onClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-[60]"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-white rounded-2xl shadow-card border border-black/[0.04] max-w-sm w-full pointer-events-auto overflow-hidden"
            >
              {/* Header */}
              <div className="relative p-6 pb-4">
                <button
                  onClick={onClose}
                  disabled={confirming}
                  className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 transition touch-manipulation disabled:opacity-50"
                >
                  <X size={24} />
                </button>

                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl ${colorScheme.bg} flex items-center justify-center mb-4`}>
                  <AlertTriangle size={24} className={colorScheme.icon} />
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-ink mb-2 pr-8">
                  {title}
                </h3>

                {/* Message */}
                <p className="text-ink-soft leading-relaxed text-[15px]">
                  {message}
                </p>
              </div>

              {/* Actions */}
              <div className="p-6 pt-2 flex flex-col gap-3">
                <Button
                  type="button"
                  fullWidth
                  loading={confirming}
                  onClick={handleConfirm}
                  className={`${colorScheme.button} !shadow-none`}
                >
                  {confirmText}
                </Button>
                <Button
                  type="button"
                  fullWidth
                  variant="secondary"
                  onClick={onClose}
                  disabled={confirming}
                  className="!bg-gray-100 hover:!bg-gray-200 !text-gray-700"
                >
                  {cancelText}
                </Button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
