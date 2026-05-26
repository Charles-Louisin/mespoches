'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Pencil, Trash2 } from 'lucide-react'
import ProFeature from '@/components/ProFeature'
import LoadingSpinner from '@/components/LoadingSpinner'
import Button from '@/components/Button'
import Input from '@/components/Input'
import Select from '@/components/Select'
import { budgetApi, categoryApi, Budget, Category } from '@/lib/api'
import { useCurrency } from '@/contexts/CurrencyContext'
import { getCurrencySymbol } from '@/lib/currencies'
import { invalidateFinancialCaches } from '@/lib/cache'

interface BudgetsSectionProps {
  isPremium: boolean
  onApiError: (err: unknown, msg?: string) => boolean
  variant?: 'full' | 'home'
}

export default function BudgetsSection({
  isPremium,
  onApiError,
  variant = 'full',
}: BudgetsSectionProps) {
  const { formatAmount, currency } = useCurrency()
  const currencyLabel = getCurrencySymbol(currency)
  const now = new Date()
  const [year] = useState(now.getFullYear())
  const [month] = useState(now.getMonth() + 1)
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [categoryId, setCategoryId] = useState('')
  const [limitAmount, setLimitAmount] = useState('')
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editLimit, setEditLimit] = useState('')

  const isHome = variant === 'home'

  useEffect(() => {
    if (!isPremium) return
    load()
  }, [isPremium])

  const load = async () => {
    try {
      setLoading(true)
      const [b, c] = await Promise.all([
        budgetApi.getAll(year, month),
        categoryApi.getAll('expense'),
      ])
      setBudgets(b)
      setCategories(c)
    } catch (e) {
      if (!onApiError(e)) toast.error('Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!categoryId || !limitAmount) return
    try {
      setSaving(true)
      await budgetApi.create({
        category_id: categoryId,
        year,
        month,
        limit_amount: parseFloat(limitAmount),
      })
      toast.success('Budget créé')
      setCategoryId('')
      setLimitAmount('')
      setShowForm(false)
      invalidateFinancialCaches()
      load()
    } catch (err) {
      onApiError(err, 'Erreur lors de la création')
    } finally {
      setSaving(false)
    }
  }

  const startEdit = (b: Budget) => {
    setEditingId(b._id)
    setEditLimit(String(b.limit_amount))
  }

  const handleUpdate = async (id: string) => {
    const limit = parseFloat(editLimit)
    if (!limit || limit <= 0) return
    try {
      setSaving(true)
      await budgetApi.update(id, limit)
      toast.success('Budget mis à jour')
      setEditingId(null)
      invalidateFinancialCaches()
      load()
    } catch (err) {
      onApiError(err, 'Erreur lors de la mise à jour')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await budgetApi.delete(id)
      toast.success('Budget supprimé')
      invalidateFinancialCaches()
      load()
    } catch (err) {
      onApiError(err, 'Erreur lors de la suppression')
    }
  }

  const listContent =
    loading ? (
      <LoadingSpinner />
    ) : budgets.length === 0 ? (
      <p className="text-center text-gray-500 text-sm">
        {isHome ? 'Aucun budget ce mois-ci' : 'Aucun budget ce mois-ci'}
      </p>
    ) : (
      <ul className="space-y-3">
        {budgets.slice(0, isHome ? 3 : undefined).map((b) => {
          const cat =
            typeof b.category_id === 'object' && b.category_id
              ? (b.category_id as Category).name
              : 'Catégorie'
          const pct = Math.min(100, b.percent ?? 0)
          const over = pct >= 100
          const isEditing = editingId === b._id

          return (
            <li key={b._id} className="card p-4">
              {isEditing && !isHome ? (
                <div className="space-y-2">
                  <p className="font-medium">{cat}</p>
                  <Input
                    label={`Nouveau plafond (${currencyLabel})`}
                    type="number"
                    value={editLimit}
                    onChange={(e) => setEditLimit(e.target.value)}
                    min={0}
                  />
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      className="flex-1"
                      disabled={saving}
                      onClick={() => handleUpdate(b._id)}
                    >
                      Enregistrer
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      className="flex-1"
                      onClick={() => setEditingId(null)}
                    >
                      Annuler
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start mb-2 gap-2">
                    <span className="font-medium">{cat}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">
                        {formatAmount(b.spent ?? 0)} / {formatAmount(b.limit_amount)}
                      </span>
                      {!isHome && (
                        <>
                          <button
                            type="button"
                            onClick={() => startEdit(b)}
                            className="p-1 text-gray-400 hover:text-primary-600"
                            aria-label="Modifier"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(b._id)}
                            className="p-1 text-gray-400 hover:text-red-600"
                            aria-label="Supprimer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${over ? 'bg-red-500' : 'bg-primary-500'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  {over && <p className="text-xs text-red-600 mt-1">Budget dépassé</p>}
                </>
              )}
            </li>
          )
        })}
      </ul>
    )

  return (
    <ProFeature
      isPremium={isPremium}
      title="Budgets du mois"
      description="Plafonds par catégorie de dépenses et suivi en temps réel"
    >
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="section-title">Budget du mois</h3>
          {!isHome && (
            <button
              type="button"
              onClick={() => setShowForm(!showForm)}
              className="text-sm text-primary-600 font-semibold touch-manipulation"
            >
              {showForm ? 'Annuler' : 'Ajouter'}
            </button>
          )}
          {isHome && (
            <Link href="/categories" className="link-muted text-sm">
              Voir tout
            </Link>
          )}
        </div>

        {!isHome && showForm && (
          <form onSubmit={handleCreate} className="card p-4 space-y-3">
            <Select
              label="Catégorie"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              options={[
                { value: '', label: 'Choisir une catégorie' },
                ...categories.map((c) => ({ value: c._id, label: c.name })),
              ]}
            />
            <Input
              label={`Plafond (${currencyLabel})`}
              type="number"
              value={limitAmount}
              onChange={(e) => setLimitAmount(e.target.value)}
              min={0}
            />
            <Button type="submit" disabled={saving} className="w-full">
              Ajouter un budget
            </Button>
          </form>
        )}

        {listContent}
      </section>
    </ProFeature>
  )
}
