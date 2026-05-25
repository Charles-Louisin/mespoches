'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { FileSpreadsheet, FileText, Sheet } from 'lucide-react'
import ProBadge from '@/components/ProBadge'
import { exportApi, ExportFormat } from '@/lib/api'
import { downloadBlob } from '@/lib/download'
import { isPremiumRequiredError } from '@/lib/subscription'

const FORMATS: {
  id: ExportFormat
  label: string
  icon: typeof FileSpreadsheet
}[] = [
  { id: 'csv', label: 'CSV', icon: FileSpreadsheet },
  { id: 'pdf', label: 'PDF', icon: FileText },
  { id: 'xlsx', label: 'Excel', icon: Sheet },
]

interface TransactionExportButtonsProps {
  transactionId: string
  isPremium: boolean
  onRequirePremium?: (message?: string) => void
  /** Pleine largeur sur la page détail */
  layout?: 'row' | 'grid'
}

export default function TransactionExportButtons({
  transactionId,
  isPremium,
  onRequirePremium,
  layout = 'row',
}: TransactionExportButtonsProps) {
  const [loading, setLoading] = useState<ExportFormat | null>(null)

  const handleExport = async (
    e: React.MouseEvent | undefined,
    format: ExportFormat
  ) => {
    e?.preventDefault()
    e?.stopPropagation()
    if (!isPremium) {
      onRequirePremium?.(`Export ${format.toUpperCase()} — Premium requis`)
      return
    }
    try {
      setLoading(format)
      const blob = await exportApi.downloadTransaction(transactionId, format)
      const ext = format === 'xlsx' ? 'xlsx' : format
      downloadBlob(blob, `transaction-${transactionId.slice(-8)}.${ext}`)
      toast.success(
        format === 'pdf' ? 'PDF téléchargé' : format === 'xlsx' ? 'Excel téléchargé' : 'CSV téléchargé'
      )
    } catch (err) {
      if (isPremiumRequiredError(err)) onRequirePremium?.(err.message)
      else toast.error(err instanceof Error ? err.message : 'Erreur export')
    } finally {
      setLoading(null)
    }
  }

  const gridClass =
    layout === 'grid'
      ? 'grid grid-cols-3 gap-2'
      : 'flex justify-end gap-2'

  return (
    <div className="space-y-1">
      {!isPremium && (
        <div className="flex justify-end">
          <ProBadge />
        </div>
      )}
      <div className={gridClass}>
        {FORMATS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={(e) => handleExport(e, id)}
            disabled={!!loading}
            className={`flex flex-col items-center gap-0.5 rounded-lg border border-gray-100 bg-gray-50/80 hover:bg-gray-100 touch-manipulation disabled:opacity-50 ${
              layout === 'grid' ? 'py-3 px-2' : 'py-1.5 px-2.5 min-w-[52px]'
            }`}
          >
            <Icon
              size={layout === 'grid' ? 20 : 18}
              className={
                id === 'csv'
                  ? 'text-emerald-600'
                  : id === 'pdf'
                    ? 'text-primary-600'
                    : 'text-green-700'
              }
            />
            <span className="text-[10px] font-semibold text-gray-600 leading-none">
              {loading === id ? '…' : label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
