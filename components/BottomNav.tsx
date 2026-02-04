'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, History, Wallet, BarChart3 } from 'lucide-react'

export default function BottomNav() {
  const pathname = usePathname()

  const navItems = [
    { href: '/', icon: Home, label: 'Accueil' },
    { href: '/transactions', icon: History, label: 'Historique' },
    { href: '/wallets', icon: Wallet, label: 'Portefeuilles' },
    { href: '/analytics', icon: BarChart3, label: 'Analyses' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="max-w-md mx-auto px-4">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-1 flex-1 h-full touch-manipulation ${
                  isActive
                    ? 'text-primary-500'
                    : 'text-gray-500'
                }`}
              >
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                <span className={`text-xs ${isActive ? 'font-semibold' : 'font-normal'}`}>
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
