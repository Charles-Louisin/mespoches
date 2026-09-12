'use client'

import Link from 'next/link'
import { Crown } from 'lucide-react'
import Button from '@/components/Button'

interface PremiumGateProps {
  title?: string
  description?: string
  feature?: string
  children?: React.ReactNode
}

export default function PremiumGate({
  title = 'Fonctionnalité Premium',
  description = 'Passez à Premium pour débloquer cette fonctionnalité et bien plus encore.',
  feature,
  children,
}: PremiumGateProps) {
  return (
    <div className="card p-6 text-center space-y-4">
      <div className="w-12 h-12 mx-auto rounded-xl bg-amber-50 flex items-center justify-center">
        <Crown className="text-amber-700" size={24} />
      </div>
      <div>
        <h2 className="text-lg font-semibold text-ink">{title}</h2>
        {feature && (
          <p className="text-sm text-primary-700 font-medium mt-1">{feature}</p>
        )}
        <p className="text-sm text-ink-soft mt-2">{description}</p>
      </div>
      {children}
      <Link href="/subscription" className="block">
        <Button className="w-full">Voir les offres Premium</Button>
      </Link>
    </div>
  )
}
