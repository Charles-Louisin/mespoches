'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { AuthGuard } from '@/components/AuthGuard'
import LoadingBar from '@/components/LoadingBar'
import { adminPaymentsApi, authApi, type AdminPaymentsData } from '@/lib/api'
import { hydrateAuthSession } from '@/lib/auth'

const TIER: Record<string, string> = { pro: 'Pro', pro_plus: 'Pro+', business: 'Business' }
const STATUS: Record<string, { label: string; cls: string }> = {
  completed: { label: 'Payé', cls: 'bg-emerald-50 text-emerald-700' },
  pending: { label: 'En attente', cls: 'bg-amber-50 text-amber-700' },
  failed: { label: 'Échoué', cls: 'bg-red-50 text-red-700' },
}
const FILTERS = [
  ['', 'Tous'],
  ['completed', 'Payés'],
  ['pending', 'En attente'],
  ['failed', 'Échoués'],
] as const

const fcfa = (n: number) => `${n.toLocaleString('fr-FR').replace(/ /g, ' ')} FCFA`
const when = (d: string) =>
  new Date(d).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })

/** Paiements d'abonnement reçus via SasPay. */
export default function AdminPaymentsPage() {
  const router = useRouter()
  const [days, setDays] = useState(30)
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [data, setData] = useState<AdminPaymentsData | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      await hydrateAuthSession()
      const me = await authApi.me()
      if (me.role !== 'admin') {
        router.replace('/')
        return
      }
      setData(await adminPaymentsApi.list({ days, status, page }))
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Chargement impossible')
    } finally {
      setLoading(false)
    }
  }, [router, days, status, page])

  useEffect(() => {
    void load()
  }, [load])

  const s = data?.summary
  const total = data?.meta.total ?? 0

  return (
    <AuthGuard>
      {loading ? <LoadingBar /> : null}
      <main className="mx-auto min-h-dvh max-w-5xl bg-white px-4 py-8 text-ink sm:px-6">
        <Link href="/admin" className="text-sm font-medium text-primary-600 hover:underline">
          ← Console
        </Link>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Paiements</h1>
            <p className="mt-1 text-[15px] text-ink-soft">Abonnements payés dans l’app via SasPay.</p>
          </div>
          <div className="flex rounded-full border border-black/10 p-1 text-sm" role="group" aria-label="Période">
            {[7, 30, 90, 365].map((n) => (
              <button
                key={n}
                type="button"
                aria-pressed={days === n}
                onClick={() => {
                  setDays(n)
                  setPage(1)
                }}
                className={`rounded-full px-3 py-1.5 font-medium ${days === n ? 'bg-ink text-white' : 'text-ink-soft hover:text-ink'}`}
              >
                {n === 365 ? '1 an' : `${n} j`}
              </button>
            ))}
          </div>
        </div>

        <section className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat label="Encaissé" value={s ? fcfa(s.revenue) : '—'} strong />
          <Stat label="Payés" value={s ? String(s.completed) : '—'} />
          <Stat label="En attente" value={s ? String(s.pending) : '—'} />
          <Stat label="Échoués" value={s ? String(s.failed) : '—'} />
        </section>

        {s && s.byTier.length ? (
          <p className="mt-3 text-sm text-ink-soft">
            {s.byTier
              .map((t) => `${TIER[t.tier] ?? t.tier} : ${t.count} (${fcfa(t.amount)})`)
              .join(' · ')}
          </p>
        ) : null}

        <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label="Filtrer par statut">
          {FILTERS.map(([v, label]) => (
            <button
              key={v || 'all'}
              type="button"
              aria-pressed={status === v}
              onClick={() => {
                setStatus(v)
                setPage(1)
              }}
              className={`h-9 rounded-full border px-4 text-sm font-medium ${
                status === v ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-black/10 text-ink-soft hover:text-ink'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {data && data.payments.length === 0 ? (
          <p className="mt-6 rounded-2xl border border-dashed border-black/15 px-5 py-10 text-center text-sm text-ink-soft">
            Aucun paiement sur cette période.
          </p>
        ) : null}

        {data && data.payments.length > 0 ? (
          <div className="mt-4 overflow-x-auto rounded-2xl border border-black/10">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-surface text-xs uppercase tracking-wide text-ink-mute">
                <tr>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Client</th>
                  <th className="px-4 py-3 font-semibold">Forfait</th>
                  <th className="px-4 py-3 text-right font-semibold">Montant</th>
                  <th className="px-4 py-3 font-semibold">Statut</th>
                  <th className="px-4 py-3 font-semibold">Référence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {data.payments.map((p) => {
                  // Tentative refusée par SasPay alors que la session reste ouverte (le client peut réessayer).
                  const attemptFailed =
                    p.status === 'pending' && /^(FAILED|CANCELLED)$/i.test(p.saspay_status || '')
                  const st = attemptFailed
                    ? { label: 'Échoué · réessai possible', cls: STATUS.failed.cls }
                    : STATUS[p.status] ?? { label: p.status, cls: 'bg-surface text-ink-soft' }
                  return (
                    <tr key={p._id} className="align-top">
                      <td className="whitespace-nowrap px-4 py-3 text-ink-soft">{when(p.created_at)}</td>
                      <td className="px-4 py-3">
                        {p.user ? (
                          <>
                            <span className="block font-medium">{p.user.name || '—'}</span>
                            <span className="block text-ink-mute">{p.user.email}</span>
                          </>
                        ) : (
                          <span className="text-ink-mute">Compte supprimé</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        {TIER[p.tier] ?? p.tier} · {p.period === 'yearly' ? 'annuel' : 'mensuel'}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right font-semibold tabular-nums">
                        {fcfa(p.amount)}
                        {p.saspay_charged ? (
                          <span className="block text-xs font-normal text-ink-mute">
                            débité {p.saspay_charged} {p.currency}
                          </span>
                        ) : null}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${st.cls}`}>{st.label}</span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-ink-mute">
                        {p.transaction_id}
                        {p.saspay_transaction_id ? <span className="block">{p.saspay_transaction_id}</span> : null}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : null}

        {data && (page > 1 || data.meta.hasMore) ? (
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-ink-mute">
              {total} paiement{total > 1 ? 's' : ''}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="h-9 rounded-full border border-black/10 px-4 font-medium disabled:opacity-40"
              >
                Précédents
              </button>
              <button
                type="button"
                disabled={!data.meta.hasMore}
                onClick={() => setPage((p) => p + 1)}
                className="h-9 rounded-full border border-black/10 px-4 font-medium disabled:opacity-40"
              >
                Suivants
              </button>
            </div>
          </div>
        ) : null}
      </main>
    </AuthGuard>
  )
}

function Stat({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`rounded-2xl border p-4 ${strong ? 'border-primary-600/20 bg-primary-50' : 'border-black/10'}`}>
      <p className="text-xs font-medium text-ink-mute">{label}</p>
      <p className={`mt-1 font-bold tabular-nums ${strong ? 'text-lg text-primary-700' : 'text-xl'}`}>{value}</p>
    </div>
  )
}
