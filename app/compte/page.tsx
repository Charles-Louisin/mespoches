'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import StoreChrome from '@/components/store/StoreChrome'
import AppLogo from '@/components/AppLogo'
import LoadingBar from '@/components/LoadingBar'
import { authApi } from '@/lib/api'
import {
  hasSession,
  getUser,
  hydrateAuthSession,
  logout,
  setUser,
  type User,
} from '@/lib/auth'

const APK_URL = process.env.NEXT_PUBLIC_APK_URL?.trim() || '/mes-poches.apk'

export default function ComptePage() {
  return (
    <Suspense
      fallback={
        <StoreChrome compact>
          <div className="flex min-h-[60dvh] items-center justify-center">
            <LoadingBar label="Chargement de votre compte…" />
          </div>
        </StoreChrome>
      }
    >
      <ComptePageContent />
    </Suspense>
  )
}

function ComptePageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [user, setUserState] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    void (async () => {
      await hydrateAuthSession()
      if (cancelled) return

      if (!hasSession()) {
        router.replace('/login')
        return
      }

      let profile = getUser()
      try {
        const me = await authApi.me()
        profile = {
          id: me.id,
          email: me.email,
          name: me.name,
          role: me.role,
          plan: me.plan,
          premiumUntil: me.premiumUntil,
          isPremium: me.isPremium,
          currency: me.currency,
          hidePlannedExpensesHelp: me.hidePlannedExpensesHelp,
          lastLoginAt: me.lastLoginAt ?? undefined,
          emailVerified: true,
        }
        setUser(profile)
      } catch {
        /* on garde le profil local si /me échoue */
      }

      if (cancelled) return

      if (profile?.role === 'admin') {
        router.replace('/admin')
        return
      }

      setUserState(profile)
      setLoading(false)
    })()

    return () => {
      cancelled = true
    }
  }, [router])

  useEffect(() => {
    if (loading) return
    if (searchParams.get('connected') !== '1') return
    toast.success('Connexion réussie')
    router.replace('/compte', { scroll: false })
  }, [loading, searchParams, router])

  if (loading) {
    return (
      <StoreChrome compact>
        <div className="flex min-h-[60dvh] items-center justify-center">
          <LoadingBar label="Chargement de votre compte…" />
        </div>
      </StoreChrome>
    )
  }

  const displayName = user?.name?.trim() || user?.email || 'votre compte'

  return (
    <StoreChrome compact>
      <div className="auth-split">
        <section className="auth-brand">
          <p className="auth-brand-mark" aria-hidden>
            {'MES\nPOCHES'}
          </p>
          <div className="auth-brand-copy">
            <AppLogo size="lg" />
            <h1>Compte connecté</h1>
            <p>
              Ce site sert à présenter l’application et à la télécharger. Le suivi de vos
              poches se fait dans l’application Android, pas dans un tableau de bord web.
            </p>
          </div>
        </section>

        <section className="auth-form-col">
          <div className="auth-card">
            <p className="legal-kicker">Session</p>
            <h2 className="mt-2">Bonjour</h2>
            <p className="auth-lead">{displayName}</p>

            <div className="mt-2 space-y-3 text-sm leading-relaxed text-[#3f3358]">
              <p>
                Votre compte est actif. Installez l’application pour saisir, valider et
                consulter vos mouvements.
              </p>
              {user?.plan === 'premium' || user?.isPremium ? (
                <p className="rounded-xl bg-[#2563eb]/10 px-3 py-2 text-[#1d4ed8]">
                  Formule Premium active dans l’application.
                </p>
              ) : null}
            </div>

            <a href={APK_URL} download className="store-apk mt-6 w-full">
              Télécharger l’APK Android
            </a>

            <div className="mt-4 flex flex-col gap-2">
              <Link
                href="/"
                className="inline-flex min-h-[46px] items-center justify-center rounded-[10px] border border-black/[0.08] bg-white text-sm font-semibold text-[#1b1630]"
              >
                Retour à l’accueil
              </Link>
              <button
                type="button"
                onClick={() => logout()}
                className="inline-flex min-h-[46px] items-center justify-center rounded-[10px] text-sm font-semibold text-[#6b6280] hover:text-[#1b1630]"
              >
                Se déconnecter
              </button>
            </div>
          </div>
        </section>
      </div>
    </StoreChrome>
  )
}
