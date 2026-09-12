'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import ProFeature from '@/components/ProFeature'
import LoadingSpinner from '@/components/LoadingSpinner'
import { recurringApi, RecurringTransaction } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import { useCurrency } from '@/contexts/CurrencyContext'
import { Check, Play, X } from 'lucide-react'
import Button from '@/components/Button'

interface RecurringSectionProps {
  isPremium: boolean
  onApiError: (err: unknown, msg?: string) => boolean
}

export default function RecurringSection({ isPremium, onApiError }: RecurringSectionProps) {
  const { formatAmount } = useCurrency()
  const [items, setItems] = useState<RecurringTransaction[]>([])
  const [suggestions, setSuggestions] = useState<RecurringTransaction[]>([])
  const [loading, setLoading] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)

  useEffect(() => {
    if (!isPremium) return
    load()
  }, [isPremium])

  const load = async () => {
    try {
      setLoading(true)
      const [active, suggested] = await Promise.all([
        recurringApi.getAll('active'),
        recurringApi.getAll('suggested'),
      ])
      setItems(active)
      setSuggestions(suggested)
    } catch (e) {
      onApiError(e, 'Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }

  const runNow = async (id: string) => {
    if (busyId) return
    try {
      setBusyId(id)
      await recurringApi.run(id)
      toast.success('Transaction créée')
      load()
    } catch (e) {
      onApiError(e, 'Erreur')
    } finally {
      setBusyId(null)
    }
  }

  const accept = async (id: string) => {
    if (busyId) return
    try {
      setBusyId(id)
      await recurringApi.accept(id)
      toast.success('Récurrence activée')
      load()
    } catch (e) {
      onApiError(e, 'Erreur')
    } finally {
      setBusyId(null)
    }
  }

  const dismiss = async (id: string) => {
    if (busyId) return
    try {
      setBusyId(id)
      await recurringApi.dismiss(id)
      toast.success('Suggestion ignorée')
      load()
    } catch (e) {
      onApiError(e, 'Erreur')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <ProFeature
      isPremium={isPremium}
      title="Transactions récurrentes"
      description="Loyer, salaire, abonnements — exécutez-les en un clic"
    >
      <section className="space-y-3">
        <h3 className="section-title px-1">Récurrences</h3>
        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            {suggestions.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-amber-800 px-1">
                  Suggestions IA à valider
                </p>
                <ul className="space-y-2">
                  {suggestions.map((r) => (
                    <li key={r._id} className="card p-4 space-y-3 border border-amber-100 bg-amber-50/40">
                      <div>
                        <p className="font-medium text-gray-900">{r.description || r.type}</p>
                        <p className="text-primary-600 font-semibold">
                          {formatAmount(r.amount)}
                          <span className="text-xs font-normal text-gray-500 ml-2">
                            / {r.frequency === 'weekly' ? 'semaine' : 'mois'}
                          </span>
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          className="flex-1"
                          loading={busyId === r._id}
                          onClick={() => accept(r._id)}
                        >
                          <Check size={16} className="mr-1.5" /> Activer
                        </Button>
                        <button
                          type="button"
                          onClick={() => dismiss(r._id)}
                          disabled={!!busyId}
                          className="px-3 py-2 rounded-xl border border-gray-200 text-gray-500 touch-manipulation disabled:opacity-50"
                          aria-label="Ignorer"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {items.length === 0 && suggestions.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-2">
                Aucune récurrence configurée
              </p>
            ) : items.length > 0 ? (
              <ul className="space-y-2">
                {items.map((r) => (
                  <li key={r._id} className="card p-4 flex items-center gap-3">
                    <div className="flex-1">
                      <p className="font-medium capitalize">{r.description || r.type}</p>
                      <p className="text-primary-600 font-semibold">
                        {formatAmount(r.amount)}
                      </p>
                      <p className="text-xs text-gray-500">
                        Prochaine : {formatDate(r.next_run_date)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => runNow(r._id)}
                      disabled={!!busyId}
                      aria-busy={busyId === r._id || undefined}
                      className="relative p-2 rounded-full bg-primary-50 text-primary-600 touch-manipulation disabled:opacity-50"
                      aria-label="Exécuter maintenant"
                    >
                      {busyId === r._id && (
                        <span
                          className="pointer-events-none absolute inset-x-1 top-0.5 h-0.5 overflow-hidden rounded-full bg-primary-600/15"
                          aria-hidden
                        >
                          <span className="loading-bar-indeterminate block h-full w-1/2 rounded-full bg-primary-600" />
                        </span>
                      )}
                      <Play size={20} />
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </>
        )}
      </section>
    </ProFeature>
  )
}
