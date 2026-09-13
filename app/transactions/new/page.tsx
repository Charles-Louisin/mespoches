'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
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
  sanitizeLineItems,
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
import SelectModal from '@/components/SelectModal'
import LoadingSpinner from '@/components/LoadingSpinner'
import { useSubscription } from '@/hooks/useSubscription'
import { useCurrency } from '@/contexts/CurrencyContext'
import { Info, Plus, Trash2 } from 'lucide-react'

type LineDraft = { id: string; description: string; amount: string }

function newLine(): LineDraft {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    description: '',
    amount: '',
  }
}

function NewTransactionForm() {
  const { isPremium, showProBadge, requirePremium, handleApiError } = useSubscription()
  const { formatAmount } = useCurrency()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [type, setType] = useState<'income' | 'expense' | 'transfer'>('expense')
  const [lines, setLines] = useState<LineDraft[]>([newLine()])
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
  const [hidePlannedHelp, setHidePlannedHelp] = useState(false)

  const todayUtc = getTodayUtcDateInputValue()
  const multiLineEnabled = type !== 'transfer' && !toSavings

  useEffect(() => {
    const typeParam = searchParams.get('type')
    if (typeParam === 'income' || typeParam === 'expense') {
      setType(typeParam)
    }
    setHidePlannedHelp(!!getUser()?.hidePlannedExpensesHelp)
  }, [searchParams])
  const maxDateForIncomeTransfer = type !== 'expense' ? todayUtc : undefined

  useEffect(() => {
    void loadData()
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

  const parsedLines = useMemo(() => {
    return lines
      .map((line) => ({
        description: line.description.trim(),
        amount: parseFloat(line.amount.replace(',', '.')),
      }))
      .filter((line) => !Number.isNaN(line.amount) && line.amount > 0)
  }, [lines])

  const totalAmount = parsedLines.reduce((sum, line) => sum + line.amount, 0)

  const updateLine = (id: string, patch: Partial<LineDraft>) => {
    setLines((prev) => prev.map((line) => (line.id === id ? { ...line, ...patch } : line)))
  }

  const removeLine = (id: string) => {
    setLines((prev) => (prev.length <= 1 ? prev : prev.filter((line) => line.id !== id)))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return

    if (multiLineEnabled && parsedLines.length === 0) {
      toast.error('Ajoutez au moins un montant')
      return
    }

    if (!multiLineEnabled) {
      const single = parseFloat(lines[0]?.amount?.replace(',', '.') || '')
      if (!single || Number.isNaN(single)) {
        toast.error('Veuillez remplir tous les champs requis')
        return
      }
    }

    if (toSavings) {
      if (!isPremium) {
        requirePremium("L'épargne est réservée aux abonnés Premium")
        return
      }
      if (!savingsGoalId) {
        toast.error("Choisissez un objectif d'épargne")
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

      const amount = multiLineEnabled
        ? totalAmount
        : parseFloat(lines[0].amount.replace(',', '.'))

      const line_items =
        multiLineEnabled && parsedLines.length > 0
          ? sanitizeLineItems(
              parsedLines.map((line) => ({
                description: line.description || description || '',
                amount: line.amount,
                type,
              }))
            )
          : undefined

      const data = {
        amount,
        wallet_id: walletId || undefined,
        category_id: categoryId || undefined,
        description:
          description ||
          (line_items && line_items.length > 1
            ? `${line_items.length} articles`
            : line_items?.[0]?.description) ||
          undefined,
        date: new Date(date).toISOString(),
        savings_goal_id: toSavings ? savingsGoalId : undefined,
        ...(line_items && line_items.length > 0 ? { line_items } : {}),
      }

      if (type === 'income') {
        await transactionApi.createIncome(data)
        toast.success(
          toSavings ? 'Épargne alimentée avec succès !' : 'Revenu enregistré avec succès !'
        )
      } else if (type === 'expense') {
        if (isFutureUtcDay(date)) {
          if (parsedLines.length > 1) {
            toast.error('Une dépense planifiée ne peut contenir qu’une seule ligne')
            return
          }
          await plannedExpenseApi.create({
            amount: data.amount,
            wallet_id: walletId,
            category_id: categoryId || undefined,
            description: data.description,
            scheduled_date: date,
          })
          toast.success('Dépense future enregistrée')
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
          toast.success("Transfert vers l'épargne effectué !")
        } else {
          if (!destinationWalletId) {
            toast.error('Veuillez sélectionner un portefeuille de destination')
            return
          }
          await transactionApi.createTransfer({
            amount: data.amount,
            wallet_id: walletId,
            destination_wallet_id: destinationWalletId,
            description: data.description,
            date: data.date,
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
    setLines([newLine()])
  }

  const toggleToSavings = () => {
    if (!isPremium) {
      requirePremium("L'épargne est réservée aux abonnés Premium")
      return
    }
    if (savingsGoals.length === 0) {
      toast.error("Créez d'abord un objectif d'épargne")
      return
    }
    setToSavings(!toSavings)
    if (toSavings) setSavingsGoalId('')
    setLines([newLine()])
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
  const amountExceedsBalance =
    showSourceWallet &&
    !!selectedWallet &&
    totalAmount > 0 &&
    (type === 'expense' || type === 'transfer') &&
    totalAmount > selectedWallet.current_balance

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
                className={`py-3 rounded-xl font-semibold text-sm touch-manipulation transition relative active:scale-[0.98] ${
                  type === key
                    ? 'bg-primary-600 text-white shadow-soft'
                    : 'card text-ink-soft'
                }`}
              >
                {label}
                {premium && showProBadge && (
                  <span className="absolute -top-1 -right-1 text-[9px] bg-amber-400 text-amber-900 px-1 rounded font-bold">
                    Pro
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="card p-4 space-y-3">
            {showSourceWallet && selectedWallet && (
              <p className="text-xs text-center text-gray-500">
                Solde actuel :{' '}
                <span className="font-semibold text-gray-700">
                  {formatAmount(selectedWallet.current_balance)}
                </span>
              </p>
            )}

            {multiLineEnabled ? (
              <>
                <p className="text-sm font-medium text-gray-700 mb-3">
                  {type === 'expense' ? 'Dépenses' : 'Revenus'}
                </p>

                <div className="space-y-2.5">
                  {lines.map((line) => (
                    <div
                      key={line.id}
                      className="rounded-xl border border-gray-100 bg-gray-50/80 p-2.5 animate-rise"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <input
                          type="text"
                          value={line.description}
                          onChange={(e) => updateLine(line.id, { description: e.target.value })}
                          placeholder="Description (ex: Pain)"
                          className="flex-1 text-sm px-3 py-1.5 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-200"
                        />
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={line.amount}
                          onChange={(e) => updateLine(line.id, { amount: e.target.value })}
                          placeholder="Montant"
                          className={`w-28 text-lg font-bold text-center bg-white rounded-lg px-2 py-1.5 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-200 ${
                            amountExceedsBalance ? 'text-red-500' : 'text-primary-600'
                          }`}
                        />
                        {lines.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeLine(line.id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 touch-manipulation"
                            aria-label="Supprimer"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setLines((prev) => [...prev, newLine()])}
                  className="w-full py-2.5 px-4 rounded-xl border-2 border-dashed border-gray-300 text-sm font-semibold text-gray-600 hover:border-primary-300 hover:text-primary-600 transition touch-manipulation"
                >
                  <Plus size={16} className="inline mr-1" />
                  Ajouter une ligne
                </button>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-sm text-gray-500">Total</span>
                  <span
                    className={`text-lg font-bold ${
                      amountExceedsBalance ? 'text-red-500' : 'text-ink'
                    }`}
                  >
                    {formatAmount(totalAmount || 0)}
                  </span>
                </div>
              </>
            ) : (
              <>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
                  Montant
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={lines[0]?.amount || ''}
                  onChange={(e) => updateLine(lines[0].id, { amount: e.target.value })}
                  placeholder="0"
                  required
                  className={`w-full text-3xl font-bold text-center bg-transparent border-0 focus:outline-none focus:ring-0 ${
                    amountExceedsBalance ? 'text-red-500' : 'text-primary-600'
                  }`}
                />
              </>
            )}

            {amountExceedsBalance && (
              <p className="text-xs text-red-500 text-center">
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
              <SelectModal
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
              <SelectModal
                label={type === 'transfer' ? 'Depuis' : 'Poche'}
                value={walletId}
                onChange={(e) => setWalletId(e.target.value)}
                options={walletOptions}
                labelAction={addWalletLink}
                required
              />
            )}

            {type === 'transfer' && !toSavings && (
              <SelectModal
                label="Vers"
                value={destinationWalletId}
                onChange={(e) => setDestinationWalletId(e.target.value)}
                options={destinationWalletOptions}
                labelAction={addWalletLink}
                required
              />
            )}

            {type !== 'transfer' && !toSavings && (
              <SelectModal
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

            {(!multiLineEnabled || lines.length === 1) && (
              <Input
                label="Description globale (optionnel)"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Courses du mois"
              />
            )}

            {multiLineEnabled && lines.length > 1 && (
              <Input
                label="Libellé de la transaction (optionnel)"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Courses du marché"
              />
            )}

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
          </div>

          <Button type="submit" fullWidth size="lg" loading={loading}>
            {loading
              ? 'Enregistrement...'
              : type === 'expense' && isFutureUtcDay(date)
                ? 'Planifier la dépense'
                : multiLineEnabled && parsedLines.length > 1
                  ? `Enregistrer (${parsedLines.length} lignes)`
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
