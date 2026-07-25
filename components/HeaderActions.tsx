'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Settings, Shield } from 'lucide-react'
import { useSubscription } from '@/contexts/SubscriptionContext'

interface HeaderActionsProps {
  iconSize?: number
  className?: string
}

export default function HeaderActions({
  iconSize = 22,
  className = '',
}: HeaderActionsProps) {
  const pathname = usePathname()
  const { user } = useSubscription()
  const isAdmin = user?.role === 'admin'

  const linkClass = (active: boolean) =>
    `p-2 touch-manipulation transition ${
      active ? 'text-primary-500' : 'text-gray-600 hover:text-primary-500'
    }`

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {isAdmin && (
        <Link
          href="/admin"
          className={linkClass(pathname === '/admin')}
          title="Dashboard admin"
          aria-label="Dashboard admin"
        >
          <Shield size={iconSize} strokeWidth={1.75} />
        </Link>
      )}
      <Link
        href="/settings"
        className={linkClass(pathname === '/settings')}
        title="Paramètres"
        aria-label="Paramètres"
      >
        <Settings size={iconSize} strokeWidth={1.75} />
      </Link>
    </div>
  )
}
