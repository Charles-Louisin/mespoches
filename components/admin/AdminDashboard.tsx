'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { logout } from '@/lib/auth'
import { formatCurrency } from '@/lib/utils'
import {
  adminApi,
  type AdminCohort,
  type AdminInsights,
  type AdminTelemetry,
  type AdminUserDetail,
  type AdminUserSummary,
} from '@/lib/api'
import { BarList, Donut, LineChart } from './AdminCharts'
import AdminPeek from './AdminPeek'
import AdminScene from './AdminScene'

const SOURCE_LABEL: Record<string, string> = {
  sms: 'SMS',
  notification: 'Notifications',
  ai_scan: 'Scan',
  voice: 'Voix',
  manual: 'Manuel',
}

const OPERATOR_LABEL: Record<string, string> = {
  orange: 'Orange Money',
  mtn: 'MTN MoMo',
  unknown: 'Autre / inconnu',
}

function people(n: number) {
  return n <= 1 ? `${n} personne` : `${n} personnes`
}

function compact(n: number) {
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)} M`
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(1)} k`
  return String(Math.round(n))
}

function fmtTime(value?: string | Date) {
  if (!value) return '—'
  return new Date(value).toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function AdminDashboard({
  insights,
  telemetry,
  users,
  days,
  onDays,
  onRefreshUsers,
}: {
  insights: AdminInsights
  telemetry: AdminTelemetry
  users: AdminUserSummary[]
  days: number
  onDays: (n: number) => void
  onRefreshUsers?: () => Promise<void> | void
}) {
  const router = useRouter()
  const [tab, setTab] = useState<'vue' | 'users' | 'events'>('vue')
  const [peekKey, setPeekKey] = useState<string | null>(null)
  const [peekTitle, setPeekTitle] = useState('')
  const [cohort, setCohort] = useState<AdminCohort | null>(null)
  const [loadingCohort, setLoadingCohort] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [detail, setDetail] = useState<AdminUserDetail | null>(null)
  const [loadingUser, setLoadingUser] = useState(false)
  const [q, setQ] = useState('')
  const [acting, setActing] = useState<string | null>(null)

  const refreshDetail = async (id: string) => {
    const next = await adminApi.getUserById(id)
    setDetail(next)
    await onRefreshUsers?.()
  }

  const runUserAction = async (
    kind: 'free' | 'suspend' | 'unsuspend' | 'delete',
    confirmText: string,
    fn: () => Promise<void>
  ) => {
    if (!selectedId || acting) return
    if (!window.confirm(confirmText)) return
    setActing(kind)
    try {
      await fn()
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Action impossible')
    } finally {
      setActing(null)
    }
  }

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return users
    return users.filter(
      (u) =>
        u.email.toLowerCase().includes(s) ||
        (u.name || '').toLowerCase().includes(s)
    )
  }, [users, q])

  const openCohort = (key: string, title?: string) => {
    if (!key) return
    setPeekKey(key)
    setPeekTitle(title || '')
    setSelectedId(null)
    setDetail(null)
  }

  const openUser = (id: string) => {
    setSelectedId(id)
    if (!peekKey) {
      setPeekKey('__user')
      setPeekTitle('Fiche')
    }
  }

  useEffect(() => {
    if (!peekKey || peekKey === '__user') return
    let cancel = false
    setLoadingCohort(true)
    void adminApi
      .getCohort(peekKey, days)
      .then((d) => {
        if (cancel) return
        setCohort(d)
        setPeekTitle(d.title)
        setLoadingCohort(false)
      })
      .catch(() => {
        if (!cancel) setLoadingCohort(false)
      })
    return () => {
      cancel = true
    }
  }, [peekKey, days])

  useEffect(() => {
    if (!selectedId) return
    let cancel = false
    setLoadingUser(true)
    void adminApi
      .getUserById(selectedId)
      .then((d) => {
        if (!cancel) {
          setDetail(d)
          setLoadingUser(false)
        }
      })
      .catch(() => {
        if (!cancel) setLoadingUser(false)
      })
    return () => {
      cancel = true
    }
  }, [selectedId])

  const k = insights.kpis
  const journey = insights.journey || []
  const problems = insights.problems || []
  const wins = insights.wins || []
  const captureSlices = [
    { label: 'En attente', value: insights.capture.pending, color: '#f59e0b' },
    { label: 'Validées', value: insights.capture.validated, color: '#2563eb' },
    { label: 'Ignorées', value: insights.capture.rejected, color: '#94a3b8' },
  ]

  return (
    <div className="ad-shell">
      <aside className="ad-side">
        <p className="ad-brand">MES POCHES</p>
        <p className="ad-brand-sub">Console interne</p>
        <nav className="ad-nav">
          {(
            [
              ['vue', 'Vue d’ensemble'],
              ['users', 'Toutes les personnes'],
              ['events', 'Clics & erreurs'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={tab === id ? 'is-on' : ''}
              onClick={() => setTab(id)}
            >
              {label}
            </button>
          ))}
        </nav>
        <div className="ad-periods">
          {[7, 30, 90].map((n) => (
            <button
              key={n}
              type="button"
              className={days === n ? 'is-on' : ''}
              onClick={() => onDays(n)}
            >
              {n} j
            </button>
          ))}
        </div>
        <button type="button" className="ad-side-out" onClick={() => router.push('/')}>
          Site public
        </button>
        <button type="button" className="ad-side-out is-red" onClick={() => logout()}>
          Déconnexion
        </button>
      </aside>

      <div className="ad-main">
        {tab === 'vue' ? (
          <>
            <header className="ad-hero">
              <div>
                <p className="ad-kicker">Pilotage · {insights.periodDays} jours</p>
                <h1>Qui fait quoi</h1>
                <p>
                  Cliquez un chiffre pour voir les personnes, puis une fiche pour suivre son
                  parcours — où ça bloque, où ça casse, où ça marche.
                </p>
              </div>
              <AdminScene />
            </header>

            <section className="ad-census-hero">
              <p className="ad-census-kicker">Les comptes</p>
              <div className="ad-census-grid">
                <CensusHit
                  label="Inscrits"
                  value={insights.census.registered}
                  hint="tous les comptes"
                  onClick={() => openCohort('registered', 'Tous les inscrits')}
                />
                <CensusHit
                  label="E-mail confirmé"
                  value={insights.census.verified}
                  hint="peuvent se connecter"
                  onClick={() => openCohort('verified')}
                />
                <CensusHit
                  label="E-mail non confirmé"
                  value={insights.census.unverified}
                  hint="bloqués à l’inscription"
                  warn
                  onClick={() => openCohort('unverified')}
                />
                <CensusHit
                  label="Comptes Google"
                  value={insights.census.googleAuth}
                  hint="connexion Google"
                  onClick={() => openCohort('google')}
                />
                <CensusHit
                  label={`Nouveaux ${insights.periodDays} j`}
                  value={insights.census.signupsPeriod}
                  hint="inscriptions récentes"
                  onClick={() => openCohort('signups_period')}
                />
              </div>
            </section>

            <section className="ad-kpis">
              <Kpi
                label="Connectés sur la période"
                hint={people(k.mau)}
                value={compact(k.mau)}
                onClick={() => openCohort('mau')}
              />
              <Kpi
                label="Connectés cette semaine"
                hint={`${k.stickiness} % des connectés période`}
                value={compact(k.wau)}
                onClick={() => openCohort('wau')}
              />
              <Kpi
                label="Inscrits cette semaine"
                hint={people(k.signups7d)}
                value={compact(k.signups7d)}
                onClick={() => openCohort('signups_7d')}
              />
              <Kpi
                label="Premium payants"
                hint={`${people(k.trialActive)} en essai`}
                value={compact(k.paidPremium)}
                onClick={() => openCohort('paid_premium')}
              />
              <Kpi
                label="Captures validées"
                hint={`${k.validationRate} % des captures tranchées`}
                value={`${k.validationRate} %`}
                onClick={() => openCohort('validators')}
              />
              <Kpi
                label="Ont dépensé"
                hint={formatCurrency(k.expenseVolume30d)}
                value={people(insights.finance.expenseUsers || 0)}
                onClick={() => openCohort('expense_users')}
              />
              <Kpi
                label="Erreurs dans l’app"
                hint={`${telemetry.errors || 0} messages`}
                value={people(telemetry.errorUsers || 0)}
                onClick={() => openCohort('errors')}
              />
            </section>

            <section className="ad-card ad-funnel-card">
              <h2>Où les gens s’arrêtent</h2>
              <p className="ad-card-sub">
                Chaque étape = des personnes. « Bloqués » = ils ont fait l’étape d’avant, pas
                celle-ci.
              </p>
              <ol className="ad-journey">
                {journey.map((step) => (
                  <li key={step.key}>
                    <button type="button" className="ad-journey-ok" onClick={() => openCohort(step.key)}>
                      <span>{step.title}</span>
                      <b>{people(step.people)}</b>
                    </button>
                    {step.stuck > 0 && step.stuckKey ? (
                      <button
                        type="button"
                        className="ad-journey-drop"
                        onClick={() => openCohort(step.stuckKey)}
                      >
                        {people(step.stuck)} bloquées ici
                      </button>
                    ) : (
                      <span className="ad-journey-drop is-void">—</span>
                    )}
                  </li>
                ))}
              </ol>
            </section>

            <section className="ad-grid-2">
              <article className="ad-card">
                <h2>Ce qui coince</h2>
                <p className="ad-card-sub">Problèmes à traiter, personne par personne</p>
                <ul className="ad-issue-list">
                  {problems.map((p) => (
                    <li key={p.key}>
                      <button type="button" onClick={() => openCohort(p.key)}>
                        <span>{p.title}</span>
                        <b>{people(p.people)}</b>
                      </button>
                    </li>
                  ))}
                  {!problems.length ? <li className="text-sm text-[#8a829c]">Rien de bloquant.</li> : null}
                </ul>
              </article>
              <article className="ad-card">
                <h2>Ce qui marche</h2>
                <p className="ad-card-sub">Les parcours qui aboutissent</p>
                <ul className="ad-issue-list is-ok">
                  {wins.map((p) => (
                    <li key={p.key}>
                      <button type="button" onClick={() => openCohort(p.key)}>
                        <span>{p.title}</span>
                        <b>{people(p.people)}</b>
                      </button>
                    </li>
                  ))}
                </ul>
              </article>
            </section>

            <section className="ad-grid-2">
              <article className="ad-card">
                <h2>Nouveaux comptes, jour par jour</h2>
                <p className="ad-card-sub">Pas les connexions — uniquement les inscriptions</p>
                <div className="h-44">
                  <LineChart data={insights.series.signups} keys={['count']} colors={['#2563eb']} />
                </div>
              </article>
              <article className="ad-card">
                <h2>Qui ouvre l’app</h2>
                <p className="ad-card-sub">Jours avec au moins une connexion</p>
                <div className="h-44">
                  <LineChart data={insights.series.dau} keys={['activeUsers']} colors={['#7c3aed']} />
                </div>
              </article>
            </section>

            <section className="ad-grid-2">
              <article className="ad-card">
                <h2>Argent qui circule</h2>
                <p className="ad-card-sub">Volumes, et combien de personnes ça concerne</p>
                <div className="mb-4 flex flex-wrap gap-6 text-sm">
                  <button type="button" className="ad-text-hit" onClick={() => openCohort('income_users')}>
                    Revenus · {people(insights.finance.incomeUsers || 0)} ·{' '}
                    {formatCurrency(insights.finance.incomeVolume)}
                  </button>
                  <button type="button" className="ad-text-hit" onClick={() => openCohort('expense_users')}>
                    Dépenses · {people(insights.finance.expenseUsers || 0)} ·{' '}
                    {formatCurrency(insights.finance.expenseVolume)}
                  </button>
                  <span>
                    Transferts <b>{insights.finance.transferCount}</b>
                  </span>
                </div>
                <div className="h-44">
                  <LineChart
                    data={insights.series.volume}
                    keys={['income', 'expense']}
                    colors={['#059669', '#dc2626']}
                  />
                </div>
              </article>
              <article className="ad-card">
                <h2>D’où viennent les captures</h2>
                <p className="ad-card-sub">
                  {people(insights.capture.pendingUsers || 0)} ont encore quelque chose en file
                </p>
                <Donut slices={captureSlices} />
                <div className="mt-5">
                  <BarList
                    items={insights.capture.bySource.map((s) => ({
                      label: SOURCE_LABEL[s.source] || s.source,
                      value: s.count,
                    }))}
                    color="#2563eb"
                    onPick={() => openCohort('pending_now')}
                  />
                </div>
                <button type="button" className="ad-text-hit mt-3" onClick={() => openCohort('capture_stuck')}>
                  Voir ceux qui n’ont jamais validé →
                </button>
              </article>
            </section>

            <section className="ad-grid-3">
              <article className="ad-card">
                <h2>Catégories les plus utilisées</h2>
                <BarList
                  items={insights.finance.topCategories.map((c) => ({
                    label: `${c.name} (${c.type === 'income' ? 'revenu' : 'dépense'})`,
                    value: Math.round(c.volume),
                  }))}
                  color="#1d4ed8"
                />
              </article>
              <article className="ad-card">
                <h2>Poches ouvertes</h2>
                <p className="ad-card-sub">
                  <button type="button" className="ad-text-hit" onClick={() => openCohort('has_wallet')}>
                    {insights.finance.liveWallets} poches · {people((journey.find((s) => s.key === 'has_wallet')?.people) || 0)}
                  </button>
                </p>
                <BarList
                  items={insights.finance.walletsByCurrency.map((w) => ({
                    label: `${w.currency} · ${formatCurrency(w.balance)}`,
                    value: w.count,
                  }))}
                  color="#0f766e"
                />
              </article>
              <article className="ad-card">
                <h2>Opérateurs Mobile Money</h2>
                <BarList
                  items={insights.capture.byOperator.map((s) => ({
                    label: OPERATOR_LABEL[s.operator] || s.operator,
                    value: s.count,
                  }))}
                  color="#b45309"
                  onPick={() => openCohort('capturers')}
                />
              </article>
            </section>
          </>
        ) : null}

        {tab === 'users' ? (
          <section className="ad-card">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2>Toutes les personnes</h2>
                <p className="ad-card-sub">Cliquez une ligne pour le parcours complet</p>
              </div>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Rechercher un nom ou un e-mail…"
                className="ad-search"
              />
            </div>
            <div className="ad-table-wrap">
              <table className="ad-table">
                <thead>
                  <tr>
                    <th>Compte</th>
                    <th>Plan</th>
                    <th>Poches</th>
                    <th>Opérations</th>
                    <th>Dernière session</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u) => (
                    <tr
                      key={u.id}
                      className={selectedId === u.id ? 'is-on' : ''}
                      onClick={() => openUser(u.id)}
                    >
                      <td>
                        <div className="font-semibold">{u.name || '—'}</div>
                        <div className="text-[11px] text-[#8a829c]">{u.email}</div>
                      </td>
                      <td>
                        {u.suspended
                          ? 'Suspendu'
                          : u.plan === 'premium'
                            ? u.premiumSource === 'trial'
                              ? 'Essai'
                              : 'Premium'
                            : 'Gratuit'}
                        {!u.emailVerified ? (
                          <div className="text-[10px] text-[#b45309]">e-mail à confirmer</div>
                        ) : null}
                      </td>
                      <td>{u.walletsCount}</td>
                      <td>{u.transactionsCount}</td>
                      <td className="text-[12px]">{fmtTime(u.lastLoginAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}

        {tab === 'events' ? (
          <>
            <header className="ad-hero ad-hero-sm">
              <div>
                <p className="ad-kicker">Ce que font les gens dans l’app</p>
                <h1>Clics, écrans, erreurs</h1>
                <p>
                  {compact(telemetry.events)} actions · {people(telemetry.uniqueUsers)} ·{' '}
                  {people(telemetry.errorUsers || 0)} ont vu une erreur.
                </p>
              </div>
            </header>
            <section className="ad-grid-2">
              <article className="ad-card">
                <h2>Volume d’actions</h2>
                <div className="h-44">
                  <LineChart data={telemetry.byDay} keys={['count']} colors={['#2563eb']} />
                </div>
              </article>
              <article className="ad-card">
                <h2>Écrans visités</h2>
                <p className="ad-card-sub">Cliquez pour voir qui y est passé</p>
                <BarList
                  items={telemetry.byScreen.map((s) => ({ label: s.screen || 'inconnu', value: s.count }))}
                  color="#7c3aed"
                  onPick={(label) => openCohort(`screen:${label.replace(/[^a-z0-9_]/gi, '').toLowerCase()}`)}
                />
              </article>
            </section>
            <section className="ad-grid-3">
              <article className="ad-card">
                <h2>Actions les plus fréquentes</h2>
                <BarList
                  items={telemetry.byName.map((s) => ({ label: s.name, value: s.count }))}
                  onPick={(label) => openCohort(`event:${label}`)}
                />
              </article>
              <article className="ad-card">
                <h2>Boutons tapés</h2>
                <BarList
                  items={telemetry.byElement.map((s) => ({ label: s.element, value: s.count }))}
                  color="#0f766e"
                />
              </article>
              <article className="ad-card">
                <h2>Téléphones</h2>
                <BarList
                  items={telemetry.byPlatform.map((s) => ({ label: s.platform || '—', value: s.count }))}
                  color="#b45309"
                />
                <button type="button" className="ad-text-hit mt-4" onClick={() => openCohort('errors')}>
                  {people(telemetry.errorUsers || 0)} ont eu une erreur →
                </button>
              </article>
            </section>
            <section className="ad-card">
              <h2>Flux en direct</h2>
              <p className="ad-card-sub">Cliquez un nom pour ouvrir la fiche</p>
              <ul className="max-h-80 space-y-2 overflow-y-auto text-[13px]">
                {telemetry.recent.map((e, i) => (
                  <li key={`${e.at}-${i}`} className="flex justify-between gap-3 border-b border-black/[0.04] pb-2">
                    <button
                      type="button"
                      className="ad-text-hit text-left"
                      onClick={() => (e.userId ? openUser(e.userId) : undefined)}
                    >
                      <b>{e.name}</b>
                      <span className="text-[#8a829c]">
                        {' '}
                        · {e.screen || '—'} · {e.platform} · {e.user}
                      </span>
                    </button>
                    <span className="shrink-0 text-[11px] text-[#8a829c]">{fmtTime(e.at)}</span>
                  </li>
                ))}
                {!telemetry.recent.length ? (
                  <li className="text-[#8a829c]">Aucune action pour l’instant. Ouvrez l’app connectée.</li>
                ) : null}
              </ul>
            </section>
          </>
        ) : null}
      </div>

      {peekKey ? (
        <AdminPeek
          title={peekTitle || 'Personnes'}
          count={cohort?.count || 0}
          people={cohort?.people || []}
          loading={loadingCohort}
          selectedId={selectedId}
          detail={detail}
          loadingDetail={loadingUser}
          onClose={() => {
            setPeekKey(null)
            setSelectedId(null)
            setCohort(null)
          }}
          onBack={() => {
            setSelectedId(null)
            setDetail(null)
          }}
          onPick={openUser}
          acting={acting}
          onMakeFree={() =>
            void runUserAction(
              'free',
              'Annuler l’essai ou l’abonnement et passer ce compte en gratuit ?',
              async () => {
                await adminApi.makeUserFree(selectedId!)
                await refreshDetail(selectedId!)
              }
            )
          }
          onSuspend={() =>
            void runUserAction(
              'suspend',
              'Suspendre ce compte ? Il ne pourra plus se connecter.',
              async () => {
                await adminApi.suspendUser(selectedId!)
                await refreshDetail(selectedId!)
              }
            )
          }
          onUnsuspend={() =>
            void runUserAction(
              'unsuspend',
              'Réactiver ce compte ?',
              async () => {
                await adminApi.unsuspendUser(selectedId!)
                await refreshDetail(selectedId!)
              }
            )
          }
          onDelete={() =>
            void runUserAction(
              'delete',
              'Supprimer définitivement ce compte et toutes ses données ? Cette action est irréversible.',
              async () => {
                await adminApi.deleteUser(selectedId!)
                setSelectedId(null)
                setDetail(null)
                setPeekKey(null)
                await onRefreshUsers?.()
              }
            )
          }
        />
      ) : null}
    </div>
  )
}

function CensusHit({
  label,
  value,
  hint,
  warn,
  onClick,
}: {
  label: string
  value: number
  hint: string
  warn?: boolean
  onClick: () => void
}) {
  return (
    <button type="button" className={`ad-census-hit ${warn ? 'is-warn' : ''}`} onClick={onClick}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>
        {people(value)} · {hint}
      </small>
    </button>
  )
}

function Kpi({
  label,
  value,
  hint,
  onClick,
}: {
  label: string
  value: string
  hint?: string
  onClick?: () => void
}) {
  return (
    <button type="button" className="ad-kpi" onClick={onClick}>
      <p>{label}</p>
      <strong>{value}</strong>
      {hint ? <span>{hint}</span> : null}
    </button>
  )
}
