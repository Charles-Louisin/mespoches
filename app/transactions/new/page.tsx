'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { Wallet, Category, walletApi, transactionApi, categoryApi } from '@/lib/api'
import { invalidateFinancialCaches } from '@/lib/cache'
import PageShell from '@/components/PageShell'
import Header from '@/components/Header'
import Button from '@/components/Button'
import Input from '@/components/Input'
import Select from '@/components/Select'
import LoadingSpinner from '@/components/LoadingSpinner'
import { useSubscription } from '@/hooks/useSubscription'

function NewTransactionForm() {
  const { isPremium, requirePremium, handleApiError } = useSubscription()
  const router = useRouter()
  const searchParams = useSearchParams()
  const typeParam = searchParams.get('type')

  const [type, setType] = useState<'income' | 'expense' | 'transfer'>(
    (typeParam as 'income' | 'expense') || 'expense'
  )
  const [amount, setAmount] = useState('')
  const [walletId, setWalletId] = useState('')
  const [destinationWalletId, setDestinationWalletId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    loadData()
  }, [type])

  const loadData = async () => {
    try {
      const walletsData = await walletApi.getAll()
      setWallets(walletsData)

      if (walletsData.length > 0 && !walletId) {
        setWalletId(walletsData[0]._id)
      }

      if (type !== 'transfer') {
        const categoriesData = await categoryApi.getAll(type)
        setCategories(categoriesData)
      }
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!amount || !walletId) {
      toast.error('Veuillez remplir tous les champs requis')
      return
    }

    try {
      setLoading(true)

      const data = {
        amount: parseFloat(amount),
        wallet_id: walletId,
        category_id: categoryId || undefined,
        description: description || undefined,
        date: new Date(date).toISOString(),
      }

      if (type === 'income') {
        await transactionApi.createIncome(data)
        toast.success('Revenu enregistré avec succès !')
      } else if (type === 'expense') {
        await transactionApi.createExpense(data)
        toast.success('Dépense enregistrée avec succès !')
      } else if (type === 'transfer') {
        if (!destinationWalletId) {
          toast.error('Veuillez sélectionner un portefeuille de destination')
          return
        }
        await transactionApi.createTransfer({
          ...data,
          destination_wallet_id: destinationWalletId,
        })
        toast.success('Transfert effectué avec succès !')
      }

      invalidateFinancialCaches()
      router.push('/transactions')
    } catch (error: unknown) {
      if (handleApiError(error)) return
      const message = error instanceof Error ? error.message : 'Une erreur est survenue'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const walletOptions = [
    { value: '', label: 'Sélectionner une poche' },
    ...wallets.map((w) => ({ value: w._id, label: w.name })),
  ]

  const categoryOptions = [
    { value: '', label: 'Aucune catégorie' },
    ...categories.map((c) => ({ value: c._id, label: c.name })),
  ]

  const destinationWalletOptions = [
    { value: '', label: 'Sélectionner la destination' },
    ...wallets.filter((w) => w._id !== walletId).map((w) => ({ value: w._id, label: w.name })),
  ]

  const typeButtons: { key: typeof type; label: string; premium?: boolean }[] = [
    { key: 'income', label: 'Revenu' },
    { key: 'expense', label: 'Dépense' },
    { key: 'transfer', label: 'Transfert', premium: true },
  ]

  const selectType = (key: typeof type) => {
    if (key === 'transfer' && !isPremium) {
      requirePremium('Les transferts entre poches sont réservés aux abonnés Premium')
      return
    }
    setType(key)
  }

  const addWalletLink = (
    <Link
      href="/wallets/new"
      className="text-sm font-semibold text-primary-500 touch-manipulation"
    >
      + Ajouter
    </Link>
  )

  return (
    <PageShell>
      <Header title="Nouvelle transaction" showBack />

      <main className="max-w-md mx-auto px-4 py-4">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-3 gap-2">
            {typeButtons.map(({ key, label, premium }) => (
              <button
                key={key}
                type="button"
                onClick={() => selectType(key)}
                className={`py-3 rounded-xl font-semibold text-sm touch-manipulation transition relative ${
                  type === key
                    ? 'bg-primary-500 text-white shadow-sm shadow-primary-500/30'
                    : 'card text-gray-700 border border-gray-100'
                }`}
              >
                {label}
                {premium && !isPremium && (
                  <span className="absolute -top-1 -right-1 text-[9px] bg-amber-400 text-amber-900 px-1 rounded font-bold">
                    Pro
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="card p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
              Montant
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              required
              className="w-full text-3xl font-bold text-center text-primary-600 bg-transparent border-0 focus:outline-none focus:ring-0"
            />
          </div>

          <div className="card p-4 space-y-4">
            <Select
              label={type === 'transfer' ? 'Depuis' : 'Poche'}
              value={walletId}
              onChange={(e) => setWalletId(e.target.value)}
              options={walletOptions}
              labelAction={addWalletLink}
              required
            />

            {type === 'transfer' && (
              <Select
                label="Vers"
                value={destinationWalletId}
                onChange={(e) => setDestinationWalletId(e.target.value)}
                options={destinationWalletOptions}
                labelAction={addWalletLink}
                required
              />
            )}

            {type !== 'transfer' && (
              <Select
                label="Catégorie (optionnel)"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                options={categoryOptions}
                labelAction={
                  <Link
                    href="/categories"
                    className="text-sm font-semibold text-primary-500 touch-manipulation"
                  >
                    + Ajouter
                  </Link>
                }
              />
            )}

          {/* Description */}
          <Input
            label="Description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex: Courses du mois"
          />

            <Input
              label="Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <Button type="submit" fullWidth size="lg" disabled={loading}>
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </form>
      </main>
    </PageShell>
  )
}

export default function NewTransactionPage() {
  return (
    <Suspense
      fallback={
        <PageShell>
          <Header title="Nouvelle transaction" showBack />
          <LoadingSpinner />
        </PageShell>
      }
    >
      <NewTransactionForm />
    </Suspense>
  )
}
