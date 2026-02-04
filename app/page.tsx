'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Wallet, Transaction, MonthStats, analyticsApi } from '@/lib/api'
import { offlineWalletApi, offlineTransactionApi } from '@/lib/offlineApi'
import { formatCurrency, groupTransactionsByDate } from '@/lib/utils'
import BottomNav from '@/components/BottomNav'
import Header from '@/components/Header'
import WalletCard from '@/components/WalletCard'
import TransactionItem from '@/components/TransactionItem'
import LoadingSpinner from '@/components/LoadingSpinner'
import EmptyState from '@/components/EmptyState'
import Button from '@/components/Button'
import Link from 'next/link'
import { Plus, Wallet as WalletIcon, TrendingUp, TrendingDown } from 'lucide-react'

export default function HomePage() {
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])
  const [monthStats, setMonthStats] = useState<MonthStats | null>(null)
  const [totalBalance, setTotalBalance] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [walletsData, balanceData, transactionsData, statsData] = await Promise.all([
        offlineWalletApi.getAll().catch((err) => {
          console.error('Erreur wallets:', err)
          return []
        }),
        offlineWalletApi.getTotalBalance().catch((err) => {
          console.error('Erreur balance:', err)
          return { total: 0, wallets: [] }
        }),
        offlineTransactionApi.getAll().catch((err) => {
          console.error('Erreur transactions:', err)
          return []
        }),
        analyticsApi.getCurrentMonth().catch((err) => {
          console.error('Erreur analytics:', err)
          return null
        })
      ])

      setWallets(walletsData)
      setTotalBalance(balanceData.total)
      setRecentTransactions(transactionsData.slice(0, 5))
      setMonthStats(statsData)
    } catch (error) {
      console.error('Erreur lors du chargement:', error)
      toast.error('Erreur lors du chargement des données')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="MES POCHES" />
        <LoadingSpinner />
        <BottomNav />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title="MES POCHES" showLogout />

      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Solde Total */}
        <div className="bg-primary-500 rounded-2xl p-6 text-white">
          <p className="text-sm opacity-90 mb-1">Solde total</p>
          <h2 className="text-4xl font-bold mb-4">
            {formatCurrency(totalBalance)}
          </h2>
          
          {monthStats && (
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <TrendingUp size={18} />
                <div>
                  <p className="text-xs opacity-75">Ce mois</p>
                  <p className="font-semibold">{formatCurrency(monthStats.totalIncome)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <TrendingDown size={18} />
                <div>
                  <p className="text-xs opacity-75">Ce mois</p>
                  <p className="font-semibold">{formatCurrency(monthStats.totalExpense)}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions Rapides */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/transactions/new?type=income">
            <Button variant="primary" fullWidth className="h-12">
              <div className="flex items-center justify-center gap-2">
                <Plus size={20} />
                <span>Revenu</span>
              </div>
            </Button>
          </Link>
          <Link href="/transactions/new?type=expense">
            <Button variant="outline" fullWidth className="h-12">
              <div className="flex items-center justify-center gap-2">
                <Plus size={20} />
                <span>Dépense</span>
              </div>
            </Button>
          </Link>
        </div>

        {/* Portefeuilles */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900">Mes portefeuilles</h3>
            <Link href="/wallets" className="text-sm text-primary-500 font-medium">
              Voir tout
            </Link>
          </div>

          {wallets.length === 0 ? (
            <EmptyState
              icon={<WalletIcon size={48} />}
              title="Aucun portefeuille"
              description="Créez votre premier portefeuille pour commencer"
              action={
                <Link href="/wallets/new">
                  <Button>Créer un portefeuille</Button>
                </Link>
              }
            />
          ) : (
            <div className="space-y-3">
              {wallets.slice(0, 3).map((wallet) => (
                <WalletCard key={wallet._id} wallet={wallet} />
              ))}
            </div>
          )}
        </section>

        {/* Transactions Récentes */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900">Transactions récentes</h3>
            <Link href="/transactions" className="text-sm text-primary-500 font-medium">
              Voir tout
            </Link>
          </div>

          {recentTransactions.length === 0 ? (
            <div className="bg-white rounded-lg p-8 border border-gray-200 text-center">
              <p className="text-gray-500">Aucune transaction</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTransactions.map((transaction) => (
                <TransactionItem key={transaction._id} transaction={transaction} />
              ))}
            </div>
          )}
        </section>
      </main>

      <BottomNav />
    </div>
  )
}
