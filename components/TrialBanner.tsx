'use client'

import Link from 'next/link'
import { Gift, Sparkles } from 'lucide-react'
import type { MeUser } from '@/lib/api'
import {
  formatPremiumUntil,
  getTrialDaysLeft,
  isOnTrial,
} from '@/lib/subscription'

interface TrialBannerProps {
  user: MeUser | null | undefined
  /** Variante compacte pour l'accueil */
  compact?: boolean
}

/**
 * Bannière essai Premium — design thinking :
 * empathie (cadeau, pas pression), clarté (date de fin),
 * action douce (garder Premium) plutôt qu'upsell agressif.
 */
export default function TrialBanner({ user, compact }: TrialBannerProps) {
  if (!isOnTrial(user)) return null

  const daysLeft = getTrialDaysLeft(user)
  const endLabel = formatPremiumUntil(user?.premiumUntil)
  const urgent = daysLeft <= 7

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border ${
        urgent
          ? 'border-amber-200/80 bg-gradient-to-br from-amber-50 via-white to-orange-50'
          : 'border-primary-100 bg-gradient-to-br from-primary-50 via-white to-emerald-50/40'
      } ${compact ? 'p-3.5' : 'p-5'}`}
    >
      <div
        className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary-200/20 blur-2xl"
        aria-hidden
      />
      <div className="relative flex items-start gap-3">
        <div
          className={`flex shrink-0 items-center justify-center rounded-xl ${
            urgent ? 'bg-amber-100 text-amber-700' : 'bg-primary-100 text-primary-600'
          } ${compact ? 'h-9 w-9' : 'h-11 w-11'}`}
        >
          {urgent ? <Sparkles size={compact ? 18 : 22} /> : <Gift size={compact ? 18 : 22} />}
        </div>
        <div className="min-w-0 flex-1">
          <p className={`font-semibold text-gray-900 ${compact ? 'text-sm' : 'text-base'}`}>
            {urgent
              ? `Plus que ${daysLeft} jour${daysLeft > 1 ? 's' : ''} d'essai`
              : 'Essai Premium en cours'}
          </p>
          <p className={`mt-0.5 text-gray-600 ${compact ? 'text-xs' : 'text-sm'}`}>
            {urgent
              ? `Profitez encore de toutes les fonctions Pro jusqu'au ${endLabel}.`
              : `1 mois offert pour découvrir Premium. Accès complet jusqu'au ${endLabel}.`}
          </p>
          {!compact && (
            <Link
              href="/subscription"
              className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary-600 hover:text-primary-700"
            >
              Garder Premium après l&apos;essai →
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
