'use client'

import Link from 'next/link'
import { Crown } from 'lucide-react'

interface UpgradeBannerProps {
  message: string
  compact?: boolean
}

export default function UpgradeBanner({ message, compact }: UpgradeBannerProps) {
  return (
    <Link
      href="/subscription"
      className={`flex items-center gap-3 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white ${
        compact ? 'p-3' : 'p-4'
      }`}
    >
      <Crown size={compact ? 20 : 24} className="shrink-0" />
      <div className="flex-1 min-w-0">
        <p className={`font-semibold ${compact ? 'text-sm' : 'text-base'}`}>
          Passer à Premium
        </p>
        <p className={`opacity-90 ${compact ? 'text-xs' : 'text-sm'} truncate`}>
          {message}
        </p>
      </div>
      <span className="text-sm font-medium shrink-0">→</span>
    </Link>
  )
}
