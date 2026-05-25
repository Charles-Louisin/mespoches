import { Transaction, Wallet, Category } from '@/lib/api'
import { getTransactionTypeLabel } from '@/lib/utils'

const MONTH_NAMES = [
  'janvier', 'février', 'fevrier', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'aout', 'septembre', 'octobre', 'novembre', 'décembre',
]

export interface TransactionFiltersState {
  q: string
  type: '' | 'income' | 'expense' | 'transfer'
  walletId: string
  categoryId: string
  monthYm: string
}

export function getWalletId(t: Transaction): string {
  if (typeof t.wallet_id === 'object' && t.wallet_id) return (t.wallet_id as Wallet)._id
  return String(t.wallet_id)
}

export function getCategoryId(t: Transaction): string {
  if (!t.category_id) return ''
  if (typeof t.category_id === 'object') return (t.category_id as Category)._id
  return String(t.category_id)
}

export function getWalletName(t: Transaction): string {
  if (typeof t.wallet_id === 'object' && t.wallet_id) return (t.wallet_id as Wallet).name
  return ''
}

export function getCategoryName(t: Transaction): string {
  if (t.category_id && typeof t.category_id === 'object')
    return (t.category_id as Category).name
  return ''
}

function transactionSearchBlob(t: Transaction): string {
  const d = new Date(t.date)
  const monthStr = `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()} ${d.getMonth() + 1} ${d.getFullYear()}`
  return [
    t.description,
    getCategoryName(t),
    getWalletName(t),
    getTransactionTypeLabel(t.type),
    t.type,
    monthStr,
    d.toLocaleDateString('fr-FR'),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

export function filterTransactions(
  transactions: Transaction[],
  filters: TransactionFiltersState
): Transaction[] {
  const q = filters.q.trim().toLowerCase()

  return transactions.filter((t) => {
    if (filters.type && t.type !== filters.type) return false
    if (filters.walletId && getWalletId(t) !== filters.walletId) return false
    if (filters.categoryId && getCategoryId(t) !== filters.categoryId) return false
    if (filters.monthYm) {
      const ym = new Date(t.date).toISOString().slice(0, 7)
      if (ym !== filters.monthYm) return false
    }
    if (q && !transactionSearchBlob(t).includes(q)) return false
    return true
  })
}

export function buildMonthOptions(transactions: Transaction[]): { value: string; label: string }[] {
  const set = new Set<string>()
  for (const t of transactions) {
    set.add(new Date(t.date).toISOString().slice(0, 7))
  }
  return Array.from(set)
    .sort((a, b) => (a < b ? 1 : -1))
    .map((ym) => {
      const [y, m] = ym.split('-').map(Number)
      const label = new Date(y, m - 1, 1).toLocaleDateString('fr-FR', {
        month: 'short',
        year: 'numeric',
      })
      return { value: ym, label }
    })
}
