'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AuthGuard } from '@/components/AuthGuard'
import AdminDashboard from '@/components/admin/AdminDashboard'
import LoadingBar from '@/components/LoadingBar'
import { adminApi, authApi, type AdminInsights, type AdminTelemetry, type AdminUserSummary } from '@/lib/api'
import { hydrateAuthSession } from '@/lib/auth'

export default function AdminDashboardPage() {
  const router = useRouter()
  const [days, setDays] = useState(30)
  const [insights, setInsights] = useState<AdminInsights | null>(null)
  const [telemetry, setTelemetry] = useState<AdminTelemetry | null>(null)
  const [users, setUsers] = useState<AdminUserSummary[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(
    async (period: number, silent = false) => {
      if (!silent) setLoading(true)
      setError(null)
      try {
        await hydrateAuthSession()
        const me = await authApi.me()
        if (me.role !== 'admin') {
          router.replace('/')
          return
        }
        const [ins, tel, us] = await Promise.all([
          adminApi.getInsights(period),
          adminApi.getTelemetry(period),
          adminApi.getUsers(),
        ])
        setInsights(ins)
        setTelemetry(tel)
        setUsers(us)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Chargement impossible')
      } finally {
        setLoading(false)
      }
    },
    [router]
  )

  useEffect(() => {
    void load(days)
  }, [days, load])

  return (
    <AuthGuard>
      <div className="ad-mobile-lock lg:hidden">
        <p>La console interne est conçue pour un écran d’ordinateur.</p>
      </div>
      <div className="hidden min-h-dvh lg:block">
        {loading && !insights ? (
          <div className="flex min-h-dvh items-center justify-center bg-[#0f1220]">
            <LoadingBar label="Chargement de la console…" />
          </div>
        ) : error || !insights || !telemetry ? (
          <div className="ad-session">
            <p>{error || 'Données indisponibles'}</p>
            <div className="ad-session-actions">
              <button type="button" className="ad-session-btn" onClick={() => router.push('/login')}>
                Aller à la connexion
              </button>
              <button type="button" className="ad-session-btn is-ghost" onClick={() => window.location.reload()}>
                Actualiser
              </button>
            </div>
          </div>
        ) : (
          <AdminDashboard
            insights={insights}
            telemetry={telemetry}
            users={users}
            days={days}
            onDays={setDays}
          />
        )}
      </div>
    </AuthGuard>
  )
}
