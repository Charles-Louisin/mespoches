'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AuthGuard } from '@/components/AuthGuard'
import { adminApi, authApi, AdminUserSummary, AdminUserDetail, AdminOverviewStats, DailyActiveUsersStat } from '@/lib/api'
import { hydrateAuthSession } from '@/lib/auth'
import Header from '@/components/Header'
import PageShell from '@/components/PageShell'
import LoadingSpinner from '@/components/LoadingSpinner'
import { formatCurrency } from '@/lib/utils'

export default function AdminDashboardPage() {
  const router = useRouter()
  const [overview, setOverview] = useState<AdminOverviewStats | null>(null)
  const [users, setUsers] = useState<AdminUserSummary[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [selectedUserDetail, setSelectedUserDetail] = useState<AdminUserDetail | null>(null)
  const [dailyActiveUsers, setDailyActiveUsers] = useState<DailyActiveUsersStat[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingUser, setLoadingUser] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        await hydrateAuthSession()
        const me = await authApi.me()
        if (me.role !== 'admin') {
          router.replace('/')
          return
        }

        const [ov, us, dau] = await Promise.all([
          adminApi.getOverviewStats(),
          adminApi.getUsers(),
          adminApi.getDailyActiveUsers(14),
        ])
        setOverview(ov)
        setUsers(us)
        setDailyActiveUsers(dau)
      } catch {
        router.replace('/')
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [router])

  const loadUserDetail = async (id: string) => {
    try {
      setLoadingUser(true)
      setSelectedUserId(id)
      const detail = await adminApi.getUserById(id)
      setSelectedUserDetail(detail)
    } catch (error) {
      console.error('Erreur chargement utilisateur admin:', error)
    } finally {
      setLoadingUser(false)
    }
  }

  const formatDateTime = (value?: string) => {
    if (!value) return '—'
    const d = new Date(value)
    return d.toLocaleString()
  }

  if (loading) {
    return (
      <AuthGuard>
        <PageShell>
          <Header title="Admin" />
          <LoadingSpinner />
        </PageShell>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <PageShell>
        <Header title="Dashboard Admin" />

        <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
          {/* Stats globales */}
          {overview && (
            <section className="bg-white rounded-xl p-4 md:p-6 border border-surface-line">
              <h2 className="text-lg font-semibold text-ink mb-4">Vue d’ensemble</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-surface rounded-lg p-4">
                  <p className="text-xs uppercase tracking-wide text-ink-mute">Utilisateurs</p>
                  <p className="text-2xl font-semibold text-ink mt-1">{overview.usersCount}</p>
                </div>
                <div className="bg-surface rounded-lg p-4">
                  <p className="text-xs uppercase tracking-wide text-ink-mute">Portefeuilles</p>
                  <p className="text-2xl font-semibold text-ink mt-1">{overview.walletsCount}</p>
                </div>
                <div className="bg-surface rounded-lg p-4">
                  <p className="text-xs uppercase tracking-wide text-ink-mute">Transactions</p>
                  <p className="text-2xl font-semibold text-ink mt-1">{overview.transactionsCount}</p>
                </div>
              </div>

              {/* Dernières connexions */}
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-ink mb-2">
                  Dernières connexions
                </h3>
                <div className="max-h-60 overflow-y-auto border border-surface-line rounded-lg">
                  <table className="min-w-full text-sm">
                    <thead className="bg-surface">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-ink-mute uppercase tracking-wider">
                          Utilisateur
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-ink-mute uppercase tracking-wider">
                          Rôle
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-ink-mute uppercase tracking-wider">
                          Dernière connexion
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {overview.lastLogins.map((u, index) => (
                        <tr key={index}>
                          <td className="px-3 py-2">
                            <div className="flex flex-col">
                              <span className="font-medium text-ink">
                                {u.name || '—'}
                              </span>
                              <span className="text-xs text-ink-mute">{u.email}</span>
                            </div>
                          </td>
                          <td className="px-3 py-2">
                            <span className="text-xs font-semibold px-2 py-1 rounded-full bg-surface-muted text-ink-soft">
                              {u.role === 'admin' ? 'Admin' : 'Utilisateur'}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-ink-soft">
                            {formatDateTime(u.lastLoginAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {/* Utilisateurs + détails */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* Liste des utilisateurs */}
            <div className="bg-white rounded-xl p-4 md:p-6 border border-surface-line">
              <h2 className="text-lg font-semibold text-ink mb-4">
                Utilisateurs ({users.length})
              </h2>
              <div className="max-h-[480px] overflow-y-auto -mx-4 md:mx-0">
                <table className="min-w-full text-sm">
                  <thead className="bg-surface sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-ink-mute uppercase tracking-wider">
                        Utilisateur
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-ink-mute uppercase tracking-wider">
                        Portefeuilles
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-ink-mute uppercase tracking-wider">
                        Transactions
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-ink-mute uppercase tracking-wider">
                        Dernière connexion
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {users.map((u) => (
                      <tr
                        key={u.id}
                        className={`cursor-pointer hover:bg-surface ${
                          selectedUserId === u.id ? 'bg-surface' : ''
                        }`}
                        onClick={() => loadUserDetail(u.id)}
                      >
                        <td className="px-3 py-2">
                          <div className="flex flex-col">
                            <span className="font-medium text-ink">
                              {u.name || '—'}
                            </span>
                            <span className="text-xs text-ink-mute">{u.email}</span>
                            <span className="text-[10px] text-ink-mute">
                              {u.role === 'admin' ? 'Admin' : 'Utilisateur'}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-2 text-ink-soft">
                          {u.walletsCount}
                        </td>
                        <td className="px-3 py-2 text-ink-soft">
                          {u.transactionsCount}
                        </td>
                        <td className="px-3 py-2 text-ink-soft text-xs">
                          {formatDateTime(u.lastLoginAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Détails utilisateur sélectionné */}
            <div className="bg-white rounded-xl p-4 md:p-6 border border-surface-line w-full">
              <h2 className="text-lg font-semibold text-ink mb-4">
                Détails utilisateur
              </h2>

              {loadingUser && (
                <div className="flex items-center justify-center h-40">
                  <LoadingSpinner />
                </div>
              )}

              {!loadingUser && !selectedUserDetail && (
                <p className="text-sm text-ink-mute">
                  Sélectionnez un utilisateur dans la liste pour voir ses détails.
                </p>
              )}

              {!loadingUser && selectedUserDetail && (
                <div className="space-y-4 text-sm">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-ink-mute">
                      Informations
                    </p>
                    <p className="mt-1 font-semibold text-ink">
                      {selectedUserDetail.user.name || '—'}
                    </p>
                    <p className="text-ink-soft">{selectedUserDetail.user.email}</p>
                    <p className="text-xs text-ink-mute mt-1">
                      Rôle :{' '}
                      <span className="font-semibold">
                        {selectedUserDetail.user.role === 'admin'
                          ? 'Admin'
                          : 'Utilisateur'}
                      </span>
                    </p>
                    <p className="text-xs text-ink-mute">
                      Inscription : {formatDateTime(selectedUserDetail.user.created_at)}
                    </p>
                    <p className="text-xs text-ink-mute">
                      Dernière connexion :{' '}
                      {formatDateTime(selectedUserDetail.user.lastLoginAt)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wide text-ink-mute mb-1">
                      Portefeuilles ({selectedUserDetail.wallets.length})
                    </p>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {selectedUserDetail.wallets.map((w) => (
                        <div
                          key={w._id}
                          className="border border-surface-line rounded-lg px-3 py-2 flex items-center justify-between"
                        >
                          <div>
                            <p className="font-medium text-ink">{w.name}</p>
                            <p className="text-xs text-ink-mute">{w.currency}</p>
                          </div>
                          <p className="font-semibold text-ink text-sm">
                            {formatCurrency(w.current_balance)}
                          </p>
                        </div>
                      ))}

                      {selectedUserDetail.wallets.length === 0 && (
                        <p className="text-xs text-ink-mute">Aucun portefeuille.</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wide text-ink-mute mb-1">
                      Dernières transactions ({selectedUserDetail.transactions.length})
                    </p>
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {selectedUserDetail.transactions.map((t) => (
                        <div
                          key={t._id}
                          className="border border-surface-line rounded-lg px-3 py-2 flex items-center justify-between"
                        >
                          <div className="flex flex-col">
                            <span
                              className={`text-xs font-semibold ${
                                t.type === 'income'
                                  ? 'text-green-600'
                                  : t.type === 'expense'
                                  ? 'text-red-600'
                                  : 'text-blue-600'
                              }`}
                            >
                              {t.type === 'income'
                                ? 'Revenu'
                                : t.type === 'expense'
                                ? 'Dépense'
                                : 'Transfert'}
                            </span>
                            <span className="text-xs text-ink-mute">
                              {t.category_id && typeof t.category_id === 'object'
                                ? (t.category_id as any).name
                                : ''}
                            </span>
                            <span className="text-[10px] text-ink-mute">
                              {formatDateTime(t.date)}
                            </span>
                          </div>
                          <div className="text-right">
                            <p
                              className={`font-semibold text-sm ${
                                t.type === 'income'
                                  ? 'text-green-600'
                                  : t.type === 'expense'
                                  ? 'text-red-600'
                                  : 'text-blue-600'
                              }`}
                            >
                              {t.type === 'expense' ? '-' : '+'}
                              {formatCurrency(t.amount)}
                            </p>
                            <p className="text-[10px] text-ink-mute">
                              Solde après : {formatCurrency(t.balance_after)}
                            </p>
                          </div>
                        </div>
                      ))}

                      {selectedUserDetail.transactions.length === 0 && (
                        <p className="text-xs text-ink-mute">Aucune transaction.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Utilisateurs actifs quotidiens */}
          <section className="bg-white rounded-xl p-4 md:p-6 border border-surface-line">
            <h2 className="text-lg font-semibold text-ink mb-4">
              Utilisateurs actifs par jour (14 derniers jours)
            </h2>
            {dailyActiveUsers.length === 0 ? (
              <p className="text-sm text-ink-mute">
                Pas encore de données de connexion suffisantes.
              </p>
            ) : (
              <div className="space-y-2">
                {dailyActiveUsers.map((d) => (
                  <div key={d.date} className="flex items-center gap-3 text-sm">
                    <div className="w-24 text-ink-soft">{d.date}</div>
                    <div className="flex-1 bg-surface-muted rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-indigo-500 h-2 rounded-full"
                        style={{
                          width: `${Math.min(d.activeUsers * 10, 100)}%`,
                        }}
                      />
                    </div>
                    <div className="w-10 text-right font-semibold text-ink">
                      {d.activeUsers}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>

      </PageShell>
    </AuthGuard>
  )
}

