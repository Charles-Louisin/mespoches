'use client'

import { ArrowLeft, Settings } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface HeaderProps {
  title: string
  showBack?: boolean
  showSettings?: boolean
  action?: React.ReactNode
}

export default function Header({ title, showBack = false, showSettings = false, action }: HeaderProps) {
  const router = useRouter()

  return (
    <header className="sticky top-0 bg-white border-b border-gray-200 z-40">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-3 flex-1">
            {showBack && (
              <button
                onClick={() => router.back()}
                className="p-1 -ml-1 touch-manipulation"
              >
                <ArrowLeft size={24} className="text-gray-700" />
              </button>
            )}
            <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
          </div>
          <div className="flex items-center gap-2">
            {action && <div>{action}</div>}
            {showSettings && (
              <Link
                href="/settings"
                className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-600 touch-manipulation"
                title="Paramètres"
              >
                <Settings size={20} />
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
