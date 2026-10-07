'use client'

import { useEffect, useRef, useState } from 'react'
import type { AdminCohort, AdminUserDetail } from '@/lib/api'

type PlanTier = 'free' | 'pro' | 'pro_plus' | 'business'

function fmtTime(value?: string | Date | null) {
  if (!value) return 'jamais'
  return new Date(value).toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function AdminPeek({
  title,
  count,
  people,
  loading,
  selectedId,
  detail,
  loadingDetail,
  acting,
  onClose,
  onBack,
  onPick,
  onMakeFree,
  onSetPlan,
  onResumeBilling,
  onSuspend,
  onUnsuspend,
  onDelete,
}: {
  title: string
  count: number
  people: AdminCohort['people']
  loading: boolean
  selectedId: string | null
  detail: AdminUserDetail | null
  loadingDetail: boolean
  acting?: string | null
  onClose: () => void
  onBack: () => void
  onPick: (id: string) => void
  onMakeFree?: () => void
  onSetPlan?: (tier: PlanTier, lifetime: boolean) => void
  onResumeBilling?: () => void
  onSuspend?: () => void
  onUnsuspend?: () => void
  onDelete?: () => void
}) {
  const showUser = !!selectedId
  const [on, setOn] = useState(false)
  const closing = useRef(false)

  useEffect(() => {
    const id = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => setOn(true))
    })
    return () => window.cancelAnimationFrame(id)
  }, [])

  const requestClose = () => {
    if (closing.current) return
    closing.current = true
    setOn(false)
    window.setTimeout(onClose, 420)
  }

  return (
    <div className={`ad-peek-root${on ? ' is-on' : ''}`}>
      <button type="button" className="ad-peek-mask" aria-label="Fermer" onClick={requestClose} />
      <aside className="ad-peek">
        <div className="ad-peek-bar">
          {showUser ? (
            <button type="button" onClick={onBack}>
              ← Liste
            </button>
          ) : (
            <span />
          )}
          <button type="button" onClick={requestClose}>
            Fermer
          </button>
        </div>

        {showUser ? (
          <div className="ad-peek-body">
            {loadingDetail ? <p className="text-sm text-[#8a829c]">Chargement du parcours…</p> : null}
            {!loadingDetail && detail ? (
              <UserSheet
                detail={detail}
                acting={acting}
                onMakeFree={onMakeFree}
                onSetPlan={onSetPlan}
                onResumeBilling={onResumeBilling}
                onSuspend={onSuspend}
                onUnsuspend={onUnsuspend}
                onDelete={onDelete}
              />
            ) : null}
          </div>
        ) : (
          <div className="ad-peek-body">
            <h2>{title}</h2>
            <p className="ad-card-sub">
              {count} {count > 1 ? 'personnes' : 'personne'} — cliquez pour le détail
            </p>
            {loading ? <p className="text-sm text-[#8a829c]">Chargement…</p> : null}
            <ul className="ad-people">
              {people.map((p) => (
                <li key={p.id}>
                  <button type="button" onClick={() => onPick(p.id)}>
                    <b>{p.name || 'Sans nom'}</b>
                    <span>{p.email}</span>
                    <em>
                      {p.hint || (p.emailVerified ? 'e-mail ok' : 'e-mail à confirmer')} ·{' '}
                      {fmtTime(p.lastLoginAt)}
                    </em>
                  </button>
                </li>
              ))}
              {!loading && !people.length ? (
                <li className="text-sm text-[#8a829c]">Personne dans cette liste.</li>
              ) : null}
            </ul>
          </div>
        )}
      </aside>
    </div>
  )
}

function planLabel(user: AdminUserDetail['user']) {
  if (user.planLabel) return user.planLabel
  if (user.suspendedAt) return 'Suspendu'
  if (user.lifetime) return 'Forfait à vie'
  if (user.plan === 'premium' && user.premiumSource === 'trial') return 'Essai Pro'
  if (user.plan === 'premium') return 'Premium'
  return 'Gratuit'
}

const TYPE_LABEL: Record<string, string> = {
  expense: 'dépenses',
  income: 'revenus',
  transfer: 'virements',
}

const PLANS: { id: PlanTier; label: string }[] = [
  { id: 'free', label: 'Gratuit' },
  { id: 'pro', label: 'Pro' },
  { id: 'pro_plus', label: 'Pro+' },
  { id: 'business', label: 'Business' },
]

