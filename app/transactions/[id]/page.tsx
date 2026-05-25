'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import {
  Transaction,
  Wallet,
  Category,
  transactionApi,
  walletApi,
  categoryApi,
} from '@/lib/api'
import { CACHE_KEYS, invalidateFinancialCaches, setCache } from '@/lib/cache'
import { useCachedData } from '@/hooks/useCachedData'
import PageShell from '@/components/PageShell'
import Header from '@/components/Header'
import Button from '@/components/Button'
import Input from '@/components/Input'
import Select from '@/components/Select'
import LoadingSpinner from '@/components/LoadingSpinner'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import {
  ArrowDownRight,
  ArrowRightLeft,
  ArrowUpRight,
  Pencil,
  Save,
  X,
} from 'lucide-react'
import TransactionExportActions from '@/components/TransactionExportActions'
import { useSubscription } from '@/hooks/useSubscription'

interface TransactionDetailCache {
  transaction: Transaction
  transferPair: { debit: Transaction | null; credit: Transaction | null } | null
}

export default function TransactionDetailPage() {
  const params = useParams()
  const id = params.id as string
  const { isPremium, requirePremium } = useSubscription()

  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    wallet_id: '',
    category_id: '',
    date: '',
  })

  const fetchDetail = useCallback(async (): Promise<TransactionDetailCache> => {
    const data = await transactionApi.getById(id)
    let transferPair: TransactionDetailCache['transferPair'] = null
    if (data.type === 'transfer') {
      transferPair = await transactionApi.getTransferPair(id)
    }
    return { transaction: data, transferPair }
  }, [id])

  const { data, loading, setData } = useCachedData(
    CACHE_KEYS.transaction(id),
    fetchDetail,
    !!id
  )

  const transaction = data?.transaction ?? null
  const transferPair = data?.transferPair ?? null

  const syncFormFromTransaction = useCallback((t: Transaction) => {
    const walletId =
      typeof t.wallet_id === 'object' ? (t.wallet_id as Wallet)._id : String(t.wallet_id)
    const categoryId =
      t.category_id && typeof t.category_id === 'object'
        ? (t.category_id as Category)._id
        : t.category_id
          ? String(t.category_id)
          : ''
    setFormData({
      description: t.description || '',
      amount: String(t.amount),
      wallet_id: walletId,
      category_id: categoryId,
      date: new Date(t.date).toISOString().split('T')[0],
    })
  }, [])

  useEffect(() => {
    if (transaction) syncFormFromTransaction(transaction)
  }, [transaction, syncFormFromTransaction])

  const loadEditOptions = async (type: Transaction['type']) => {
    const [walletsData, categoriesData] = await Promise.all([
      walletApi.getAll(),
      type !== 'transfer' ? categoryApi.getAll(type) : Promise.resolve([]),
    ])
    setWallets(walletsData)
    setCategories(categoriesData)
  }

  const handleStartEdit = async () => {
    if (!transaction || transaction.type === 'transfer') return
    await loadEditOptions(transaction.type)
    syncFormFromTransaction(transaction)
    setEditing(true)
  }

  const handleSave = async () => {
    if (!transaction || transaction.type === 'transfer') return

    const amount = parseFloat(formData.amount)
    if (!formData.description.trim() || !amount || amount <= 0 || !formData.wallet_id) {
      toast.error('Veuillez remplir tous les champs requis')
      return
    }

    try {
      setSaving(true)
      const updated = await transactionApi.update(id, {
        description: formData.description.trim(),
        amount,
        wallet_id: formData.wallet_id,
        category_id: formData.category_id || null,
        date: new Date(formData.date).toISOString(),
      })
      invalidateFinancialCaches()
      setCache(CACHE_KEYS.transaction(id), {
        transaction: updated,
        transferPair: null,
      })
      setData({ transaction: updated, transferPair: null })
      toast.success('Transaction modifiée')
      setEditing(false)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur lors de la modification'
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  const handleCancelEdit = () => {
    if (transaction) syncFormFromTransaction(transaction)
    setEditing(false)
  }

  const wallet =
    transaction && typeof transaction.wallet_id === 'object'
      ? (transaction.wallet_id as Wallet)
      : null

  const destWallet =
    transaction &&
    transaction.destination_wallet_id &&
    typeof transaction.destination_wallet_id === 'object'
      ? (transaction.destination_wallet_id as Wallet)
      : null

  const debitWallet =
    transferPair?.debit && typeof transferPair.debit.wallet_id === 'object'
      ? (transferPair.debit.wallet_id as Wallet)
      : null

  const creditWallet =
    transferPair?.credit && typeof transferPair.credit.wallet_id === 'object'
      ? (transferPair.credit.wallet_id as Wallet)
      : null

  const category =
    transaction &&
    transaction.category_id &&
    typeof transaction.category_id === 'object'
      ? (transaction.category_id as Category)
      : null

  const getTypeLabel = (t: Transaction['type']) => {
    if (t === 'income') return 'Revenu'
    if (t === 'expense') return 'Dépense'
    return 'Transfert'
  }

  const getTypeIcon = (t: Transaction['type']) => {
    if (t === 'income') return <ArrowDownRight size={20} className="text-green-600" />
    if (t === 'expense') return <ArrowUpRight size={20} className="text-red-600" />
    return <ArrowRightLeft size={20} className="text-blue-600" />
  }

  const getAmountSign = (t: Transaction['type']) => {
    if (t === 'expense') return '-'
    if (t === 'income') return '+'
    return ''
  }

  const getAmountColor = (t: Transaction['type']) => {
    if (t === 'income') return 'text-green-600'
    if (t === 'expense') return 'text-red-500'
    return 'text-gray-700'
  }

  const updatedAt = transaction?.updated_at || transaction?.updatedAt

  if (loading && !data) {
    return (
      <PageShell>
        <Header title="Transaction" showBack />
        <LoadingSpinner />
      </PageShell>
    )
  }

  if (!transaction) {
    return (
      <PageShell>
        <Header title="Transaction" showBack />
        <main className="max-w-md mx-auto px-4 py-6">
          <div className="card p-6 text-center">
            <p className="text-gray-600 font-medium">Transaction introuvable</p>
          </div>
        </main>
      </PageShell>
    )
  }

  const isTransfer = transaction.type === 'transfer'
  const canEdit = !isTransfer
  const transferTitle =
    isTransfer && debitWallet && creditWallet
      ? `Transfert ${debitWallet.name} → ${creditWallet.name}`
      : isTransfer && wallet && destWallet
        ? `Transfert ${wallet.name} → ${destWallet.name}`
        : null

  const walletOptions = [
    { value: '', label: 'Sélectionner une poche' },
    ...wallets.map((w) => ({ value: w._id, label: w.name })),
  ]

  const categoryOptions = [
    { value: '', label: 'Aucune catégorie' },
    ...categories.map((c) => ({ value: c._id, label: c.name })),
  ]

  return (
    <PageShell>
      <Header
        title={editing ? 'Modifier' : 'Détail transaction'}
        showBack
        action={
          canEdit && !editing ? (
            <button
              type="button"
              onClick={handleStartEdit}
              className="p-2 text-primary-500 touch-manipulation"
              aria-label="Modifier"
            >
              <Pencil size={20} />
            </button>
          ) : undefined
        }
      />

      <main className="max-w-md mx-auto px-4 py-4 space-y-4">
        <section className="card p-5">
          {editing ? (
            <div className="space-y-4">
              <Input
                label="Libellé"
                type="text"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                required
              />
              <Input
                label="Montant"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
              />
              <Select
                label="Poche"
                value={formData.wallet_id}
                onChange={(e) => setFormData({ ...formData, wallet_id: e.target.value })}
                options={walletOptions}
                required
              />
              <Select
                label="Catégorie (optionnel)"
                value={formData.category_id}
                onChange={(e) =>
                  setFormData({ ...formData, category_id: e.target.value })
                }
                options={categoryOptions}
                labelAction={
                  <Link
                    href="/categories"
                    className="text-sm font-semibold text-primary-500"
                  >
                    + Ajouter
                  </Link>
                }
              />
              <Input
                label="Date de la transaction"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
              <div className="flex gap-2">
                <Button
                  fullWidth
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
                <Button
                  variant="outline"
                  fullWidth
                  onClick={handleCancelEdit}
                  className="flex items-center justify-center gap-2"
                >
                  <X size={18} />
                  Annuler
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="mt-0.5">{getTypeIcon(transaction.type)}</div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    {getTypeLabel(transaction.type)}
                  </p>
                  <p className="font-semibold text-gray-900 break-words leading-snug">
                    {transferTitle ||
                      transaction.description ||
                      category?.name ||
                      '—'}
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {formatDateTime(transaction.date)}
                  </p>
                </div>
              </div>
              <p
                className={`text-xl font-bold ${getAmountColor(transaction.type)} whitespace-nowrap shrink-0`}
              >
                {getAmountSign(transaction.type)}
                {formatCurrency(transaction.amount, wallet?.currency || 'XAF')}
              </p>
            </div>
          )}
        </section>

        {!editing && (
          <>
            <section className="card p-5">
              <h2 className="text-sm font-bold text-gray-900 mb-3">Informations</h2>
              <div className="space-y-3 text-sm">
                {!isTransfer && (
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-gray-500">Poche</span>
                    <span className="font-medium text-gray-900">{wallet?.name || '—'}</span>
                  </div>
                )}
                {transaction.type !== 'transfer' && (
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-gray-500">Catégorie</span>
                    <span className="font-medium text-gray-900">{category?.name || '—'}</span>
                  </div>
                )}
                {!isTransfer && (
                  <>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-gray-500">Solde avant</span>
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(transaction.balance_before, wallet?.currency || 'XAF')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-gray-500">Solde après</span>
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(transaction.balance_after, wallet?.currency || 'XAF')}
                      </span>
                    </div>
                  </>
                )}
                {isTransfer && (
                  <>
                    <div className="rounded-xl bg-gray-50 p-3">
                      <p className="text-xs font-semibold text-gray-500 mb-2">Source</p>
                      <p className="font-medium">{debitWallet?.name || wallet?.name || '—'}</p>
                    </div>
                    <div className="rounded-xl bg-gray-50 p-3">
                      <p className="text-xs font-semibold text-gray-500 mb-2">Destination</p>
                      <p className="font-medium">{creditWallet?.name || destWallet?.name || '—'}</p>
                    </div>
                  </>
                )}
              </div>
            </section>

            <TransactionExportActions
              transactionId={id}
              isPremium={isPremium}
              onRequirePremium={requirePremium}
            />

            <section className="card p-5">
              <h2 className="text-sm font-bold text-gray-900 mb-3">Dates</h2>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-gray-500">Créée le</span>
                  <span className="font-medium text-gray-900">
                    {formatDateTime(transaction.created_at)}
                  </span>
                </div>
                {updatedAt && (
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-gray-500">Modifiée le</span>
                    <span className="font-medium text-primary-600">
                      {formatDateTime(updatedAt)}
                    </span>
                  </div>
                )}
              </div>
            </section>
          </>
        )}
      </main>
    </PageShell>
  )
}
