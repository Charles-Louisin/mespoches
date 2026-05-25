'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import ProFeature from '@/components/ProFeature'
import LoadingSpinner from '@/components/LoadingSpinner'
import Button from '@/components/Button'
import Input from '@/components/Input'
import Select from '@/components/Select'
import { savingsGoalApi, walletApi, SavingsGoal, Wallet } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'

interface SavingsGoalsSectionProps {
  isPremium: boolean
  onApiError: (err: unknown, msg?: string) => boolean
}

export default function SavingsGoalsSection({
  isPremium,
  onApiError,
}: SavingsGoalsSectionProps) {
  const [goals, setGoals] = useState<SavingsGoal[]>([])
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState('')
  const [target, setTarget] = useState('')
  const [walletId, setWalletId] = useState('')
  const [saving, setSaving] = useState(false)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    if (!isPremium) return
    load()
  }, [isPremium])

  const load = async () => {
    try {
      setLoading(true)
      const [g, w] = await Promise.all([
        savingsGoalApi.getAll(),
        walletApi.getAll(),
      ])
      setGoals(g)
      setWallets(w)
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
        wallet_id: walletId || null,
      })
      toast.success('Objectif créé')
      setTitle('')
      setTarget('')
      setWalletId('')
      setExpanded(false)
      load()
    } catch (err) {
      onApiError(err, 'Erreur')
    } finally {
      setSaving(false)
    }
  }

  return (
    <ProFeature
      isPremium={isPremium}
      title="Objectifs d'épargne"
      description="Définissez un montant cible et suivez la progression"
    >
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="section-title">Objectifs d&apos;épargne</h3>
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="text-sm text-primary-600 font-medium"
          >
            {expanded ? 'Annuler' : '+ Ajouter'}
          </button>
        </div>
        {expanded && (
          <form onSubmit={handleCreate} className="card p-4 space-y-3">
            <Input label="Titre" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Input
              label="Montant cible (XAF)"
              type="number"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
            />
            <Select
              label="Poche liée (optionnel)"
              value={walletId}
              onChange={(e) => setWalletId(e.target.value)}
              options={[
                { value: '', label: 'Aucune' },
                ...wallets.map((w) => ({ value: w._id, label: w.name })),
              ]}
            />
            <Button type="submit" disabled={saving} className="w-full">
              Créer
            </Button>
          </form>
        )}
        {loading ? (
          <LoadingSpinner />
        ) : goals.length === 0 ? (
          <p className="text-sm text-gray-500 text-center">Aucun objectif</p>
        ) : (
          <ul className="space-y-2">
            {goals.map((g) => (
              <li key={g._id} className="card p-4">
                <p className="font-semibold">{g.title}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {formatCurrency(g.current_amount ?? 0)} / {formatCurrency(g.target_amount)}
                </p>
                <div className="h-2 bg-gray-100 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-primary-500 rounded-full"
                    style={{ width: `${g.progress_percent ?? 0}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </ProFeature>
  )
}
