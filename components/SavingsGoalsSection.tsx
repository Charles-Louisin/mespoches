'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Pencil, Trash2 } from 'lucide-react'
import ProFeature from '@/components/ProFeature'
import LoadingSpinner from '@/components/LoadingSpinner'
import Button from '@/components/Button'
import Input from '@/components/Input'
import { savingsGoalApi, SavingsGoal } from '@/lib/api'
import { useCurrency } from '@/contexts/CurrencyContext'
import { getCurrencySymbol } from '@/lib/currencies'
import { invalidateFinancialCaches } from '@/lib/cache'

interface SavingsGoalsSectionProps {
  isPremium: boolean
  onApiError: (err: unknown, msg?: string) => boolean
  variant?: 'full' | 'home'
}

export default function SavingsGoalsSection({
  isPremium,
  onApiError,
  variant = 'full',
}: SavingsGoalsSectionProps) {
  const { formatAmount, currency } = useCurrency()
  const currencyLabel = getCurrencySymbol(currency)
  const [goals, setGoals] = useState<SavingsGoal[]>([])
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState('')
  const [target, setTarget] = useState('')
  const [deadline, setDeadline] = useState('')
  const [saving, setSaving] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editTarget, setEditTarget] = useState('')
  const [editDeadline, setEditDeadline] = useState('')

  const isHome = variant === 'home'

  useEffect(() => {
    if (!isPremium) return
    load()
  }, [isPremium])

  const load = async () => {
    try {
      setLoading(true)
      const g = await savingsGoalApi.getAll()
      setGoals(g)
    } catch (e) {
      onApiError(e, 'Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !target) return
    try {
      setSaving(true)
      await savingsGoalApi.create({
        title,
        target_amount: parseFloat(target),
        deadline: deadline ? new Date(deadline).toISOString() : null,
      })
      toast.success('Objectif créé')
      setTitle('')
      setTarget('')
      setDeadline('')
      setExpanded(false)
      invalidateFinancialCaches()
      load()
    } catch (err) {
      onApiError(err, 'Erreur')
    } finally {
      setSaving(false)
    }
  }

  const startEdit = (g: SavingsGoal) => {
    setEditingId(g._id)
    setEditTitle(g.title)
    setEditTarget(String(g.target_amount))
    setEditDeadline(
      g.deadline ? new Date(g.deadline).toISOString().split('T')[0] : ''
    )
  }

  const handleUpdate = async (id: string) => {
    if (!editTitle || !editTarget) return
    try {
      setSaving(true)
      await savingsGoalApi.update(id, {
        title: editTitle,
        target_amount: parseFloat(editTarget),
        deadline: editDeadline ? new Date(editDeadline).toISOString() : null,
      })
      toast.success('Objectif mis à jour')
      setEditingId(null)
      invalidateFinancialCaches()
      load()
    } catch (err) {
      onApiError(err, 'Erreur')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await savingsGoalApi.delete(id)
      toast.success('Objectif supprimé')
      invalidateFinancialCaches()
      load()
    } catch (err) {
      onApiError(err, 'Erreur')
    }
  }

  const formatDeadline = (d?: string | null) => {
    if (!d) return null
    return new Date(d).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const listContent =
    loading ? (
      <LoadingSpinner />
    ) : goals.length === 0 ? (
      <p className="text-sm text-gray-500 text-center">Aucun objectif</p>
    ) : (
      <ul className="space-y-2">
        {goals.slice(0, isHome ? 3 : undefined).map((g) => {
          const isEditing = editingId === g._id
          return (
            <li key={g._id} className="card p-4">
              {isEditing && !isHome ? (
                <div className="space-y-2">
                  <Input
                    label="Titre"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                  />
                  <Input
                    label={`Montant cible (${currencyLabel})`}
                    type="number"
                    value={editTarget}
                    onChange={(e) => setEditTarget(e.target.value)}
                  />
                  <Input
                    label="Date limite"
                    type="date"
                    value={editDeadline}
                    onChange={(e) => setEditDeadline(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      className="flex-1"
                      disabled={saving}
                      onClick={() => handleUpdate(g._id)}
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
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <p className="font-semibold">{g.title}</p>
                      {g.deadline && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          Limite : {formatDeadline(g.deadline)}
                        </p>
                      )}
                    </div>
                    {!isHome && (
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => startEdit(g)}
                          className="p-1 text-gray-400 hover:text-primary-600"
                          aria-label="Modifier"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(g._id)}
                          className="p-1 text-gray-400 hover:text-red-600"
                          aria-label="Supprimer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {formatAmount(g.current_amount ?? 0)} /{' '}
                    {formatAmount(g.target_amount)}
                  </p>
                  <div className="h-2 bg-gray-100 rounded-full mt-2 overflow-hidden">
                    <div
                      className="h-full bg-primary-500 rounded-full"
                      style={{ width: `${g.progress_percent ?? 0}%` }}
                    />
                  </div>
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
      title="Objectifs d'épargne"
      description="Définissez un montant cible et suivez la progression"
    >
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="section-title">Objectifs d&apos;épargne</h3>
          {!isHome ? (
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="text-sm text-primary-600 font-medium"
            >
              {expanded ? 'Annuler' : '+ Ajouter'}
            </button>
          ) : (
            <Link href="/wallets" className="link-muted text-sm">
              Voir tout
            </Link>
          )}
        </div>
        {!isHome && expanded && (
          <form onSubmit={handleCreate} className="card p-4 space-y-3">
            <Input label="Titre" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Input
              label={`Montant cible (${currencyLabel})`}
              type="number"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
            />
            <Input
              label="Date limite (optionnel)"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
            <Button type="submit" disabled={saving} className="w-full">
              Créer l'objectif
            </Button>
          </form>
        )}
        {listContent}
      </section>
    </ProFeature>
  )
}
