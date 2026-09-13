'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Wallet,
  Transaction,
  MonthStats,
  analyticsApi,
  walletApi,
  transactionApi,
  budgetApi,
  savingsGoalApi,
} from '@/lib/api'
import { sortTransactionsByDateDesc } from '@/lib/utils'
import { getUser, hydrateAuthSession, isAuthenticated } from '@/lib/auth'
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
import PendingTransactionsBanner from '@/components/PendingTransactionsBanner'
import TrialBanner from '@/components/TrialBanner'
import { Wallet as WalletIcon } from 'lucide-react'
import { useSubscription } from '@/hooks/useSubscription'
import BudgetsSection from '@/components/BudgetsSection'
import SavingsGoalsSection from '@/components/SavingsGoalsSection'
import AppLogo from '@/components/AppLogo'
import Reveal from '@/components/Reveal'

interface HomeData {
  wallets: Wallet[]
  totalBalance: number
  totalSavings: number
  budgetCount: number
  savingsGoalsCount: number
  recentTransactions: Transaction[]
  monthStats: MonthStats | null
}

function getClientAuth() {
  const loggedIn = isAuthenticated()
  const user = loggedIn ? getUser() : null
  return {
    loggedIn,
    name: user ? user.name || user.email.split('@')[0] : '',
  }
}

export default function HomePage() {
  const [auth, setAuth] = useState({ loggedIn: false, name: '' })
  const [authReady, setAuthReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      await hydrateAuthSession()
      if (cancelled) return
      setAuth(getClientAuth())
      setAuthReady(true)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const userName = auth.name
  const isLoggedIn = auth.loggedIn
  const { user, isPremium, isOnTrial, requirePremium, handleApiError } = useSubscription()

  const onApiError = (err: unknown, msg?: string) => {
    if (handleApiError(err)) return true
    return false
  }

  const fetchHome = useCallback(async (): Promise<HomeData> => {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1

    const [walletsData, balanceData, transactionsData, statsData, budgetsData, goalsData] =
      await Promise.all([
      walletApi.getAll().catch(() => []),
      walletApi.getTotalBalance().catch(() => ({ total: 0, totalSavings: 0, wallets: [] })),
      transactionApi.getAll({ limit: 40 }).catch(() => []),
      analyticsApi.getCurrentMonth().catch(() => null),
      isPremium ? budgetApi.getAll(year, month).catch(() => []) : Promise.resolve([]),
      isPremium ? savingsGoalApi.getAll().catch(() => []) : Promise.resolve([]),
    ])
    const sorted = sortTransactionsByDateDesc(transactionsData)
    return {
      wallets: walletsData,
      totalBalance: balanceData.total,
      totalSavings: balanceData.totalSavings ?? 0,
      budgetCount: budgetsData.length,
      savingsGoalsCount: goalsData.length,
      recentTransactions: sorted.slice(0, 5),
      monthStats: statsData,
    }
  }, [isPremium])

  const { data, loading, refresh } = useCachedData(
    CACHE_KEYS.home,
    fetchHome,
    isLoggedIn
  )

  const handleRefresh = useCallback(async () => {
    if (isLoggedIn) {
      await refresh()
    }
  }, [isLoggedIn, refresh])

  if (!authReady || (isLoggedIn && loading && !data)) {
    return (
      <PageShell>
        <HomeHeader userName={userName} isLoggedIn={isLoggedIn} />
        <LoadingSpinner />
      </PageShell>
    )
  }

  return (
    <PageShell enablePullToRefresh={isLoggedIn} onRefresh={handleRefresh}>
      <HomeHeader userName={userName} isLoggedIn={isLoggedIn} />

      <main className="max-w-md mx-auto px-4 py-4 space-y-6">
        {isLoggedIn && data ? (
          <>
            <BalanceCard
              totalBalance={data.totalBalance}
              totalSavings={isPremium && data.totalSavings > 0 ? data.totalSavings : undefined}
              monthExpense={data.monthStats?.totalExpense}
              monthIncome={data.monthStats?.totalIncome}
            />

            <PendingTransactionsBanner />

            {isOnTrial && <TrialBanner user={user} compact dismissible />}

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
                  {data.wallets.slice(0, 4).map((wallet, i) => (
                    <Reveal key={wallet._id} delay={i * 0.04}>
                      <WalletCard wallet={wallet} />
                    </Reveal>
                  ))}
                </div>
              )}
            </section>

            {isPremium && data.budgetCount > 0 && (
              <>
                <BudgetsSection
                  isPremium={isPremium}
                  onApiError={onApiError}
                  variant="home"
                />
              </>
            )}
            {isPremium && data.savingsGoalsCount > 0 && (
              <>
                <SavingsGoalsSection
                  isPremium={isPremium}
                  onApiError={onApiError}
                  variant="home"
                />
              </>
            )}

            <section>
              <div className="flex items-center justify-between mb-3">
                <h3 className="section-title">Transactions récentes</h3>
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
            <AppLogo size="lg" className="mx-auto" />
            <h2 className="font-display text-2xl text-ink">MES POCHES</h2>
            <p className="text-ink-soft text-sm">
              Connectez-vous pour suivre vos poches et vos dépenses du quotidien.
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
