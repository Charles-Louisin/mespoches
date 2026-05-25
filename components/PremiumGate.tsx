'use client'

import Link from 'next/link'
import { Crown, Sparkles } from 'lucide-react'
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
      <div className="w-14 h-14 mx-auto rounded-full bg-primary-50 flex items-center justify-center">
        <Crown className="text-primary-500" size={28} />
      </div>
      <div>
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        {feature && (
          <p className="text-sm text-primary-600 font-medium mt-1 flex items-center justify-center gap-1">
            <Sparkles size={14} />
            {feature}
          </p>
        )}
        <p className="text-sm text-gray-500 mt-2">{description}</p>
      </div>
      {children}
      <Link href="/subscription" className="block">
        <Button className="w-full">Voir les offres Premium</Button>
      </Link>
    </div>
  )
}
