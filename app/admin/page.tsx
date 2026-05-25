'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AuthGuard } from '@/components/AuthGuard'
import { adminApi, AdminUserSummary, AdminUserDetail, AdminOverviewStats, DailyActiveUsersStat } from '@/lib/api'
import { getUser } from '@/lib/auth'
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
    const currentUser = getUser()
    if (!currentUser || currentUser.role !== 'admin') {
      router.replace('/')
      return
    }

    const load = async () => {
      try {
        setLoading(true)
        const [ov, us, dau] = await Promise.all([
          adminApi.getOverviewStats(),
          adminApi.getUsers(),
          adminApi.getDailyActiveUsers(14),
        ])
        setOverview(ov)
        setUsers(us)
        setDailyActiveUsers(dau)
      } catch (error) {
        console.error('Erreur chargement dashboard admin:', error)
      } finally {
        setLoading(false)
      }
    }

    load()
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
            <section className="bg-white rounded-xl p-4 md:p-6 border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Vue d’ensemble</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-500">Utilisateurs</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{overview.usersCount}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-500">Portefeuilles</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{overview.walletsCount}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-500">Transactions</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{overview.transactionsCount}</p>
                </div>
              </div>

              {/* Dernières connexions */}
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                  Dernières connexions
                </h3>
                <div className="max-h-60 overflow-y-auto border border-gray-100 rounded-lg">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Utilisateur
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Rôle
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Dernière connexion
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {overview.lastLogins.map((u, index) => (
                        <tr key={index}>
                          <td className="px-3 py-2">
                            <div className="flex flex-col">
                              <span className="font-medium text-gray-900">
                                {u.name || '—'}
                              </span>
                              <span className="text-xs text-gray-500">{u.email}</span>
                            </div>
                          </td>
                          <td className="px-3 py-2">
                            <span className="text-xs font-semibold px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                              {u.role === 'admin' ? 'Admin' : 'Utilisateur'}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-gray-700">
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
            <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Utilisateurs ({users.length})
              </h2>
              <div className="max-h-[480px] overflow-y-auto -mx-4 md:mx-0">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Utilisateur
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Portefeuilles
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Transactions
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Dernière connexion
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {users.map((u) => (
                      <tr
                        key={u.id}
                        className={`cursor-pointer hover:bg-gray-50 ${
                          selectedUserId === u.id ? 'bg-gray-50' : ''
                        }`}
                        onClick={() => loadUserDetail(u.id)}
                      >
                        <td className="px-3 py-2">
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-900">
                              {u.name || '—'}
                            </span>
                            <span className="text-xs text-gray-500">{u.email}</span>
                            <span className="text-[10px] text-gray-400">
                              {u.role === 'admin' ? 'Admin' : 'Utilisateur'}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-2 text-gray-700">
                          {u.walletsCount}
                        </td>
                        <td className="px-3 py-2 text-gray-700">
                          {u.transactionsCount}
                        </td>
                        <td className="px-3 py-2 text-gray-700 text-xs">
                          {formatDateTime(u.lastLoginAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Détails utilisateur sélectionné */}
            <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-200 w-full">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Détails utilisateur
              </h2>

              {loadingUser && (
                <div className="flex items-center justify-center h-40">
                  <LoadingSpinner />
                </div>
              )}

              {!loadingUser && !selectedUserDetail && (
                <p className="text-sm text-gray-500">
                  Sélectionnez un utilisateur dans la liste pour voir ses détails.
                </p>
              )}

              {!loadingUser && selectedUserDetail && (
                <div className="space-y-4 text-sm">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500">
                      Informations
                    </p>
                    <p className="mt-1 font-semibold text-gray-900">
                      {selectedUserDetail.user.name || '—'}
                    </p>
                    <p className="text-gray-700">{selectedUserDetail.user.email}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Rôle :{' '}
                      <span className="font-semibold">
                        {selectedUserDetail.user.role === 'admin'
                          ? 'Admin'
                          : 'Utilisateur'}
                      </span>
                    </p>
                    <p className="text-xs text-gray-500">
                      Inscription : {formatDateTime(selectedUserDetail.user.created_at)}
                    </p>
                    <p className="text-xs text-gray-500">
                      Dernière connexion :{' '}
                      {formatDateTime(selectedUserDetail.user.lastLoginAt)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                      Portefeuilles ({selectedUserDetail.wallets.length})
                    </p>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {selectedUserDetail.wallets.map((w) => (
                        <div
                          key={w._id}
                          className="border border-gray-100 rounded-lg px-3 py-2 flex items-center justify-between"
                        >
                          <div>
                            <p className="font-medium text-gray-900">{w.name}</p>
                            <p className="text-xs text-gray-500">{w.currency}</p>
                          </div>
                          <p className="font-semibold text-gray-900 text-sm">
                            {formatCurrency(w.current_balance)}
                          </p>
                        </div>
                      ))}

                      {selectedUserDetail.wallets.length === 0 && (
                        <p className="text-xs text-gray-400">Aucun portefeuille.</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                      Dernières transactions ({selectedUserDetail.transactions.length})
                    </p>
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {selectedUserDetail.transactions.map((t) => (
                        <div
                          key={t._id}
                          className="border border-gray-100 rounded-lg px-3 py-2 flex items-center justify-between"
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
                            <span className="text-xs text-gray-500">
                              {t.category_id && typeof t.category_id === 'object'
                                ? (t.category_id as any).name
                                : ''}
                            </span>
                            <span className="text-[10px] text-gray-400">
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
                            <p className="text-[10px] text-gray-400">
                              Solde après : {formatCurrency(t.balance_after)}
                            </p>
                          </div>
                        </div>
                      ))}

                      {selectedUserDetail.transactions.length === 0 && (
                        <p className="text-xs text-gray-400">Aucune transaction.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Utilisateurs actifs quotidiens */}
          <section className="bg-white rounded-xl p-4 md:p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Utilisateurs actifs par jour (14 derniers jours)
            </h2>
            {dailyActiveUsers.length === 0 ? (
              <p className="text-sm text-gray-500">
                Pas encore de données de connexion suffisantes.
              </p>
            ) : (
              <div className="space-y-2">
                {dailyActiveUsers.map((d) => (
                  <div key={d.date} className="flex items-center gap-3 text-sm">
                    <div className="w-24 text-gray-600">{d.date}</div>
                    <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-indigo-500 h-2 rounded-full"
                        style={{
                          width: `${Math.min(d.activeUsers * 10, 100)}%`,
                        }}
                      />
                    </div>
                    <div className="w-10 text-right font-semibold text-gray-900">
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

