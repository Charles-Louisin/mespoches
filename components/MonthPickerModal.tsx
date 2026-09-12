'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Check, X } from 'lucide-react'

interface MonthOption {
  year: number
  month: number
  label: string
}

interface MonthPickerModalProps {
  open: boolean
  onClose: () => void
  options: MonthOption[]
  selectedYear: number
  selectedMonth: number
  onSelect: (year: number, month: number) => void
}

export default function MonthPickerModal({
  open,
  onClose,
  options,
  selectedYear,
  selectedMonth,
  onSelect,
}: MonthPickerModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="Fermer"
            className="fixed inset-0 z-[60] bg-black/45"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              className="bg-white rounded-2xl shadow-xl border border-black/[0.04] w-full max-w-sm max-h-[70vh] flex flex-col pointer-events-auto overflow-hidden"
            >
              <div className="flex items-center justify-between px-5 pt-5 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
                    <Calendar size={18} />
                  </div>
                  <h3 className="font-semibold text-ink">Mois à analyser</h3>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 touch-manipulation"
                  aria-label="Fermer"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="overflow-y-auto px-2 pb-4">
                {options.map((opt) => {
                  const selected =
                    opt.year === selectedYear && opt.month === selectedMonth
                  return (
                    <button
                      key={`${opt.year}-${opt.month}`}
                      type="button"
                      onClick={() => {
                        onSelect(opt.year, opt.month)
                        onClose()
                      }}
                      className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-left touch-manipulation transition-colors ${
                        selected
                          ? 'bg-primary-50 text-primary-800'
                          : 'hover:bg-gray-50 text-ink'
                      }`}
                    >
                      <span className="font-medium text-sm">{opt.label}</span>
                      {selected && <Check size={18} className="text-primary-600" />}
                    </button>
                  )
                })}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
