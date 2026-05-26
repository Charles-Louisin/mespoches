'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  Transaction,
  PlannedExpense,
  transactionApi,
  plannedExpenseApi,
  walletApi,
  categoryApi,
  Wallet,
  Category,
} from '@/lib/api'
import { CACHE_KEYS, invalidateFinancialCaches } from '@/lib/cache'
import { toast } from 'sonner'
import { useCachedData } from '@/hooks/useCachedData'
import { formatDate, sortTransactionsByDateDesc } from '@/lib/utils'
import {
  filterTransactions,
  buildMonthOptions,
  TransactionFiltersState,
} from '@/lib/filterTransactions'
import PageShell from '@/components/PageShell'
import Header from '@/components/Header'
import TransactionItem from '@/components/TransactionItem'
import TransactionHistoryFilters from '@/components/TransactionHistoryFilters'
import LoadingSpinner from '@/components/LoadingSpinner'
import EmptyState from '@/components/EmptyState'
import Button from '@/components/Button'
import { History, Plus, ChevronDown, ChevronUp, Info } from 'lucide-react'
import PlannedExpenseItem from '@/components/PlannedExpenseItem'
import PlannedExpensesInfoModal from '@/components/PlannedExpensesInfoModal'
import EditPlannedExpenseModal from '@/components/EditPlannedExpenseModal'
import { getUser } from '@/lib/auth'
import UpgradeBanner from '@/components/UpgradeBanner'
import { useSubscription } from '@/hooks/useSubscription'
import { PLAN_LIMITS } from '@/lib/planLimits'

const defaultFilters: TransactionFiltersState = {
  q: '',
  type: '',
  walletId: '',
  categoryId: '',
  monthYm: '',
}

