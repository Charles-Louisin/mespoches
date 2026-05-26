'use client'

import { useState } from 'react'
import { Eye, EyeOff, PiggyBank, TrendingDown, TrendingUp } from 'lucide-react'
import { useCurrency } from '@/contexts/CurrencyContext'

interface BalanceCardProps {
  totalBalance: number
  totalSavings?: number
  monthExpense?: number
  monthIncome?: number
}

export default function BalanceCard({
  totalBalance,
  totalSavings,
  monthExpense,
  monthIncome,
}: BalanceCardProps) {
  const [hidden, setHidden] = useState(true)
  const { formatAmount } = useCurrency()

  return (
    <div className="balance-gradient rounded-3xl p-5 text-white shadow-lg shadow-primary-500/25">
      <p className="text-sm text-white/85 mb-1">Solde Total :</p>
      <div className="flex items-center justify-between gap-3 mb-5">
        <h2 className="text-3xl font-bold tracking-tight">
          {hidden ? '******' : formatAmount(totalBalance)}
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
                {hidden ? '******' : formatAmount(monthExpense ?? 0)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-1 justify-end">
            <div className="text-right">
              <p className="text-xs text-white/75">Revenu ce mois</p>
              <p className="font-semibold text-sm">
                {hidden ? '******' : formatAmount(monthIncome ?? 0)}
              </p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
              <TrendingUp size={16} className="text-green-300" />
            </div>
          </div>
        </div>
      )}
      {totalSavings !== undefined && (
        <div className="flex items-center gap-2 pt-2">
          <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
            <PiggyBank size={16} className="text-amber-200" />
          </div>
          <div>
            <p className="text-xs text-white/75">Épargne total</p>
            <p className="font-semibold text-sm">
              {hidden ? '******' : formatAmount(totalSavings)}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
