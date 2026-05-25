'use client'

import { useCallback, useState } from 'react'
import Link from 'next/link'
import { Wallet, Transaction, MonthStats, analyticsApi, walletApi, transactionApi } from '@/lib/api'
import { getUser, isAuthenticated } from '@/lib/auth'
import { CACHE_KEYS } from '@/lib/cache'
import { useCachedData } from '@/hooks/useCachedData'
import PageShell from '@/components/PageShell'
import HomeHeader from '@/components/HomeHeader'
import BalanceCard from '@/components/BalanceCard'
import WalletCard from '@/components/WalletCard'
import TransactionItem from '@/components/TransactionItem'
import LoadingSpinner from '@/components/LoadingSpinner'
import EmptyState from '@/components/EmptyState'
import Button from '@/components/Button'
import { Wallet as WalletIcon } from 'lucide-react'
import { useSubscription } from '@/hooks/useSubscription'

interface HomeData {
  wallets: Wallet[]
  totalBalance: number
  recentTransactions: Transaction[]
  monthStats: MonthStats | null
}

function getInitialAuth() {
  if (typeof window === 'undefined') return { loggedIn: false, name: '' }
  const loggedIn = isAuthenticated()
  const user = loggedIn ? getUser() : null
  return {
    loggedIn,
    name: user ? user.name || user.email.split('@')[0] : '',
  }
}

export default function HomePage() {
  const [auth] = useState(getInitialAuth)
  const [userName] = useState(auth.name)
  const isLoggedIn = auth.loggedIn
  const { isPremium, requirePremium } = useSubscription()

  const fetchHome = useCallback(async (): Promise<HomeData> => {
    const [walletsData, balanceData, transactionsData, statsData] = await Promise.all([
      walletApi.getAll().catch(() => []),
      walletApi.getTotalBalance().catch(() => ({ total: 0, wallets: [] })),
      transactionApi.getAll().catch(() => []),
      analyticsApi.getCurrentMonth().catch(() => null),
    ])
    const sorted = [...transactionsData].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    return {
      wallets: walletsData,
      totalBalance: balanceData.total,
      recentTransactions: sorted.slice(0, 5),
      monthStats: statsData,
    }
  }, [])

  const { data, loading } = useCachedData(
    CACHE_KEYS.home,
    fetchHome,
    isLoggedIn
  )

  if (isLoggedIn && loading && !data) {
    return (
      <PageShell>
        <HomeHeader userName={userName} isLoggedIn />
        <LoadingSpinner />
      </PageShell>
    )
  }

  return (
    <PageShell>
      <HomeHeader userName={userName} isLoggedIn={isLoggedIn} />

      <main className="max-w-md mx-auto px-4 py-4 space-y-6">
        {isLoggedIn && data ? (
          <>
            <BalanceCard
              totalBalance={data.totalBalance}
              monthExpense={data.monthStats?.totalExpense}
              monthIncome={data.monthStats?.totalIncome}
            />

            <section>
              <div className="flex items-center justify-between mb-3">
                <h3 className="section-title">Mes poches</h3>
                <Link href="/wallets" className="link-muted">
                  Voir tout
                </Link>
              </div>

              {data.wallets.length === 0 ? (
                <EmptyState
                  icon={<WalletIcon size={48} className="text-primary-300" />}
                  title="Aucune poche"
                  description="Créez votre première poche pour commencer"
                  action={
                    <Link href="/wallets/new">
                      <Button>Créer une poche</Button>
                    </Link>
                  }
                />
              ) : (
                <div className="space-y-2.5">
                  {data.wallets.slice(0, 4).map((wallet) => (
                    <WalletCard key={wallet._id} wallet={wallet} />
                  ))}
                </div>
              )}
            </section>

            <section>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-gray-900">Transactions récentes</h3>
                <Link href="/transactions" className="link-muted">
                  Voir tout
                </Link>
              </div>

              {data.recentTransactions.length === 0 ? (
                <div className="card p-8 text-center">
                  <p className="text-gray-500">Aucune transaction</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {data.recentTransactions.map((transaction) => (
                    <TransactionItem
                      key={transaction._id}
                      transaction={transaction}
                      isPremium={isPremium}
                      onRequirePremium={requirePremium}
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        ) : !isLoggedIn ? (
          <div className="card p-8 text-center space-y-4">
            <WalletIcon size={56} className="mx-auto text-primary-400" />
            <h2 className="text-xl font-bold text-gray-900">Bienvenue sur MES POCHES</h2>
            <p className="text-gray-500 text-sm">
              Connectez-vous pour gérer vos finances personnelles
            </p>
            <Link href="/login">
              <Button fullWidth>Se connecter</Button>
            </Link>
          </div>
        ) : null}
      </main>
    </PageShell>
  )
}
