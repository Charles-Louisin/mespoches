'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, FileSpreadsheet, FileText, Sheet, Download } from 'lucide-react'
import { ExportFormat } from '@/lib/api'
import ProBadge from '@/components/ProBadge'

const OPTIONS: {
  format: ExportFormat
  label: string
  description: string
  icon: typeof FileSpreadsheet
  iconClass: string
}[] = [
  {
    format: 'csv',
    label: 'CSV',
    description: 'Compatible Excel, tableur',
    icon: FileSpreadsheet,
    iconClass: 'text-emerald-600',
  },
  {
    format: 'pdf',
    label: 'PDF',
    description: 'Liste imprimable',
    icon: FileText,
    iconClass: 'text-primary-600',
  },
  {
    format: 'xlsx',
    label: 'Excel',
    description: 'Fichier .xlsx natif',
    icon: Sheet,
    iconClass: 'text-green-700',
  },
]

interface ExportAllModalProps {
  isOpen: boolean
  onClose: () => void
  onExport: (format: ExportFormat) => void
  exporting: ExportFormat | null
  showProBadge?: boolean
}

export default function ExportAllModal({
  isOpen,
  onClose,
  onExport,
  exporting,
  showProBadge = false,
}: ExportAllModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="bg-white rounded-2xl shadow-2xl max-w-sm w-full pointer-events-auto overflow-hidden"
            >
              <div className="relative p-6 pb-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 touch-manipulation"
                  aria-label="Fermer"
                >
                  <X size={24} />
                </button>
                <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
                  <Download size={28} className="text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1 pr-8 flex items-center gap-2 flex-wrap">
                  Exporter tout
                  {showProBadge && <ProBadge />}
                </h3>
                <p className="text-sm text-gray-500">
                  Choisissez le format pour toutes vos transactions.
                </p>
              </div>

              <div className="px-6 pb-6 space-y-2">
                {OPTIONS.map(({ format, label, description, icon: Icon, iconClass }) => (
                  <button
                    key={format}
                    type="button"
                    onClick={() => onExport(format)}
                    disabled={!!exporting}
                    className="w-full flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-primary-300 hover:bg-primary-50/40 transition touch-manipulation disabled:opacity-50 text-left"
                  >
                    <div className="w-11 h-11 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                      <Icon size={22} className={iconClass} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900">{label}</p>
                      <p className="text-xs text-gray-500">{description}</p>
                    </div>
                    <span className="text-sm font-medium text-primary-600 shrink-0">
                      {exporting === format ? '…' : '→'}
                    </span>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={onClose}
                  disabled={!!exporting}
                  className="w-full mt-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl px-6 py-3 font-semibold transition touch-manipulation disabled:opacity-50"
                >
                  Annuler
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
