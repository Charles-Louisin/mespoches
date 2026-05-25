'use client'

import { useState } from 'react'
import { Eye, EyeOff, TrendingDown, TrendingUp } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface BalanceCardProps {
  totalBalance: number
  currency?: string
  monthExpense?: number
  monthIncome?: number
}

export default function BalanceCard({
  totalBalance,
  currency = 'XAF',
  monthExpense,
  monthIncome,
}: BalanceCardProps) {
  const [hidden, setHidden] = useState(true)

  return (
    <div className="balance-gradient rounded-3xl p-5 text-white shadow-lg shadow-primary-500/25">
      <p className="text-sm text-white/85 mb-1">Solde Total :</p>
      <div className="flex items-center justify-between gap-3 mb-5">
        <h2 className="text-3xl font-bold tracking-tight">
          {hidden ? '••••••' : formatCurrency(totalBalance, currency)}
        </h2>
        <button
          type="button"
          onClick={() => setHidden(!hidden)}
          className="p-1.5 text-white/90 hover:text-white touch-manipulation"
          aria-label={hidden ? 'Afficher le solde' : 'Masquer le solde'}
        >
          {hidden ? <EyeOff size={22} /> : <Eye size={22} />}
        </button>
      </div>
      {(monthExpense !== undefined || monthIncome !== undefined) && (
        <div className="flex justify-between gap-4 pt-4 border-t border-white/20">
          <div className="flex items-center gap-2 flex-1">
            <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
              <TrendingDown size={16} className="text-red-300" />
            </div>
            <div>
              <p className="text-xs text-white/75">Dépense ce mois</p>
              <p className="font-semibold text-sm">
                {hidden ? '••••' : formatCurrency(monthExpense ?? 0, currency)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-1 justify-end">
            <div className="text-right">
              <p className="text-xs text-white/75">Revenu ce mois</p>
              <p className="font-semibold text-sm">
                {hidden ? '••••' : formatCurrency(monthIncome ?? 0, currency)}
              </p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
              <TrendingUp size={16} className="text-green-300" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