function UserSheet({
  detail,
  acting,
  onMakeFree,
  onSetPlan,
  onResumeBilling,
  onSuspend,
  onUnsuspend,
  onDelete,
}: {
  detail: AdminUserDetail
  acting?: string | null
  onMakeFree?: () => void
  onSetPlan?: (tier: PlanTier, lifetime: boolean) => void
  onResumeBilling?: () => void
  onSuspend?: () => void
  onUnsuspend?: () => void
  onDelete?: () => void
}) {
  const currentTier: PlanTier =
    detail.user.subscriptionTier && detail.user.subscriptionTier !== 'free'
      ? detail.user.subscriptionTier
      : detail.user.plan === 'premium'
        ? 'pro'
        : 'free'
  const [tier, setTier] = useState<PlanTier>(currentTier)
  const [lifetime, setLifetime] = useState(Boolean(detail.user.lifetime))
  useEffect(() => {
    setTier(currentTier)
    setLifetime(Boolean(detail.user.lifetime))
  }, [detail.user._id, detail.user.plan, detail.user.subscriptionTier, detail.user.lifetime, currentTier])
  const errors = (detail.events || []).filter((e) => e.name === 'error')
  const isAdmin = detail.user.role === 'admin'
  const suspended = Boolean(detail.user.suspendedAt)
  const canManage = !isAdmin && (onMakeFree || onSuspend || onUnsuspend || onDelete)
  const busy = Boolean(acting)
  return (
    <div className="space-y-4 text-sm">
      <div>
        <p className="font-semibold text-[#111]">{detail.user.name || 'Sans nom'}</p>
        <p className="text-[#5b5270]">{detail.user.email}</p>
        <p className="mt-1 text-[12px] text-[#8a829c]">
          {planLabel(detail.user)}
          {detail.user.premiumUntil && !suspended
            ? ` jusqu’au ${new Date(detail.user.premiumUntil).toLocaleDateString('fr-FR')}`
            : ''}{' '}
          · {detail.user.emailVerified ? 'e-mail confirmé' : 'e-mail non confirmé'} · inscrit{' '}
          {fmtTime(detail.user.created_at)} · dernière session {fmtTime(detail.user.lastLoginAt)}
        </p>
      </div>
      {canManage ? (
        <div className="ad-user-actions">
          {onSetPlan ? (
            <div className="flex flex-col gap-2">
              <label className="text-[12px] text-[#5b5270]">
                Forfait
                <select
                  className="mt-1 w-full rounded-lg border border-black/10 bg-white px-2 py-2"
                  value={tier}
                  disabled={busy}
                  onChange={(e) => setTier(e.target.value as PlanTier)}
                >
                  {PLANS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex items-center gap-2 text-[12px] text-[#5b5270]">
                <input
                  type="checkbox"
                  checked={lifetime && tier !== 'free'}
                  disabled={busy || tier === 'free'}
                  onChange={(e) => setLifetime(e.target.checked)}
                />
                Forfait à vie (il garde ce palier, sans payer)
              </label>
              <button type="button" disabled={busy} onClick={() => onSetPlan(tier, lifetime && tier !== 'free')}>
                {acting === 'plan' ? 'Mise à jour…' : 'Appliquer le forfait'}
              </button>
            </div>
          ) : null}
          {detail.user.lifetime && onResumeBilling ? (
            <button type="button" disabled={busy} onClick={onResumeBilling}>
              {acting === 'resume' ? 'Retrait…' : 'Lui faire reprendre le paiement'}
            </button>
          ) : null}
          {detail.user.plan === 'premium' || detail.user.premiumUntil || detail.user.lifetime ? (
            <button type="button" disabled={busy} onClick={onMakeFree}>
              {acting === 'free' ? 'Passage en gratuit…' : 'Passer en gratuit'}
            </button>
          ) : null}
          {suspended ? (
            <button type="button" disabled={busy} onClick={onUnsuspend}>
              {acting === 'unsuspend' ? 'Réactivation…' : 'Réactiver le compte'}
            </button>
          ) : (
            <button type="button" disabled={busy} onClick={onSuspend}>
              {acting === 'suspend' ? 'Suspension…' : 'Suspendre'}
            </button>
          )}
          <button type="button" className="is-danger" disabled={busy} onClick={onDelete}>
            {acting === 'delete' ? 'Suppression…' : 'Supprimer le compte'}
          </button>
        </div>
      ) : null}
      <div className="ad-census">
        <span>
          En file <b>{detail.pendingByStatus?.pending || 0}</b>
        </span>
        <span>
          Validées <b>{detail.pendingByStatus?.validated || 0}</b>
        </span>
        <span>
          Ignorées <b>{detail.pendingByStatus?.rejected || 0}</b>
        </span>
      </div>
      {errors.length ? (
        <div>
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-[#b45309]">
            Erreurs récentes
          </p>
          <ul className="max-h-28 space-y-1 overflow-y-auto text-[12px]">
            {errors.slice(0, 8).map((e, i) => (
              <li key={`${e.at}-${i}`}>
                {e.screen || 'app'} · {String(e.props?.message || e.name)} · {fmtTime(e.at)}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <div className="ad-census">
        <span>
          Catégories <b>{detail.categoriesCount}</b>
        </span>
        <span>
          Poches <b>{detail.walletsCount}</b>
        </span>
        <span>
          Opérations <b>{Object.values(detail.transactionsByType || {}).reduce((s, n) => s + n, 0)}</b>
        </span>
      </div>
      <p className="text-[12px] text-[#5b5270]">
        {(['expense', 'income', 'transfer'] as const)
          .map((key) => `${detail.transactionsByType?.[key] || 0} ${TYPE_LABEL[key]}`)
          .join(' · ')}
      </p>
      <div>
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-[#8a829c]">
          Parcours (dernières actions)
        </p>
        <ul className="max-h-52 space-y-1 overflow-y-auto text-[12px]">
          {(detail.events || []).map((e, i) => (
            <li key={`${e.name}-${i}`} className="flex justify-between gap-2">
              <span>
                {e.name}
                {e.screen ? ` · ${e.screen}` : ''}
                {e.props?.element ? ` · ${e.props.element}` : ''}
              </span>
              <span className="shrink-0 text-[#8a829c]">{fmtTime(e.at)}</span>
            </li>
          ))}
          {!detail.events?.length ? (
            <li className="text-[#8a829c]">Pas encore d’action enregistrée.</li>
          ) : null}
        </ul>
      </div>
      <div>
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-[#8a829c]">
          Dernières opérations
        </p>
        <ul className="max-h-36 space-y-1 overflow-y-auto text-[12px]">
          {detail.transactions.slice(0, 8).map((t) => (
            <li key={t._id} className="flex justify-between gap-2">
              <span>{TYPE_LABEL[t.type] || t.type}</span>
              <span className="shrink-0 text-[#8a829c]">{fmtTime(t.date)}</span>
            </li>
          ))}
          {!detail.transactions.length ? <li className="text-[#8a829c]">Aucune opération.</li> : null}
        </ul>
      </div>
    </div>
  )
}
