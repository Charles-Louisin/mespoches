'use client'

import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import HeaderActions from '@/components/HeaderActions'

interface HeaderProps {
  title: string
  showBack?: boolean
  showSettings?: boolean
  action?: React.ReactNode
  variant?: 'default' | 'plain'
}

export default function Header({
  title,
  showBack = false,
  showSettings = false,
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
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {showBack && (
              <button
                onClick={() => router.back()}
                className="p-1 -ml-1 touch-manipulation text-gray-700"
                type="button"
              >
                <ArrowLeft size={24} />
              </button>
            )}
            <h1 className="text-lg font-bold text-gray-900 truncate">{title}</h1>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {action}
            {showSettings && <HeaderActions iconSize={20} />}
          </div>
        </div>
      </div>
    </header>
  )
}