export default function TransactionsPage() {
  const { isPremium, handleApiError, requirePremium } = useSubscription()
  const [openDays, setOpenDays] = useState<Set<string>>(new Set())
  const [openDaysInitialized, setOpenDaysInitialized] = useState(false)
  const [filters, setFilters] = useState<TransactionFiltersState>(defaultFilters)
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [plannedExpenses, setPlannedExpenses] = useState<PlannedExpense[]>([])
  const [plannedLoading, setPlannedLoading] = useState(true)
  const [plannedInfoOpen, setPlannedInfoOpen] = useState(false)
  const [hidePlannedHelp, setHidePlannedHelp] = useState(
    () => !!getUser()?.hidePlannedExpensesHelp
  )
  const [editingPlanned, setEditingPlanned] = useState<PlannedExpense | null>(null)
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  const fetchTransactions = useCallback(async () => {
    const data = await transactionApi.getAll()
    return sortTransactionsByDateDesc(data)
  }, [])

  const { data: transactions, loading } = useCachedData(
    CACHE_KEYS.transactions,
    fetchTransactions
  )

  useEffect(() => {
    Promise.all([walletApi.getAll(), categoryApi.getAll()])
      .then(([w, c]) => {
        setWallets(w)
        setCategories(c)
      })
      .catch(() => {})
  }, [])

  const loadPlanned = useCallback(async () => {
    try {
      setPlannedLoading(true)
      const items = await plannedExpenseApi.getAll({ status: 'scheduled' })
      setPlannedExpenses(items)
    } catch {
      setPlannedExpenses([])
    } finally {
      setPlannedLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPlanned()
  }, [loadPlanned])

  const handleCancelPlanned = async (id: string) => {
    try {
      setCancellingId(id)
      await plannedExpenseApi.cancel(id)
      invalidateFinancialCaches()
      await loadPlanned()
      toast.success('Dépense prévue annulée')
    } catch (e) {
      handleApiError(e, "Erreur lors de l'annulation")
    } finally {
      setCancellingId(null)
    }
  }

  const filtered = useMemo(() => {
    if (!transactions) return []
    return filterTransactions(transactions, filters)
  }, [transactions, filters])

  const monthOptions = useMemo(
    () => buildMonthOptions(transactions ?? []),
    [transactions]
  )

  useEffect(() => {
    if (filtered.length && !openDaysInitialized) {
      const mostRecentDay = new Date(filtered[0].date).toISOString().slice(0, 10)
      setOpenDays(new Set([mostRecentDay]))
      setOpenDaysInitialized(true)
    }
  }, [filtered, openDaysInitialized])

  useEffect(() => {
    setOpenDaysInitialized(false)
  }, [filters.q, filters.type, filters.walletId, filters.categoryId, filters.monthYm])

  const grouped = useMemo(() => {
    const map = new Map<string, Transaction[]>()
    for (const t of filtered) {
      const dayKey = new Date(t.date).toISOString().slice(0, 10)
      const arr = map.get(dayKey) || []
      arr.push(t)
      map.set(dayKey, arr)
    }
    const keys = Array.from(map.keys()).sort((a, b) => (a < b ? 1 : -1))
    return keys.map((dayKey) => {
      const items = sortTransactionsByDateDesc(map.get(dayKey) || [])
      return {
        dayKey,
        label: formatDate(dayKey),
        items,
      }
    })
  }, [filtered])

  const toggleDay = (dayKey: string) => {
    setOpenDays((prev) => {
      const next = new Set(prev)
      if (next.has(dayKey)) next.delete(dayKey)
      else next.add(dayKey)
      return next
    })
  }

  if (loading && !transactions) {
    return (
      <PageShell>
        <Header title="Historique" />
        <LoadingSpinner />
      </PageShell>
    )
  }

  const hasData = transactions && transactions.length > 0
  const noMatch = hasData && filtered.length === 0

  return (
    <PageShell>
      <Header
        title="Historique"
        action={
          <Link href="/transactions/new">
            <button type="button" className="p-2 touch-manipulation">
              <Plus size={24} className="text-primary-500" />
            </button>
          </Link>
        }
      />

      <main className="max-w-md mx-auto px-4 py-4 space-y-3">
        {!isPremium && (
          <UpgradeBanner
            compact
            message={`Historique limité aux ${PLAN_LIMITS.FREE_HISTORY_MONTHS} derniers mois en gratuit`}
          />
        )}

        {hasData && (
          <TransactionHistoryFilters
            filters={filters}
            onChange={setFilters}
            wallets={wallets}
            categories={categories}
            monthOptions={monthOptions}
          />
        )}

        {(plannedExpenses.length > 0 || !hidePlannedHelp) && (
          <div className="flex items-center justify-between px-1">
            <h3 className="section-title">Dépenses prévues</h3>
            {!hidePlannedHelp && (
              <button
                type="button"
                onClick={() => setPlannedInfoOpen(true)}
                className="p-2 text-primary-600 touch-manipulation"
                aria-label="Comment prévoir une dépense"
              >
                <Info size={20} />
              </button>
            )}
          </div>
        )}

        {!plannedLoading && plannedExpenses.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-primary-700 px-1">
              Transactions futures
            </h4>
            {plannedExpenses.map((item) => (
              <PlannedExpenseItem
                key={item._id}
                item={item}
                onEdit={setEditingPlanned}
                onCancel={handleCancelPlanned}
                cancelling={cancellingId === item._id}
              />
            ))}
          </div>
        )}

        {!hasData ? (
          <EmptyState
            icon={<History size={48} className="text-primary-300" />}
            title="Aucune transaction"
            description="Commencez par ajouter votre première transaction"
            action={
              <Link href="/transactions/new">
                <Button>Ajouter une transaction</Button>
              </Link>
            }
          />
        ) : noMatch ? (
          <div className="card p-6 text-center text-sm text-gray-500">
            Aucun résultat pour ces filtres.
          </div>
        ) : (
          <div className="space-y-3">
            {grouped.map((g) => {
              const isOpen = openDays.has(g.dayKey)
              return (
                <div key={g.dayKey} className="card overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleDay(g.dayKey)}
                    className="w-full flex items-center justify-between px-4 py-3.5 touch-manipulation"
                  >
                    <div className="flex items-center gap-2">
                      {isOpen ? (
                        <ChevronUp size={20} className="text-primary-500" />
                      ) : (
                        <ChevronDown size={20} className="text-gray-400" />
                      )}
                      <span className="text-sm font-bold text-gray-900">{g.label}</span>
                    </div>
                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                      {g.items.length}
                    </span>
                  </button>

                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="space-y-2.5 px-3 pb-3">
                      {g.items.map((transaction) => (
                        <TransactionItem
                          key={transaction._id}
                          transaction={transaction}
                          isPremium={isPremium}
                          onRequirePremium={requirePremium}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      <PlannedExpensesInfoModal
        isOpen={plannedInfoOpen}
        onClose={() => setPlannedInfoOpen(false)}
        onDismissHelp={() => setHidePlannedHelp(true)}
      />

      <EditPlannedExpenseModal
        item={editingPlanned}
        isOpen={!!editingPlanned}
        onClose={() => setEditingPlanned(null)}
        onSaved={() => {
          invalidateFinancialCaches()
          loadPlanned()
        }}
      />
    </PageShell>
  )
}
