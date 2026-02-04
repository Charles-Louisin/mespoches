'use client'

import { ArrowLeft, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { logout } from '@/lib/auth'
import { toast } from 'sonner'

interface HeaderProps {
  title: string
  showBack?: boolean
  showLogout?: boolean
  action?: React.ReactNode
}

export default function Header({ title, showBack = false, showLogout = false, action }: HeaderProps) {
  const router = useRouter()

  const handleLogout = () => {
    if (confirm('Voulez-vous vraiment vous déconnecter ?')) {
      logout()
      toast.success('Déconnexion réussie')
    }
  }

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
            {showLogout && (
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-red-50 rounded-lg transition text-red-600 touch-manipulation"
                title="Déconnexion"
              >
                <LogOut size={20} />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
