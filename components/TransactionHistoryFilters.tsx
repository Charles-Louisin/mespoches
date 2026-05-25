'use client'

import { Search, X } from 'lucide-react'
import { Category, Wallet } from '@/lib/api'
import { TransactionFiltersState } from '@/lib/filterTransactions'

interface TransactionHistoryFiltersProps {
  filters: TransactionFiltersState
  onChange: (next: TransactionFiltersState) => void
  wallets: Wallet[]
  categories: Category[]
  monthOptions: { value: string; label: string }[]
}

const selectClass =
  'w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-800'

export default function TransactionHistoryFilters({
  filters,
  onChange,
  wallets,
  categories,
  monthOptions,
}: TransactionHistoryFiltersProps) {
  const hasActive =
    filters.q ||
    filters.type ||
    filters.walletId ||
    filters.categoryId ||
    filters.monthYm

  const reset = () =>
    onChange({ q: '', type: '', walletId: '', categoryId: '', monthYm: '' })

  return (
    <div className="card p-3 space-y-2">
      <div className="relative">
        <Search size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          value={filters.q}
          onChange={(e) => onChange({ ...filters, q: e.target.value })}
          placeholder="Rechercher libellé, catégorie, poche, mois…"
          className="w-full pl-8 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30"
        />
        {filters.q && (
          <button
            type="button"
            onClick={() => onChange({ ...filters, q: '' })}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-gray-400"
            aria-label="Effacer"
          >
            <X size={14} />
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        <select
          className={selectClass}
          value={filters.type}
          onChange={(e) =>
            onChange({
              ...filters,
              type: e.target.value as TransactionFiltersState['type'],
            })
          }
          aria-label="Type"
        >
          <option value="">Type</option>
          <option value="income">Revenu</option>
          <option value="expense">Dépense</option>
          <option value="transfer">Transfert</option>
        </select>
        <select
          className={selectClass}
          value={filters.monthYm}
          onChange={(e) => onChange({ ...filters, monthYm: e.target.value })}
          aria-label="Mois"
        >
          <option value="">Mois</option>
          {monthOptions.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
        <select
          className={selectClass}
          value={filters.walletId}
          onChange={(e) => onChange({ ...filters, walletId: e.target.value })}
          aria-label="Poche"
        >
          <option value="">Poche</option>
          {wallets.map((w) => (
            <option key={w._id} value={w._id}>
              {w.name}
            </option>
          ))}
        </select>
        <select
          className={selectClass}
          value={filters.categoryId}
          onChange={(e) => onChange({ ...filters, categoryId: e.target.value })}
          aria-label="Catégorie"
        >
          <option value="">Catégorie</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {hasActive && (
        <button
          type="button"
          onClick={reset}
          className="w-full text-xs text-primary-600 font-medium py-1"
        >
          Réinitialiser les filtres
        </button>
      )}
    </div>
  )
}
