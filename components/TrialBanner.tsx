'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Gift, X } from 'lucide-react'
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
  /** Affiche une croix pour masquer le bloc (persistant localement) */
  dismissible?: boolean
}

function dismissStorageKey(user: MeUser): string {
  return `mp_hide_trial_banner:${user.id}:${user.premiumUntil ?? ''}`
}

/**
 * Bannière essai Premium — claire, sans pression visuelle.
 */
export default function TrialBanner({
  user,
  compact,
  dismissible = false,
}: TrialBannerProps) {
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    if (!dismissible || !user?.id || !isOnTrial(user)) {
      setHidden(false)
      return
    }
    try {
      setHidden(localStorage.getItem(dismissStorageKey(user)) === '1')
    } catch {
      setHidden(false)
    }
  }, [dismissible, user])

  if (!isOnTrial(user) || hidden) return null

  const daysLeft = getTrialDaysLeft(user)
  const endLabel = formatPremiumUntil(user?.premiumUntil)
  const urgent = daysLeft <= 7

  const handleDismiss = () => {
    if (!user?.id) return
    try {
      localStorage.setItem(dismissStorageKey(user), '1')
    } catch {
      /* ignore */
    }
    setHidden(true)
  }

  return (
    <div
      className={`relative rounded-2xl border ${
        urgent
          ? 'border-amber-200 bg-amber-50'
          : 'border-primary-100 bg-white'
      } ${compact ? 'p-3.5' : 'p-4'}`}
    >
      {dismissible && (
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-2.5 right-2.5 p-1.5 rounded-lg text-ink-mute hover:text-ink hover:bg-black/5 touch-manipulation"
          aria-label="Masquer"
        >
          <X size={16} />
        </button>
      )}
      <div className={`flex items-start gap-3 ${dismissible ? 'pr-7' : ''}`}>
        <div
          className={`flex shrink-0 items-center justify-center rounded-xl ${
            urgent ? 'bg-amber-100 text-amber-800' : 'bg-primary-50 text-primary-700'
          } ${compact ? 'h-9 w-9' : 'h-10 w-10'}`}
        >
          <Gift size={compact ? 18 : 20} />
        </div>
        <div className="min-w-0 flex-1">
          <p className={`font-semibold text-ink ${compact ? 'text-sm' : 'text-[15px]'}`}>
            {urgent
              ? `Plus que ${daysLeft} jour${daysLeft > 1 ? 's' : ''} d'essai`
              : 'Essai Premium en cours'}
          </p>
          <p className={`mt-0.5 text-ink-soft ${compact ? 'text-xs' : 'text-sm'}`}>
            {urgent
              ? `Accès Pro jusqu'au ${endLabel}.`
              : `1 mois offert — accès complet jusqu'au ${endLabel}.`}
          </p>
          {!compact && (
            <Link
              href="/subscription"
              className="mt-2.5 inline-block text-sm font-semibold text-primary-700 hover:text-primary-800"
            >
              Garder Premium après l&apos;essai
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
