'use client'

import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { logout } from '@/lib/auth'

interface HeaderProps {
  title: string
  showBack?: boolean
  showLogout?: boolean
  action?: React.ReactNode
  variant?: 'default' | 'plain'
}

export default function Header({
  title,
  showBack = false,
  showLogout = false,
  action,
  variant = 'default',
}: HeaderProps) {
  const router = useRouter()

  return (
    <header
      className={`sticky top-0 z-40 ${
        variant === 'plain' ? 'bg-surface' : 'bg-surface/95 backdrop-blur-sm'
      }`}
    >
      <div className="mx-auto max-w-6xl">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            {showBack && (
              <button
                onClick={() => router.back()}
                className="touch-manipulation -ml-1 p-1 text-ink-soft"
                type="button"
              >
                <ArrowLeft size={24} />
              </button>
            )}
            <h1 className="truncate text-lg font-semibold text-ink">{title}</h1>
          </div>
          <div className="flex flex-shrink-0 items-center gap-2">
            {action}
            {showLogout && (
              <button
                type="button"
                onClick={() => logout()}
                className="rounded-full px-3 py-1.5 text-sm font-medium text-[#2563EB] hover:bg-white"
              >
                Déconnexion
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
