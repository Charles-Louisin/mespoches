'use client'

import { useCallback } from 'react'
import Link from 'next/link'
import { walletApi } from '@/lib/api'
import { CACHE_KEYS } from '@/lib/cache'
import { useCachedData } from '@/hooks/useCachedData'
import PageShell from '@/components/PageShell'
import Header from '@/components/Header'
import WalletCard from '@/components/WalletCard'
import LoadingSpinner from '@/components/LoadingSpinner'
import EmptyState from '@/components/EmptyState'
import Button from '@/components/Button'
import { Wallet as WalletIcon, Plus } from 'lucide-react'
import UpgradeBanner from '@/components/UpgradeBanner'
import { useSubscription } from '@/hooks/useSubscription'
import { PLAN_LIMITS } from '@/lib/planLimits'
import SavingsGoalsSection from '@/components/SavingsGoalsSection'

export default function WalletsPage() {
  const { isPremium, handleApiError } = useSubscription()
  const fetchWallets = useCallback(() => walletApi.getAll(), [])

  const { data: wallets, loading } = useCachedData(
    CACHE_KEYS.wallets,
    fetchWallets
  )

  if (loading && !wallets) {
    return (
      <PageShell>
        <Header title="Mes poches" />
        <LoadingSpinner />
      </PageShell>
    )
  }

  const list = wallets ?? []

  return (
    <PageShell>
      <Header
        title="Mes poches"
        action={
          <Link href="/wallets/new">
            <button type="button" className="p-2 touch-manipulation">
              <Plus size={24} className="text-primary-500" />
            </button>
          </Link>
        }
      />

      <main className="max-w-md mx-auto px-4 py-4 space-y-4">
        {!isPremium && list.length >= PLAN_LIMITS.FREE_MAX_WALLETS && (
          <UpgradeBanner
            compact
            message={`Limite de ${PLAN_LIMITS.FREE_MAX_WALLETS} poches atteinte — passez à Premium`}
          />
        )}
        {!isPremium && list.length < PLAN_LIMITS.FREE_MAX_WALLETS && (
          <p className="text-xs text-gray-400 text-center">
            {list.length}/{PLAN_LIMITS.FREE_MAX_WALLETS} poches (gratuit)
          </p>
        )}
        {list.length === 0 ? (
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
            {list.map((wallet) => (
              <WalletCard key={wallet._id} wallet={wallet} />
            ))}
          </div>
        )}

        <SavingsGoalsSection isPremium={isPremium} onApiError={handleApiError} />
      </main>
    </PageShell>
  )
}
