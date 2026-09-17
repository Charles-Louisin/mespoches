'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowUp, Menu, X } from 'lucide-react'
import AppLogo from '@/components/AppLogo'
import StoreAuthActions from '@/components/store/StoreAuthActions'

const LINKS = [
  { href: '#fonctionnalites', label: 'Fonctionnalités' },
  { href: '#apercu', label: 'Aperçu' },
  { href: '/legal', label: 'Mentions légales' },
] as const

const PILL_MS = 280

export default function StoreNav() {
  const [open, setOpen] = useState(false)
  const [pills, setPills] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const closeTimer = useRef<number>(0)

  const hideMenu = () => {
    setOpen(false)
    window.clearTimeout(closeTimer.current)
    closeTimer.current = window.setTimeout(() => setPills(false), PILL_MS)
  }

  const toggleMenu = () => {
    if (open) {
      hideMenu()
      return
    }
    window.clearTimeout(closeTimer.current)
    setPills(true)
    setOpen(true)
  }

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 48)
      setOpen(false)
      setPills(false)
      window.clearTimeout(closeTimer.current)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.clearTimeout(closeTimer.current)
    }
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') hideMenu()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const goTop = () => {
    hideMenu()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      <header className="store-nav-mobile lg:hidden">
        <a href="#top" className="flex min-w-0 items-center gap-2.5">
          <AppLogo size="xs" priority />
          <span className="font-display truncate text-[15px] tracking-wide text-[#1b1630]">
            MES POCHES
          </span>
        </a>
        <div className="store-nav-slot">
          {!scrolled ? (
            <div className="relative">
              <Burger open={open} onToggle={toggleMenu} />
              {pills ? (
                <NavPills open={open} onPick={hideMenu} from="header" />
              ) : null}
            </div>
          ) : (
            <span className="store-nav-slot-ph" aria-hidden />
          )}
        </div>
      </header>

      <header className="relative z-20 mx-auto hidden max-w-6xl items-center justify-between px-5 py-5 lg:flex lg:px-8">
        <a href="#top" className="flex items-center gap-3">
          <AppLogo size="sm" priority />
          <span className="font-display text-lg tracking-wide text-[#1b1630]">MES POCHES</span>
        </a>
        <nav className="flex items-center gap-7 text-sm text-[#3f3358]">
          {LINKS.map((l) =>
            l.href.startsWith('/') ? (
              <Link key={l.href} href={l.href} className="hover:text-[#2563EB]">
                {l.label}
              </Link>
            ) : (
              <a key={l.href} href={l.href} className="hover:text-[#2563EB]">
                {l.label}
              </a>
            )
          )}
          <StoreAuthActions />
        </nav>
      </header>

      {scrolled ? (
        <div className="store-fab-stack">
          <div className="flex flex-col items-end gap-2 lg:hidden">
            {pills ? <NavPills open={open} onPick={hideMenu} from="dock" /> : null}
            <Burger open={open} onToggle={toggleMenu} />
          </div>
          <button type="button" className="store-fab" aria-label="Retour en haut" onClick={goTop}>
            <ArrowUp size={22} />
          </button>
        </div>
      ) : null}
    </>
  )
}

function Burger({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      className="store-fab"
      aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
      aria-expanded={open}
      onClick={onToggle}
    >
      {open ? <X size={22} /> : <Menu size={22} />}
    </button>
  )
}

function NavPills({
  open,
  onPick,
  from,
}: {
  open: boolean
  onPick: () => void
  from: 'header' | 'dock'
}) {
  return (
    <nav
      className={`store-nav-pills ${from === 'header' ? 'is-header' : 'is-dock'} ${
        open ? 'is-open' : 'is-closing'
      }`}
    >
      {LINKS.map((l) => {
        const className = 'store-nav-chip'
        if (l.href.startsWith('/')) {
          return (
            <Link key={l.href} href={l.href} className={className} onClick={onPick}>
              {l.label}
            </Link>
          )
        }
        return (
          <a key={l.href} href={l.href} className={className} onClick={onPick}>
            {l.label}
          </a>
        )
      })}
      <StoreAuthActions onNavigate={onPick} />
    </nav>
  )
}
