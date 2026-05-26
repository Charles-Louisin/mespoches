'use client'

import { PlannedExpense, Wallet, Category } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import { useCurrency } from '@/contexts/CurrencyContext'
import EntityAvatar from '@/components/EntityAvatar'
import { Pencil, X } from 'lucide-react'

interface PlannedExpenseItemProps {
  item: PlannedExpense
  onEdit?: (item: PlannedExpense) => void
  onCancel?: (id: string) => void
  cancelling?: boolean
}

export default function PlannedExpenseItem({
  item,
  onEdit,
  onCancel,
  cancelling = false,
}: PlannedExpenseItemProps) {
  const { formatAmount } = useCurrency()

  const wallet =
    typeof item.wallet_id === 'object' ? (item.wallet_id as Wallet) : null
  const category =
    item.category_id && typeof item.category_id === 'object'
      ? (item.category_id as Category)
      : null

  const label = category?.name ?? item.description ?? 'Dépense prévue'

  return (
    <div className="card p-4 flex items-center gap-3 border border-dashed border-primary-200 bg-primary-50/40">
      <EntityAvatar
        name={label}
        imageUrl={category?.image_url}
        type="category"
        size="sm"
      />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 truncate">{label}</p>
        <p className="text-xs text-primary-700 font-medium">
          Prévu le {formatDate(item.scheduled_date)}
        </p>
        {wallet && (
          <p className="text-xs text-gray-500 truncate">{wallet.name}</p>
        )}
      </div>
      <div className="text-right shrink-0 flex flex-col items-end gap-1">
        <p className="font-bold text-red-500">-{formatAmount(item.amount)}</p>
        <div className="flex items-center gap-2">
          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(item)}
              className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-0.5 touch-manipulation"
            >
              <Pencil size={14} />
              Modifier
            </button>
          )}
          {onCancel && (
            <button
              type="button"
              onClick={() => onCancel(item._id)}
              disabled={cancelling}
              className="text-xs text-gray-500 hover:text-red-600 flex items-center gap-0.5 touch-manipulation disabled:opacity-50"
            >
              <X size={14} />
              Annuler
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
