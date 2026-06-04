'use client'

import Link from 'next/link'
import { Crown } from 'lucide-react'
import ProBadge from '@/components/ProBadge'
import { useSubscription } from '@/hooks/useSubscription'

interface ProFeatureProps {
  title: string
  description?: string
  isPremium: boolean
  children: React.ReactNode
  className?: string
}

/** Affiche le contenu si Premium ; sinon un encart verrouillé (après chargement du statut). */
export default function ProFeature({
  title,
  description,
  isPremium,
  children,
  className = '',
}: ProFeatureProps) {
  const { loading, showProBadge } = useSubscription()

  if (isPremium) {
    return <div className={className}>{children}</div>
  }

  if (loading) {
    return (
      <div
        className={`card p-4 animate-pulse bg-gray-100/80 min-h-[5.5rem] ${className}`}
        aria-hidden
      />
    )
  }

  if (!showProBadge) {
    return null
  }

  return (
    <Link
      href="/subscription"
      className={`block card p-4 border border-dashed border-primary-200 bg-primary-50/30 hover:bg-primary-50/60 transition-colors ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
          <Crown size={20} className="text-primary-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <ProBadge />
          </div>
          {description && (
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          )}
          <p className="text-xs text-primary-600 font-medium mt-2">
            Appuyez pour découvrir Premium →
          </p>
        </div>
      </div>
    </Link>
  )
}
