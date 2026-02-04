'use client'

import { useEffect, useState } from 'react'
import { analyticsApi, MonthStats, CategoryStat } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import BottomNav from '@/components/BottomNav'
import Header from '@/components/Header'
import LoadingSpinner from '@/components/LoadingSpinner'
import { TrendingUp, TrendingDown } from 'lucide-react'

export default function AnalyticsPage() {
  const [monthStats, setMonthStats] = useState<MonthStats | null>(null)
  const [expensesByCategory, setExpensesByCategory] = useState<CategoryStat[]>([])
  const [incomesByCategory, setIncomesByCategory] = useState<CategoryStat[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      const [stats, expenses, incomes] = await Promise.all([
        analyticsApi.getCurrentMonth(),
        analyticsApi.getExpensesByCategory(),
        analyticsApi.getIncomesByCategory()
      ])

      setMonthStats(stats)
      setExpensesByCategory(expenses)
      setIncomesByCategory(incomes)
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Analyses" />
        <LoadingSpinner />
        <BottomNav />
      </div>
    )
  }

  const getMonthName = (month: number) => {
    const months = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ]
    return months[month - 1]
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title="Analyses" />

      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Résumé du mois */}
        {monthStats && (
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {getMonthName(monthStats.month)} {monthStats.year}
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
                <span className="text-sm text-gray-500">
                  {monthStats.incomeCount} {monthStats.incomeCount > 1 ? 'transactions' : 'transaction'}
                </span>
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
                <span className="text-sm text-gray-500">
                  {monthStats.expenseCount} {monthStats.expenseCount > 1 ? 'transactions' : 'transaction'}
                </span>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-gray-900">Solde du mois</p>
                  <p className={`text-xl font-bold ${monthStats.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {monthStats.balance >= 0 ? '+' : ''}{formatCurrency(monthStats.balance)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dépenses par catégorie */}
        {expensesByCategory.length > 0 && (
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Dépenses par catégorie
            </h3>
            <div className="space-y-3">
              {expensesByCategory.map((stat, index) => {
                const total = expensesByCategory.reduce((sum, s) => sum + s.total, 0)
                const percentage = (stat.total / total) * 100

                return (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">
                        {stat.category}
                      </span>
                      <span className="text-sm font-bold text-gray-900">
                        {formatCurrency(stat.total)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-red-500 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {stat.count} {stat.count > 1 ? 'transactions' : 'transaction'} ({percentage.toFixed(1)}%)
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Revenus par catégorie */}
        {incomesByCategory.length > 0 && (
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Revenus par catégorie
            </h3>
            <div className="space-y-3">
              {incomesByCategory.map((stat, index) => {
                const total = incomesByCategory.reduce((sum, s) => sum + s.total, 0)
                const percentage = (stat.total / total) * 100

                return (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">
                        {stat.category}
                      </span>
                      <span className="text-sm font-bold text-gray-900">
                        {formatCurrency(stat.total)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {stat.count} {stat.count > 1 ? 'transactions' : 'transaction'} ({percentage.toFixed(1)}%)
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  )
}
