'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Wallet, Transaction, walletApi } from '@/lib/api'
import { CACHE_KEYS, invalidateFinancialCaches, setCache } from '@/lib/cache'
import { useCachedData } from '@/hooks/useCachedData'
import { groupTransactionsByDate } from '@/lib/utils'
import { useConfirm } from '@/hooks/useConfirm'
import PageShell from '@/components/PageShell'
import Header from '@/components/Header'
import WalletHeroCard from '@/components/WalletHeroCard'
import TransactionItem from '@/components/TransactionItem'
import LoadingSpinner from '@/components/LoadingSpinner'
import ConfirmModal from '@/components/ConfirmModal'
import { useSubscription } from '@/hooks/useSubscription'
import { isPremiumRequiredError } from '@/lib/subscription'

export default function WalletDetailPage() {
  const { isPremium, requirePremium } = useSubscription()
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const { confirm, confirmState, closeConfirm } = useConfirm()

  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    currency: '',
    image_url: null as string | null,
  })

  const fetchHistory = useCallback(
    () => walletApi.getHistory(id),
    [id]
  )

  const { data, loading, setData } = useCachedData(
    CACHE_KEYS.wallet(id),
    fetchHistory,
    !!id
  )

  const wallet = data?.wallet ?? null
  const transactions = data?.transactions ?? []

  const syncForm = useCallback((w: Wallet) => {
    setFormData({
      name: w.name,
      currency: w.currency,
      image_url: w.image_url ?? null,
    })
  }, [])

  useEffect(() => {
    if (wallet) syncForm(wallet)
  }, [wallet, syncForm])

  const handleCancelEdit = () => {
    if (wallet) syncForm(wallet)
    setEditing(false)
  }

  const handleUpdate = async () => {
    try {
      if (!formData.name.trim()) {
        toast.error('Le nom est requis')
        return
      }

      await walletApi.update(id, formData)
      invalidateFinancialCaches()
      const fresh = await walletApi.getHistory(id)
      setCache(CACHE_KEYS.wallet(id), fresh)
      setData(fresh)
      syncForm(fresh.wallet)
      toast.success('Poche modifiée avec succès !')
      setEditing(false)
    } catch (error: unknown) {
      if (isPremiumRequiredError(error)) {
        requirePremium(error.message)
        return
      }
      const message = error instanceof Error ? error.message : 'Erreur lors de la modification'
      toast.error(message)
    }
  }

  const handleDelete = async () => {
    if (transactions.length > 0) {
      toast.error('Impossible de supprimer une poche avec des transactions')
      return
    }

    const confirmed = await confirm({
      title: 'Supprimer la poche ?',
      message: `Êtes-vous sûr de vouloir supprimer "${wallet?.name}" ? Cette action est irréversible.`,
      confirmText: 'Oui, supprimer',
      cancelText: 'Annuler',
      variant: 'danger',
    })

    if (!confirmed) return

    try {
      await walletApi.delete(id)
      invalidateFinancialCaches()
      toast.success('Poche supprimée avec succès !')
      router.push('/wallets')
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur lors de la suppression'
      toast.error(message)
    }
  }

  if (loading && !data) {
    return (
      <PageShell>
        <Header title="Poche" showBack />
        <LoadingSpinner />
      </PageShell>
    )
  }

  if (!wallet) {
    return (
      <PageShell>
        <Header title="Poche" showBack />
        <main className="max-w-md mx-auto px-4 py-6">
          <p className="text-center text-gray-500">Poche introuvable</p>
        </main>
      </PageShell>
    )
  }

  const groupedTransactions = groupTransactionsByDate(transactions)

  return (
    <PageShell>
      <Header title={editing ? 'Modifier' : wallet.name} showBack />

      <main className="max-w-md mx-auto px-4 py-4 space-y-6">
        <WalletHeroCard
          balance={wallet.current_balance}
          currency={wallet.currency}
          imageUrl={wallet.image_url}
          editing={editing}
          formData={formData}
          onFormChange={setFormData}
          onEdit={() => {
            syncForm(wallet)
            setEditing(true)
          }}
          onDelete={handleDelete}
          onSave={handleUpdate}
          onCancel={handleCancelEdit}
          premiumRequired={!isPremium}
        />

        <div>
          <h3 className="text-base font-bold text-gray-900 mb-3">
            Historique des transactions
          </h3>

          {transactions.length === 0 ? (
            <div className="card p-8 text-center">
              <p className="text-gray-500">Aucune transaction</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedTransactions).map(([date, items]) => (
                <div key={date}>
                  <h4 className="text-sm font-semibold text-gray-500 mb-2 px-1">{date}</h4>
                  <div className="space-y-2.5">
                    {items.map((transaction) => (
                      <TransactionItem
                        key={transaction._id}
                        transaction={transaction}
                        isPremium={isPremium}
                        onRequirePremium={requirePremium}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <ConfirmModal
        isOpen={confirmState.isOpen}
        onClose={closeConfirm}
        onConfirm={confirmState.onConfirm}
        title={confirmState.title}
        message={confirmState.message}
        confirmText={confirmState.confirmText}
        cancelText={confirmState.cancelText}
        variant={confirmState.variant}
      />
    </PageShell>
  )
}
