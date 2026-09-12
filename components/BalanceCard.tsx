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
    <div className="balance-gradient relative overflow-hidden rounded-[1.35rem] p-5 text-white shadow-soft">
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/[0.06]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-16 -left-8 h-40 w-40 rounded-full bg-black/10"
        aria-hidden
      />

      <div className="relative">
        <p className="text-sm text-white/80 mb-1">Solde total</p>
        <div className="flex items-center justify-between gap-3 mb-5">
          <h2 className="font-display text-[1.85rem] leading-none tracking-tight">
            {hidden ? '••••••' : formatAmount(totalBalance)}
          </h2>
          <button
            type="button"
            onClick={() => setHidden(!hidden)}
            className="rounded-xl p-2 text-white/85 hover:bg-white/10 hover:text-white touch-manipulation"
            aria-label={hidden ? 'Afficher le solde' : 'Masquer le solde'}
          >
            {hidden ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        {(monthExpense !== undefined || monthIncome !== undefined) && (
          <div className="flex justify-between gap-4 pt-4 border-t border-white/15">
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                <TrendingDown size={15} className="text-rose-200" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-white/70">Dépenses du mois</p>
                <p className="font-semibold text-sm truncate">
                  {hidden ? '••••' : formatAmount(monthExpense ?? 0)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 flex-1 min-w-0 justify-end">
              <div className="min-w-0 text-right">
                <p className="text-[11px] text-white/70">Revenus du mois</p>
                <p className="font-semibold text-sm truncate">
                  {hidden ? '••••' : formatAmount(monthIncome ?? 0)}
                </p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                <TrendingUp size={15} className="text-emerald-200" />
              </div>
            </div>
          </div>
        )}

        {totalSavings !== undefined && (
          <div className="flex items-center gap-2.5 pt-3 mt-1">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <PiggyBank size={15} className="text-amber-100" />
            </div>
            <div>
              <p className="text-[11px] text-white/70">Épargne</p>
              <p className="font-semibold text-sm">
                {hidden ? '••••' : formatAmount(totalSavings)}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
