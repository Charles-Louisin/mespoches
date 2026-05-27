'use client'

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
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-[60]"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-white rounded-2xl shadow-2xl max-w-sm w-full pointer-events-auto overflow-hidden"
            >
              {/* Header */}
              <div className="relative p-6 pb-4">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 transition touch-manipulation"
                >
                  <X size={24} />
                </button>

                {/* Icon */}
                <div className={`w-14 h-14 rounded-full ${colorScheme.bg} flex items-center justify-center mb-4`}>
                  <AlertTriangle size={28} className={colorScheme.icon} />
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-2 pr-8">
                  {title}
                </h3>

                {/* Message */}
                <p className="text-gray-600 leading-relaxed">
                  {message}
                </p>
              </div>

              {/* Actions */}
              <div className="p-6 pt-2 flex flex-col gap-3">
                <button
                  onClick={handleConfirm}
                  className={`w-full ${colorScheme.button} text-white rounded-lg px-6 py-3 font-semibold transition touch-manipulation`}
                >
                  {confirmText}
                </button>
                <button
                  onClick={onClose}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg px-6 py-3 font-semibold transition touch-manipulation"
                >
                  {cancelText}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
