'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import {
  Wallet,
  Category,
  SavingsGoal,
  walletApi,
  transactionApi,
  plannedExpenseApi,
  categoryApi,
  savingsGoalApi,
} from '@/lib/api'
import {
  isFutureUtcDay,
  getTodayUtcDateInputValue,
} from '@/lib/plannedExpenseDates'
import PlannedExpensesInfoModal from '@/components/PlannedExpensesInfoModal'
import { getUser } from '@/lib/auth'
import { invalidateFinancialCaches } from '@/lib/cache'
import PageShell from '@/components/PageShell'
import Header from '@/components/Header'
import Button from '@/components/Button'
import Input from '@/components/Input'
import Select from '@/components/Select'
import LoadingSpinner from '@/components/LoadingSpinner'
import { useSubscription } from '@/hooks/useSubscription'
import { useCurrency } from '@/contexts/CurrencyContext'
import { Info } from 'lucide-react'

function NewTransactionForm() {
  const { isPremium, requirePremium, handleApiError } = useSubscription()
  const { formatAmount } = useCurrency()
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
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([])
  const [toSavings, setToSavings] = useState(false)
  const [savingsGoalId, setSavingsGoalId] = useState('')
  const [plannedInfoOpen, setPlannedInfoOpen] = useState(false)
  const [hidePlannedHelp, setHidePlannedHelp] = useState(
    () => !!getUser()?.hidePlannedExpensesHelp
  )

  const todayUtc = getTodayUtcDateInputValue()
  const maxDateForIncomeTransfer = type !== 'expense' ? todayUtc : undefined

  useEffect(() => {
    loadData()
  }, [type])

  useEffect(() => {
    if (type === 'expense') {
      setToSavings(false)
      setSavingsGoalId('')
    }
    if (type !== 'expense' && isFutureUtcDay(date)) {
      setDate(todayUtc)
    }
  }, [type, date, todayUtc])

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

      if (isPremium && (type === 'income' || type === 'transfer')) {
        const goals = await savingsGoalApi.getAll().catch(() => [])
        setSavingsGoals(goals)
      }
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!amount) {
      toast.error('Veuillez remplir tous les champs requis')
      return
    }

    if (toSavings) {
      if (!isPremium) {
        requirePremium('L\'épargne est réservée aux abonnés Premium')
        return
      }
      if (!savingsGoalId) {
        toast.error('Choisissez un objectif d\'épargne')
        return
      }
    }

    if (!toSavings && !walletId) {
      toast.error('Veuillez sélectionner une poche')
      return
    }

    if (toSavings && type === 'transfer' && !walletId) {
      toast.error('Veuillez sélectionner la poche source')
      return
    }

    try {
      setLoading(true)

      const data = {
        amount: parseFloat(amount),
        wallet_id: walletId || undefined,
        category_id: categoryId || undefined,
        description: description || undefined,
        date: new Date(date).toISOString(),
        savings_goal_id: toSavings ? savingsGoalId : undefined,
      }

      if (type === 'income') {
        await transactionApi.createIncome(data)
        toast.success(
          toSavings ? 'Épargne alimentée avec succès !' : 'Revenu enregistré avec succès !'
        )
      } else if (type === 'expense') {
        if (isFutureUtcDay(date)) {
          await plannedExpenseApi.create({
            amount: data.amount,
            wallet_id: walletId,
            category_id: categoryId || undefined,
            description: data.description,
            scheduled_date: date,
          })
          toast.success(
            'Dépense future enregistrée ! Elle sera débitée le jour prévu (UTC) si votre solde le permet.'
          )
        } else {
          await transactionApi.createExpense({
            ...data,
            wallet_id: walletId,
          })
          toast.success('Dépense enregistrée avec succès !')
        }
      } else if (type === 'transfer') {
        if (toSavings) {
          await transactionApi.createTransfer({
            amount: data.amount,
            wallet_id: walletId,
            savings_goal_id: savingsGoalId,
            description: data.description,
            date: data.date,
          })
          toast.success('Transfert vers l\'épargne effectué !')
        } else {
          if (!destinationWalletId) {
            toast.error('Veuillez sélectionner un portefeuille de destination')
            return
          }
          await transactionApi.createTransfer({
            ...data,
            wallet_id: walletId,
            destination_wallet_id: destinationWalletId,
          })
          toast.success('Transfert effectué avec succès !')
        }
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

  const savingsGoalOptions = [
    { value: '', label: 'Choisir un objectif' },
    ...savingsGoals.map((g) => ({ value: g._id, label: g.title })),
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

  const toggleToSavings = () => {
    if (!isPremium) {
      requirePremium('L\'épargne est réservée aux abonnés Premium')
      return
    }
    if (savingsGoals.length === 0) {
      toast.error('Créez d\'abord un objectif d\'épargne')
      return
    }
    setToSavings(!toSavings)
    if (toSavings) setSavingsGoalId('')
  }

  const addWalletLink = (
    <Link
      href="/wallets/new"
      className="text-sm font-semibold text-primary-500 touch-manipulation"
    >
      + Ajouter
    </Link>
  )

  const showSavingsOption =
    isPremium && (type === 'income' || type === 'transfer') && savingsGoals.length > 0

  const showSourceWallet = type !== 'income' || !toSavings
  const selectedWallet = wallets.find((w) => w._id === walletId) ?? null
  const parsedAmount = parseFloat(amount)
  const amountExceedsBalance =
    showSourceWallet &&
    !!selectedWallet &&
    !!amount &&
    !Number.isNaN(parsedAmount) &&
    parsedAmount > 0 &&
    (type === 'expense' || type === 'transfer') &&
    parsedAmount > selectedWallet.current_balance

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
            {showSourceWallet && selectedWallet && (
              <p className="text-xs text-center text-gray-500 mb-2">
                Solde actuel :{' '}
                <span className="font-semibold text-gray-700">
                  {formatAmount(selectedWallet.current_balance)}
                </span>
              </p>
            )}
            <input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              required
              className={`w-full text-3xl font-bold text-center bg-transparent border-0 focus:outline-none focus:ring-0 ${
                amountExceedsBalance ? 'text-red-500' : 'text-primary-600'
              }`}
            />
            {amountExceedsBalance && (
              <p className="text-xs text-red-500 text-center mt-2">
                Montant supérieur au solde de la poche
              </p>
            )}
          </div>

          {showSavingsOption && (
            <div className="card p-4 space-y-3">
              <label className="flex items-center gap-3 cursor-pointer touch-manipulation">
                <input
                  type="checkbox"
                  checked={toSavings}
                  onChange={toggleToSavings}
                  className="w-5 h-5 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                />
                <span className="text-sm font-medium text-gray-800">Vers épargne</span>
              </label>
              {toSavings && (
                <Select
                  label="Objectif d'épargne"
                  value={savingsGoalId}
                  onChange={(e) => setSavingsGoalId(e.target.value)}
                  options={savingsGoalOptions}
                  required
                />
              )}
            </div>
          )}

          <div className="card p-4 space-y-4">
            {(type !== 'income' || !toSavings) && (
              <Select
                label={type === 'transfer' ? 'Depuis' : 'Poche'}
                value={walletId}
                onChange={(e) => setWalletId(e.target.value)}
                options={walletOptions}
                labelAction={addWalletLink}
                required
              />
            )}

            {type === 'transfer' && !toSavings && (
              <Select
                label="Vers"
                value={destinationWalletId}
                onChange={(e) => setDestinationWalletId(e.target.value)}
                options={destinationWalletOptions}
                labelAction={addWalletLink}
                required
              />
            )}

            {type !== 'transfer' && !toSavings && (
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

            <Input
              label="Description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Courses du mois"
            />

            <div>
              <Input
                label="Date"
                type="date"
                value={date}
                max={maxDateForIncomeTransfer}
                onChange={(e) => setDate(e.target.value)}
                required
              />

              {type === 'expense' && !hidePlannedHelp && (
                <button
                  type="button"
                  onClick={() => setPlannedInfoOpen(true)}
                  className="mt-1.5 w-full flex items-center justify-center gap-1.5 text-xs text-primary-600 font-medium touch-manipulation"
                >
                  <Info size={16} />
                  Comment fonctionnent les dépenses prévues ?
                </button>
              )}
            </div>

            {type === 'expense' && isFutureUtcDay(date) && (
              <p className="text-xs text-primary-700 bg-primary-50 rounded-lg px-3 py-2">
                Date future : cette dépense sera planifiée et débitée automatiquement le jour
                choisi (UTC), si le solde est suffisant.
              </p>
            )}
          </div>

          <Button type="submit" fullWidth size="lg" disabled={loading}>
            {loading
              ? 'Enregistrement...'
              : type === 'expense' && isFutureUtcDay(date)
                ? 'Planifier la dépense'
                : 'Enregistrer'}
          </Button>
        </form>
      </main>

      <PlannedExpensesInfoModal
        isOpen={plannedInfoOpen}
        onClose={() => setPlannedInfoOpen(false)}
        onDismissHelp={() => setHidePlannedHelp(true)}
      />
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
