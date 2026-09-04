'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import type { TransactionLineItem } from '@/lib/api'
import { useCurrency } from '@/contexts/CurrencyContext'

interface LineItemsCollapseProps {
  items: TransactionLineItem[]
  defaultOpen?: boolean
  /** Permet de modifier uniquement la description de chaque article. */
  editable?: boolean
  onDescriptionChange?: (index: number, description: string) => void
}

function formatAmountPart(item: TransactionLineItem, formatAmount: (n: number) => string) {
  const qty = item.quantity && item.quantity > 1 ? item.quantity : null
  const unit = item.unit_amount ?? (qty ? item.amount / qty : null)
  if (qty && unit != null) {
    return `${formatAmount(unit)} ×${qty} — ${formatAmount(item.amount)}`
  }
  return formatAmount(item.amount)
}

export default function LineItemsCollapse({
  items,
  defaultOpen = false,
  editable = false,
  onDescriptionChange,
}: LineItemsCollapseProps) {
  const { formatAmount } = useCurrency()
  const [open, setOpen] = useState(defaultOpen || editable)

  if (!items.length) return null

  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50/80 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 px-3 py-2.5 text-left text-sm font-medium text-gray-700 touch-manipulation"
        aria-expanded={open}
      >
        {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        <span>
          {items.length} article{items.length > 1 ? 's' : ''}
          {editable ? ' · modifier les libellés' : ''}
        </span>
      </button>
      {open && (
        <ul className="px-3 pb-3 space-y-2 border-t border-gray-100 pt-2">
          {items.map((item, idx) => (
            <li
              key={`${idx}-${item.amount}`}
              className="text-sm text-gray-600 flex gap-2 items-start"
            >
              <span className="text-gray-400 select-none mt-2">•</span>
              {editable && onDescriptionChange ? (
                <div className="min-w-0 flex-1 space-y-1">
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => onDescriptionChange(idx, e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg bg-white text-sm text-gray-900"
                    aria-label={`Libellé article ${idx + 1}`}
                  />
                  <p className="text-xs text-gray-500">{formatAmountPart(item, formatAmount)}</p>
                </div>
              ) : (
                <span className="min-w-0 flex-1">
                  {item.description} — {formatAmountPart(item, formatAmount)}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
