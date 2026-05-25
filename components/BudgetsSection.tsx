'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import ProFeature from '@/components/ProFeature'
import LoadingSpinner from '@/components/LoadingSpinner'
import Button from '@/components/Button'
import Input from '@/components/Input'
import Select from '@/components/Select'
import { budgetApi, categoryApi, Budget, Category } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'

interface BudgetsSectionProps {
  isPremium: boolean
  onApiError: (err: unknown, msg?: string) => boolean
}

export default function BudgetsSection({ isPremium, onApiError }: BudgetsSectionProps) {
  const now = new Date()
  const [year] = useState(now.getFullYear())
  const [month] = useState(now.getMonth() + 1)
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [categoryId, setCategoryId] = useState('')
  const [limitAmount, setLimitAmount] = useState('')
  const [saving, setSaving] = useState(false)

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
      load()
    } catch (err) {
      onApiError(err, 'Erreur lors de la création')
    } finally {
      setSaving(false)
    }
  }

  return (
    <ProFeature
      isPremium={isPremium}
      title="Budgets du mois"
      description="Plafonds par catégorie de dépenses et suivi en temps réel"
    >
      <section className="space-y-4">
        <h3 className="section-title px-1">Budgets du mois</h3>
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
            label="Plafond (XAF)"
            type="number"
            value={limitAmount}
            onChange={(e) => setLimitAmount(e.target.value)}
            min={0}
          />
          <Button type="submit" disabled={saving} className="w-full">
            Ajouter un budget
          </Button>
        </form>
        {loading ? (
          <LoadingSpinner />
        ) : budgets.length === 0 ? (
          <p className="text-center text-gray-500 text-sm">Aucun budget ce mois-ci</p>
        ) : (
          <ul className="space-y-3">
            {budgets.map((b) => {
              const cat =
                typeof b.category_id === 'object' && b.category_id
                  ? (b.category_id as Category).name
                  : 'Catégorie'
              const pct = Math.min(100, b.percent ?? 0)
              const over = pct >= 100
              return (
                <li key={b._id} className="card p-4">
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">{cat}</span>
                    <span className="text-sm text-gray-500">
                      {formatCurrency(b.spent ?? 0)} / {formatCurrency(b.limit_amount)}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${over ? 'bg-red-500' : 'bg-primary-500'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  {over && <p className="text-xs text-red-600 mt-1">Budget dépassé</p>}
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </ProFeature>
  )
}
