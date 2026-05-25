'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import ProFeature from '@/components/ProFeature'
import LoadingSpinner from '@/components/LoadingSpinner'
import { recurringApi, RecurringTransaction } from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Play } from 'lucide-react'

interface RecurringSectionProps {
  isPremium: boolean
  onApiError: (err: unknown, msg?: string) => boolean
}

export default function RecurringSection({ isPremium, onApiError }: RecurringSectionProps) {
  const [items, setItems] = useState<RecurringTransaction[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isPremium) return
    load()
  }, [isPremium])

  const load = async () => {
    try {
      setLoading(true)
      setItems(await recurringApi.getAll())
    } catch (e) {
      onApiError(e, 'Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }

  const runNow = async (id: string) => {
    try {
      await recurringApi.run(id)
      toast.success('Transaction créée')
      load()
    } catch (e) {
      onApiError(e, 'Erreur')
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
        ) : items.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-2">
            Aucune récurrence configurée
          </p>
        ) : (
          <ul className="space-y-2">
            {items.map((r) => (
              <li key={r._id} className="card p-4 flex items-center gap-3">
                <div className="flex-1">
                  <p className="font-medium capitalize">{r.type}</p>
                  <p className="text-primary-600 font-semibold">
                    {formatCurrency(r.amount)}
                  </p>
                  <p className="text-xs text-gray-500">
                    Prochaine : {formatDate(r.next_run_date)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => runNow(r._id)}
                  className="p-2 rounded-full bg-primary-50 text-primary-600 touch-manipulation"
                  aria-label="Exécuter maintenant"
                >
                  <Play size={20} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </ProFeature>
  )
}
