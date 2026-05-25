'use client'

import { useEffect, useState } from 'react'
import { analyticsApi, MonthStats, CategoryStat, MonthComparison } from '@/lib/api'
import { formatCurrency, operationsLabel } from '@/lib/utils'
import PageShell from '@/components/PageShell'
import Header from '@/components/Header'
import LoadingSpinner from '@/components/LoadingSpinner'
import ProFeature from '@/components/ProFeature'
import ProBadge from '@/components/ProBadge'
import { useSubscription } from '@/hooks/useSubscription'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

const MONTH_NAMES = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
]

function monthLabel(month: number, year: number) {
  return `${MONTH_NAMES[month - 1]} ${year}`
}

function formatDelta(amount: number) {
  const sign = amount > 0 ? '+' : amount < 0 ? '' : ''
  return `${sign}${formatCurrency(amount)}`
}

function formatPct(value: number | null) {
  if (value === null || Number.isNaN(value)) return '—'
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(0)} %`
}

export default function AnalyticsPage() {
  const { isPremium, loading: subLoading, handleApiError } = useSubscription()
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1

  const [monthStats, setMonthStats] = useState<MonthStats | null>(null)
  const [comparison, setComparison] = useState<MonthComparison | null>(null)
  const [expensesByCategory, setExpensesByCategory] = useState<CategoryStat[]>([])
  const [incomesByCategory, setIncomesByCategory] = useState<CategoryStat[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState(currentYear)
  const [selectedMonth, setSelectedMonth] = useState(currentMonth)

  useEffect(() => {
    if (subLoading) return
    if (isPremium) {
      loadPremiumAnalytics()
    } else {
      loadFreeAnalytics()
    }
  }, [selectedYear, selectedMonth, isPremium, subLoading])

  const loadFreeAnalytics = async () => {
    try {
      setLoading(true)
      const stats = await analyticsApi.getCurrentMonth()
      setMonthStats(stats)
      setComparison(null)
      setExpensesByCategory([])
      setIncomesByCategory([])
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadPremiumAnalytics = async () => {
    try {
      setLoading(true)
      const start = new Date(selectedYear, selectedMonth - 1, 1)
      const end = new Date(selectedYear, selectedMonth, 0, 23, 59, 59)

      const [stats, comp, expenses, incomes] = await Promise.all([
        analyticsApi.getMonth(selectedYear, selectedMonth),
        analyticsApi.getMonthComparison(selectedYear, selectedMonth),
        analyticsApi.getExpensesByCategory(start.toISOString(), end.toISOString()),
        analyticsApi.getIncomesByCategory(start.toISOString(), end.toISOString()),
      ])

      setMonthStats(stats)
      setComparison(comp)
      setExpensesByCategory(expenses)
      setIncomesByCategory(incomes)
    } catch (error) {
      handleApiError(error, 'Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  const getMonthOptions = () => {
    const options: { year: number; month: number; label: string }[] = []
    for (let i = 0; i < 18; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      options.push({
        year: d.getFullYear(),
        month: d.getMonth() + 1,
        label: monthLabel(d.getMonth() + 1, d.getFullYear()),
      })
    }
    return options
  }

  if (subLoading || loading) {
    return (
      <PageShell>
        <Header title="Analyse" />
        <LoadingSpinner />
      </PageShell>
    )
  }

  const periodSelector = (
    <div className="card p-4">
      <label className="block text-sm font-semibold text-gray-900 mb-2">
        Mois à analyser
      </label>
      <select
        className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-white"
        value={`${selectedYear}-${String(selectedMonth).padStart(2, '0')}`}
        onChange={(e) => {
          const [y, m] = e.target.value.split('-').map((x) => parseInt(x, 10))
          setSelectedYear(y)
          setSelectedMonth(m)
        }}
      >
        {getMonthOptions().map((opt) => (
          <option
            key={`${opt.year}-${opt.month}`}
            value={`${opt.year}-${String(opt.month).padStart(2, '0')}`}
          >
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )

  const monthSummary = monthStats && (
    <div className="card p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        {monthLabel(monthStats.month, monthStats.year)}
      </h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <TrendingUp size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Revenus</p>
              <p className="text-lg font-bold text-green-600">
                {formatCurrency(monthStats.totalIncome)}
              </p>
            </div>
          </div>
          <span className="text-sm text-gray-500">{operationsLabel(monthStats.incomeCount)}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <TrendingDown size={20} className="text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Dépenses</p>
              <p className="text-lg font-bold text-red-600">
                {formatCurrency(monthStats.totalExpense)}
              </p>
            </div>
          </div>
          <span className="text-sm text-gray-500">{operationsLabel(monthStats.expenseCount)}</span>
        </div>
        <div className="pt-4 border-t border-gray-200 flex justify-between">
          <p className="font-semibold text-gray-900">Solde du mois</p>
          <p
            className={`text-xl font-bold ${
              monthStats.balance >= 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {monthStats.balance >= 0 ? '+' : ''}
            {formatCurrency(monthStats.balance)}
          </p>
        </div>
      </div>
    </div>
  )

  const comparisonBlock = comparison && (
    <div className="card p-6 space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">
          Par rapport au mois précédent
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          On compare{' '}
          <strong>{monthLabel(comparison.selected.month, comparison.selected.year)}</strong>{' '}
          à{' '}
          <strong>{monthLabel(comparison.previous.month, comparison.previous.year)}</strong>.
          Les écarts indiquent combien ce mois diffère du mois d&apos;avant.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-primary-50 rounded-lg p-3 border border-primary-100">
          <p className="text-gray-500 mb-1">Mois analysé</p>
          <p className="font-bold text-gray-900">
            {monthLabel(comparison.selected.month, comparison.selected.year)}
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
          <p className="text-gray-500 mb-1">Mois de référence</p>
          <p className="font-bold text-gray-900">
            {monthLabel(comparison.previous.month, comparison.previous.year)}
          </p>
        </div>
      </div>

      <ComparisonRow
        label="Revenus"
        selectedValue={comparison.selected.totalIncome}
        previousValue={comparison.previous.totalIncome}
        delta={comparison.delta.totalIncome}
        percent={comparison.percent.totalIncome}
        higherIsGood
      />
      <ComparisonRow
        label="Dépenses"
        selectedValue={comparison.selected.totalExpense}
        previousValue={comparison.previous.totalExpense}
        delta={comparison.delta.totalExpense}
        percent={comparison.percent.totalExpense}
        higherIsGood={false}
      />
      <ComparisonRow
        label="Solde"
        selectedValue={comparison.selected.balance}
        previousValue={comparison.previous.balance}
        delta={comparison.delta.balance}
        percent={comparison.percent.balance}
        higherIsGood
      />
    </div>
  )

  const categoryBreakdown = (
    <div className="space-y-4">
      {expensesByCategory.length > 0 && (
        <CategoryBlock title="Dépenses par catégorie" stats={expensesByCategory} color="red" />
      )}
      {incomesByCategory.length > 0 && (
        <CategoryBlock title="Revenus par catégorie" stats={incomesByCategory} color="green" />
      )}
    </div>
  )

  return (
    <PageShell>
      <Header title="Analyse" />
      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* {!isPremium && (
          <p className="text-sm text-gray-500 text-center px-2">
            Résumé du mois en cours uniquement. Les analyses détaillées nécessitent{' '}
            <ProBadge className="align-middle" />.
          </p>
        )} */}

        <ProFeature
          isPremium={isPremium}
          title="Choisir un autre mois"
          description="Consulter n'importe quel mois des 18 derniers"
        >
          {periodSelector}
        </ProFeature>

        {monthSummary}

        <ProFeature
          isPremium={isPremium}
          title="Comparaison avec le mois précédent"
          description="Voir si vous dépensez plus ou moins qu'avant"
        >
          {comparisonBlock}
        </ProFeature>

        <ProFeature
          isPremium={isPremium}
          title="Répartition par catégorie"
          description="Où partent vos dépenses et vos revenus"
        >
          {categoryBreakdown}
        </ProFeature>
      </main>
    </PageShell>
  )
}

