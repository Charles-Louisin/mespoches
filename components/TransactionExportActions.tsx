'use client'

import ProBadge from '@/components/ProBadge'
import TransactionExportButtons from '@/components/TransactionExportButtons'
import { useSubscription } from '@/hooks/useSubscription'

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
  const { showProBadge } = useSubscription()

  return (
    <section className="card p-5 space-y-3">
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-bold text-gray-900">Exporter</h2>
        {showProBadge && <ProBadge />}
      </div>
      <TransactionExportButtons
        transactionId={transactionId}
        isPremium={isPremium}
        onRequirePremium={onRequirePremium}
        layout="grid"
      />
    </section>
  )
}
