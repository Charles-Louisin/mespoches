'use client'

import Link from 'next/link'
import { Download, LogIn } from 'lucide-react'
import { usePwaInstall } from '@/hooks/usePwaInstall'
import HeaderActions from '@/components/HeaderActions'

interface HomeHeaderProps {
  userName?: string
  isLoggedIn?: boolean
}

export default function HomeHeader({ userName, isLoggedIn }: HomeHeaderProps) {
  const { isInstalled, install } = usePwaInstall()

  return (
    <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur-sm">
      <div className="max-w-md mx-auto px-4 pt-4 pb-2">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-900">
            {isLoggedIn && userName ? (
              <>
                Salut, <span className="font-bold">{userName}</span>
              </>
            ) : (
              'MES POCHES'
            )}
          </h1>
          <div className="flex items-center gap-1">
            {isLoggedIn ? (
              <>
                {!isInstalled && (
                  <button
                    type="button"
                    onClick={install}
                    className="p-2 text-gray-600 hover:text-primary-500 touch-manipulation"
                    aria-label="Installer l'application"
                    title="Installer l'application"
                  >
                    <Download size={22} strokeWidth={1.75} />
                  </button>
                )}
                <HeaderActions />
              </>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 bg-primary-500 text-white px-3 py-2 rounded-xl text-sm font-semibold hover:bg-primary-600 transition touch-manipulation"
              >
                <LogIn size={16} />
                Connexion
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
