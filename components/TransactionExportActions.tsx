'use client'

import ProBadge from '@/components/ProBadge'
import TransactionExportButtons from '@/components/TransactionExportButtons'

interface TransactionExportActionsProps {
  transactionId: string
  isPremium: boolean
  onRequirePremium: (message?: string) => void
}

export default function TransactionExportActions({
  transactionId,
  isPremium,
  onRequirePremium,
}: TransactionExportActionsProps) {
  return (
    <section className="card p-5 space-y-3">
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-bold text-gray-900">Exporter cette transaction</h2>
        {!isPremium && <ProBadge />}
      </div>
      <p className="text-xs text-gray-500">
        CSV, PDF ou fichier Excel (.xlsx).
      </p>
      <TransactionExportButtons
        transactionId={transactionId}
        isPremium={isPremium}
        onRequirePremium={onRequirePremium}
        layout="grid"
      />
    </section>
  )
}