function ComparisonRow({
  label,
  selectedValue,
  previousValue,
  delta,
  percent,
  higherIsGood,
}: {
  label: string
  selectedValue: number
  previousValue: number
  delta: number
  percent: number | null
  higherIsGood: boolean
}) {
  const improved =
    delta === 0 ? null : higherIsGood ? delta > 0 : delta < 0
  const Icon = delta === 0 ? Minus : improved ? TrendingUp : TrendingDown
  const iconColor =
    delta === 0
      ? 'text-gray-400'
      : improved
        ? 'text-green-600'
        : 'text-red-600'

  let explanation = 'Identique au mois précédent'
  if (delta > 0) {
    explanation = higherIsGood
      ? `${formatCurrency(delta)} de plus qu'avant (en hausse)`
      : `${formatCurrency(delta)} de plus qu'avant (attention)`
  } else if (delta < 0) {
    explanation = higherIsGood
      ? `${formatCurrency(Math.abs(delta))} de moins qu'avant`
      : `${formatCurrency(Math.abs(delta))} de moins qu'avant (mieux)`
  }

  return (
    <div className="rounded-xl border border-gray-100 p-4 space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-medium text-gray-900">{label}</span>
        <Icon size={18} className={iconColor} />
      </div>
      <div className="flex justify-between text-sm text-gray-600">
        <span>Ce mois : {formatCurrency(selectedValue)}</span>
        <span>Mois préc. : {formatCurrency(previousValue)}</span>
      </div>
      <p className="text-sm font-semibold text-gray-900">
        Écart : {formatDelta(delta)} ({formatPct(percent)})
      </p>
      <p className="text-xs text-gray-500">{explanation}</p>
    </div>
  )
}

function CategoryBlock({
  title,
  stats,
  color,
}: {
  title: string
  stats: CategoryStat[]
  color: 'red' | 'green'
}) {
  const total = stats.reduce((sum, s) => sum + s.total, 0)
  const bar = color === 'red' ? 'bg-red-500' : 'bg-green-500'

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-3">
        {stats.map((stat, index) => {
          const percentage = total > 0 ? (stat.total / total) * 100 : 0
          return (
            <div key={index}>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">{stat.category}</span>
                <span className="text-sm font-bold">{formatCurrency(stat.total)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className={`${bar} h-2 rounded-full`} style={{ width: `${percentage}%` }} />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {percentage.toFixed(0)} % · {operationsLabel(stat.count)}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
