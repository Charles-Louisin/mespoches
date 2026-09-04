'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  Home,
  History,
  Wallet,
  BarChart3,
  Target,
  Tag,
  Plus,
  X,
  Type,
  Image as ImageIcon,
  Mic,
} from 'lucide-react'
import { useSubscription } from '@/hooks/useSubscription'
import { useReceiptScan } from '@/contexts/ReceiptScanContext'
import VoiceNoteOverlay from '@/components/VoiceNoteOverlay'

function FabCompositeIcon({ open }: { open: boolean }) {
  return open ? (
    <X size={26} strokeWidth={2.5} aria-hidden />
  ) : (
    <Plus size={28} strokeWidth={2.5} aria-hidden />
  )
}

export default function BottomNav() {
  const pathname = usePathname()
  const { showProBadge, isPremium, requirePremium } = useSubscription()
  const { startScan, scanning } = useReceiptScan()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [voiceOpen, setVoiceOpen] = useState(false)

  useEffect(() => {
    setSheetOpen(false)
  }, [pathname])

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
          {premium && showProBadge && (
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

  const fabClass =
    'absolute left-1/2 -translate-x-1/2 -top-5 w-14 h-14 rounded-full bg-primary-800 shadow-lg flex items-center justify-center text-white hover:bg-primary-900 transition touch-manipulation border-4 border-surface disabled:opacity-60'

  const handleImage = async () => {
    setSheetOpen(false)
    await startScan(isPremium, requirePremium)
  }

  const handleAudio = () => {
    setSheetOpen(false)
    if (!isPremium) {
      requirePremium('Note vocale réservée aux abonnés Premium')
      return
    }
    setVoiceOpen(true)
  }

  return (
    <>
      {sheetOpen && (
        <div className="fixed inset-0 z-[45] pointer-events-none">
          <div className="absolute inset-0 bg-black/25" aria-hidden />
          <div className="absolute bottom-[154px] left-0 right-0 px-4 pointer-events-none">
            <div className="max-w-md mx-auto pointer-events-auto">
              <div className="rounded-[1.75rem] bg-white shadow-xl border border-gray-100 px-4 pt-4 pb-5">
                <p className="text-center text-sm font-semibold text-gray-800 mb-4">
                  Ajouter une transaction par
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <Link
                    href="/transactions/new"
                    onClick={() => setSheetOpen(false)}
                    className="flex flex-col items-center gap-2 py-3 rounded-2xl bg-primary-50 text-primary-800 touch-manipulation active:scale-[0.98] transition"
                  >
                    <span className="w-11 h-11 rounded-full bg-white shadow-sm flex items-center justify-center">
                      <Type size={20} strokeWidth={2.25} />
                    </span>
                    <span className="text-xs font-semibold">Texte</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => void handleImage()}
                    disabled={scanning}
                    className="flex flex-col items-center gap-2 py-3 rounded-2xl bg-primary-50 text-primary-800 touch-manipulation active:scale-[0.98] transition disabled:opacity-60"
                  >
                    <span className="w-11 h-11 rounded-full bg-white shadow-sm flex items-center justify-center">
                      <ImageIcon size={20} strokeWidth={2.25} />
                    </span>
                    <span className="text-xs font-semibold">Image</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleAudio}
                    className="flex flex-col items-center gap-2 py-3 rounded-2xl bg-primary-50 text-primary-800 touch-manipulation active:scale-[0.98] transition"
                  >
                    <span className="w-11 h-11 rounded-full bg-white shadow-sm flex items-center justify-center">
                      <Mic size={20} strokeWidth={2.25} />
                    </span>
                    <span className="text-xs font-semibold">Audio</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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

            <button
              type="button"
              onClick={() => setSheetOpen((v) => !v)}
              className={fabClass}
              aria-label={sheetOpen ? 'Fermer' : 'Ajouter une transaction'}
              aria-expanded={sheetOpen}
            >
              <FabCompositeIcon open={sheetOpen} />
            </button>
          </div>
        </div>
      </nav>

      <VoiceNoteOverlay
        open={voiceOpen}
        onClose={() => setVoiceOpen(false)}
        isPremium={isPremium}
        requirePremium={requirePremium}
      />
    </>
  )
}
