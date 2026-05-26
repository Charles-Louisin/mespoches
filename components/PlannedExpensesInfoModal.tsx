'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CalendarClock, Info } from 'lucide-react'
import Button from '@/components/Button'
import { authApi } from '@/lib/api'
import { getUser, setUser } from '@/lib/auth'

interface PlannedExpensesInfoModalProps {
  isOpen: boolean
  onClose: () => void
  onDismissHelp?: () => void
}

export default function PlannedExpensesInfoModal({
  isOpen,
  onClose,
  onDismissHelp,
}: PlannedExpensesInfoModalProps) {
  const [dontShowAgain, setDontShowAgain] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleClose = async () => {
    if (dontShowAgain) {
      try {
        setSaving(true)
        const updated = await authApi.updateMe({ hidePlannedExpensesHelp: true })
        const current = getUser()
        if (current) {
          setUser({ ...current, hidePlannedExpensesHelp: updated.hidePlannedExpensesHelp })
        }
        onDismissHelp?.()
      } catch {
        // Fermeture même si l'API échoue
      } finally {
        setSaving(false)
      }
    }
    setDontShowAgain(false)
    onClose()
  }

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-[60]"
            onClick={() => void handleClose()}
          />
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="pointer-events-auto w-full max-w-md card p-5 shadow-xl max-h-[85vh] overflow-y-auto"
              role="dialog"
              aria-labelledby="planned-expenses-info-title"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-full bg-primary-50 text-primary-600">
                    <CalendarClock size={22} />
                  </div>
                  <h2
                    id="planned-expenses-info-title"
                    className="text-lg font-bold text-gray-900"
                  >
                    Prévoir une dépense
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => void handleClose()}
                  className="p-1 text-gray-400 touch-manipulation"
                  aria-label="Fermer"
                >
                  <X size={22} />
                </button>
              </div>

              <ul className="space-y-3 text-sm text-gray-700">
                <li className="flex gap-2">
                  <Info size={16} className="text-primary-500 shrink-0 mt-0.5" />
                  <span>
                    Choisissez une <strong>date future</strong> lors de l&apos;enregistrement
                    d&apos;une dépense : elle sera planifiée sans débiter votre poche tout de suite.
                  </span>
                </li>
                <li className="flex gap-2">
                  <Info size={16} className="text-primary-500 shrink-0 mt-0.5" />
                  <span>
                    Le <strong>jour prévu (UTC)</strong>, le montant est débité automatiquement si
                    le solde est suffisant.
                  </span>
                </li>
                <li className="flex gap-2">
                  <Info size={16} className="text-primary-500 shrink-0 mt-0.5" />
                  <span>
                    Sinon, la dépense est <strong>annulée automatiquement</strong> (solde
                    insuffisant).
                  </span>
                </li>
                <li className="flex gap-2">
                  <Info size={16} className="text-primary-500 shrink-0 mt-0.5" />
                  <span>
                    Vous pouvez <strong>modifier ou annuler</strong> une dépense prévue à tout
                    moment <strong>avant</strong> son jour J. Un rappel par email est envoyé la
                    veille.
                  </span>
                </li>
              </ul>

              <label className="mt-4 flex items-center gap-2 cursor-pointer touch-manipulation text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={dontShowAgain}
                  onChange={(e) => setDontShowAgain(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                />
                Ne plus afficher
              </label>

              <Button
                type="button"
                fullWidth
                className="mt-4"
                disabled={saving}
                onClick={() => void handleClose()}
              >
                {saving ? 'Enregistrement...' : 'Compris'}
              </Button>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}
