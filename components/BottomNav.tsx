'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Home, History, Wallet, BarChart3, Plus, Shield } from 'lucide-react'
import { getUser } from '@/lib/auth'

export default function BottomNav() {
  const pathname = usePathname()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const u = getUser()
    setIsAdmin(!!u && u.role === 'admin')
  }, [])

  const leftItems = [
    { href: '/', icon: Home, label: 'Accueil' },
    { href: '/transactions', icon: History, label: 'Historique' },
  ]

  const rightItems = [
    { href: '/wallets', icon: Wallet, label: 'Portefeuilles' },
    { href: '/analytics', icon: BarChart3, label: 'Analyse' },
    ...(isAdmin ? [{ href: '/admin', icon: Shield, label: 'Admin' }] : []),
  ]

  const NavLink = ({
    href,
    icon: Icon,
    label,
  }: {
    href: string
    icon: typeof Home
    label: string
  }) => {
    const isActive = pathname === href
    return (
      <Link
        href={href}
        className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-2 touch-manipulation transition ${
          isActive ? 'text-white' : 'text-white/70'
        }`}
      >
        <div
          className={`p-1.5 rounded-xl transition ${
            isActive ? 'bg-white/20' : ''
          }`}
        >
          <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
        </div>
        <span className={`text-[10px] ${isActive ? 'font-semibold' : 'font-normal'}`}>
          {label}
        </span>
      </Link>
    )
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
      <div className="max-w-md mx-auto px-4 pb-4 pointer-events-auto">
        <div className="relative nav-gradient rounded-2xl shadow-nav px-2 pt-2 pb-1">
          <div className="flex items-end">
            <div className="flex flex-1">
              {leftItems.map((item) => (
                <NavLink key={item.href} {...item} />
              ))}
            </div>

            <div className="w-16 flex-shrink-0" />

            <div className="flex flex-1">
              {rightItems.map((item) => (
                <NavLink key={item.href} {...item} />
              ))}
            </div>
          </div>

          <Link
            href="/transactions/new"
            className="absolute left-1/2 -translate-x-1/2 -top-5 w-14 h-14 rounded-full bg-primary-800 shadow-lg flex items-center justify-center text-white hover:bg-primary-900 transition touch-manipulation border-4 border-surface"
            aria-label="Nouvelle transaction"
          >
            <Plus size={28} strokeWidth={2.5} />
          </Link>
        </div>
      </div>
    </nav>
  )
}
