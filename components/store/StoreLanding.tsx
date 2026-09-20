'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import AppLogo from '@/components/AppLogo'
import Phone3D from '@/components/store/Phone3D'
import PreviewStrip from '@/components/store/PreviewStrip'
import FeatureDeck from '@/components/store/FeatureDeck'
import ExtraInfo from '@/components/store/ExtraInfo'
import StoreNav from '@/components/store/StoreNav'
import { APK_URL } from '@/lib/apk'

export default function StoreLanding() {
  const router = useRouter()
  const taps = useRef({ n: 0, t: 0 })
  const [pill, setPill] = useState(false)
  const [desktop, setDesktop] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const sync = () => setDesktop(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll('[data-download-actions]'))
    if (!nodes.length) return
    const seen = new Map<Element, boolean>()
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) seen.set(entry.target, entry.isIntersecting)
        setPill([...seen.values()].every((v) => !v))
      },
      { threshold: 0, rootMargin: '-8px 0px 0px 0px' }
    )
    nodes.forEach((n) => io.observe(n))
    return () => io.disconnect()
  }, [])

  const maybeOpenLogin = () => {
    const now = Date.now()
    if (now - taps.current.t > 2200) taps.current.n = 0
    taps.current.t = now
    taps.current.n += 1
    if (taps.current.n >= 5) {
      taps.current.n = 0
      router.push('/login')
    }
  }

  return (
    <div className="store-root min-h-dvh text-[#1b1630]">
      {pill ? (
        <div className="store-pill">
          <div className="store-pill-id">
            <AppLogo size="sm" />
            <div className="min-w-0 text-left">
              <p className="truncate text-[13px] font-semibold leading-tight text-[#111]">MES POCHES</p>
              <p className=" truncate text-[11px] text-[#6b6280] sm:block">Application de gestion financière</p>
            </div>
          </div>
          <a href={APK_URL} target="_blank" rel="noopener noreferrer" className="store-pill-btn">
            Télécharger l'APK
          </a>
        </div>
      ) : null}

      <StoreNav />

      <section id="top" className="relative z-10 px-5 pb-8 pt-6 lg:mx-auto lg:max-w-6xl lg:px-8 lg:pb-14 lg:pt-8">
        <p className="store-watermark hidden lg:block" aria-hidden>
          {'MES\nPOCHES'}
        </p>

        {/* Mobile : fiche Store */}
        <div className="hero-mobile lg:hidden">
          <div className="hero-mark" aria-hidden>
            MES
            <br />
            POCHES
          </div>
          <AppLogo size="xl" priority className="relative z-[1] mx-auto" />
          <h1 className="hero-title">MES POCHES</h1>
          <p className="hero-publisher">Application de gestion financière personnelle</p>
          <p className="hero-cat">Finance</p>
          <p className="hero-lead">
          L’application MES POCHES est conçue pour enrichir le suivi de votre argent et
          approfondir votre vue sur chaque poche. Téléchargez l’app pour <span className="store-k">capturer SMS, tickets,
          notes vocales</span>, et accéder à vos comptes <span className="store-k"> à tout moment, en tout lieu</span>.
          </p>
          <DownloadActions />
        </div>

        {/* Desktop */}
        <div className="relative hidden items-center gap-10 lg:grid lg:grid-cols-[1.02fr_0.98fr] lg:gap-8">
          <div>
            <div className="flex items-start gap-4">
              <AppLogo size="lg" priority />
              <div>
                <h1 className="font-display text-4xl leading-none tracking-tight text-[#111] sm:text-5xl">
                  MES POCHES
                </h1>
                <p className="mt-2 text-sm font-medium text-[#2563EB]">
                  Application de gestion financière personnelle
                </p>
              </div>
            </div>
            <p className="mt-8 max-w-xl text-[18px] leading-[1.7] text-[#3f3358]">
              Un SMS de transaction, un reçu de marché, une note vocale.{' '}
              <span className="store-k">MES POCHES prépare la ligne</span> — vous n’avez qu’à dire
              oui. L'application gère tout.
            </p>

            <DownloadActions />
          </div>
          <div className="flex justify-end">{desktop ? <Phone3D /> : null}</div>
        </div>
      </section>

      <section id="apercu" className="relative z-10 pb-6 pt-2 lg:pb-8">
        <PreviewStrip />
        <p className="preview-blurb hidden lg:block text-center">
          L’application MES POCHES est conçue pour enrichir le suivi de votre argent et
          approfondir votre vue sur chaque poche. Téléchargez l’app pour <span className="store-k">capturer SMS, tickets,
          notes vocales</span>, et accéder à vos comptes <span className="store-k"> à tout moment, en tout lieu</span>.
        </p>
      </section>

      <section id="fonctionnalites" className="store-why relative z-10 py-16 lg:py-24">
        <FeatureDeck />
      </section>

      <ExtraInfo />

      <footer className="relative z-10 border-t border-black/[0.06] bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 text-sm text-[#707070] md:flex-row md:items-center md:justify-between lg:px-8">
          <p>
            ©{' '}
            <button type="button" onClick={maybeOpenLogin} className="cursor-text">
              {new Date().getFullYear()}
            </button>{' '}
            MES POCHES
          </p>
          <nav className="flex flex-wrap gap-x-6 gap-y-2">
            <Link href="/legal" className="hover:text-[#2563EB]">
              Informations légales
            </Link>
            <Link href="/legal/privacy" className="hover:text-[#2563EB]">
              Confidentialité
            </Link>
            <Link href="/legal/terms" className="hover:text-[#2563EB]">
              Conditions
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}

function DownloadActions() {
  return (
    <div data-download-actions className="store-download">
      <div className="store-soon">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6b6280]">
          Pas encore dispo
        </p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <span className="store-soon-btn">
            <PlayBadge />
            Télécharger Android
          </span>
          <span className="store-soon-btn">
            <AppleBadge />
            Télécharger iOS
          </span>
        </div>
      </div>
      <a href={APK_URL} target="_blank" rel="noopener noreferrer" className="store-apk mt-4">
        Téléchargement direct de l’APK
      </a>
      <p className="store-ipa-note">
        Le fichier <span className="font-medium text-[#3f3358]">.ipa</span> iOS sera bientôt
        disponible.
      </p>
    </div>
  )
}

function PlayBadge() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path fill="currentColor" d="M3.6 2.4v19.2l10.4-9.6z" opacity=".85" />
      <path fill="currentColor" d="M16.4 13.2 3.6 21.6l13.5-7.5z" opacity=".7" />
      <path fill="currentColor" d="M20.4 10.2 16.4 8l-2.4 2.4 2.4 2.4z" opacity=".55" />
      <path fill="currentColor" d="M3.6 2.4 20.4 10.2 16.4 8z" opacity=".9" />
    </svg>
  )
}

function AppleBadge() {
  return (
    <svg width="16" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M16.7 12.4c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.2-2.8.9-3.5.9s-1.8-1-3-1c-1.5 0-3 .9-3.8 2.3-1.6 2.8-.4 7 1.2 9.3.8 1.1 1.7 2.3 2.9 2.3 1.2 0 1.6-.7 3-.7s1.8.7 3 .7 2-.1 2.9-2.3c1-.1 2-1.2 2.5-2.3-6.6-2.5-5.5-9.3-3.8-10.9zM14.8 5.7c.6-.8 1.1-1.9.9-3-1 .1-2.1.7-2.7 1.5-.6.7-1.1 1.8-.9 2.9 1.1.1 2.1-.6 2.7-1.4z" />
    </svg>
  )
}
