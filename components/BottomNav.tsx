'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, History, Wallet, BarChart3, Plus, Target, Tag } from 'lucide-react'
import { useSubscription } from '@/hooks/useSubscription'

export default function BottomNav() {
  const pathname = usePathname()
  const { isPremium } = useSubscription()

  const leftItems = [
    { href: '/', icon: Home, label: 'Accueil' },
    { href: '/transactions', icon: History, label: 'Historique' },
    { href: '/objectifs', icon: Target, label: 'Objectifs', premium: true },
  ]

  const rightItems = [
    { href: '/wallets', icon: Wallet, label: 'Poches' },
    { href: '/categories', icon: Tag, label: 'Catég.' },
    { href: '/analytics', icon: BarChart3, label: 'Analyse' },
  ]

  const NavLink = ({
    href,
    icon: Icon,
    label,
    premium,
  }: {
    href: string
    icon: typeof Home
    label: string
    premium?: boolean
  }) => {
    const isActive = pathname === href
    return (
      <Link
        href={href}
        className={`flex flex-1 basis-0 min-w-0 flex-col items-center justify-center gap-1 px-0.5 py-2.5 touch-manipulation transition ${
          isActive ? 'text-white' : 'text-white/70'
        }`}
      >
        <div
          className={`relative p-2 rounded-xl transition shrink-0 ${
            isActive ? 'bg-white/20' : ''
          }`}
        >
          <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
          {premium && !isPremium && (
            <span className="absolute -top-1 -right-1.5 text-[9px] bg-amber-400 text-amber-900 px-1 rounded font-bold leading-none">
              Pro
            </span>
          )}
        </div>
        <span
          className={`text-center text-[11px] leading-tight truncate w-full max-w-[64px] ${
            isActive ? 'font-semibold' : 'font-medium'
          }`}
        >
          {label}
        </span>
      </Link>
    )
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
      <div className="max-w-md mx-auto px-4 pb-4 pointer-events-auto">
        <div className="relative nav-gradient rounded-2xl shadow-nav px-1.5 pt-2.5 pb-1.5">
          <div className="flex items-end">
            <div className="flex flex-1 min-w-0 justify-evenly gap-0.5">
              {leftItems.map((item) => (
                <NavLink key={item.href} {...item} />
              ))}
            </div>

            <div className="w-16 flex-shrink-0" />

            <div className="flex flex-1 min-w-0 justify-evenly gap-0.5">
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
