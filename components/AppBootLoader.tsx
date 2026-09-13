'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Capacitor } from '@capacitor/core'
import { SplashScreen } from '@capacitor/splash-screen'
import AppLogo from '@/components/AppLogo'

const MIN_DISPLAY_MS = 2400
const MAX_WAIT_MS = 10000
const BRAND_BLUE = '#2563EB'

function pageIsReady() {
  return document.readyState === 'complete'
}

export default function AppBootLoader() {
  const [phase, setPhase] = useState<'pending' | 'show' | 'hide'>('pending')
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      setPhase('hide')
      return
    }

    let cancelled = false
    let finished = false
    const started = Date.now()
    const timers: number[] = []

    const hideNativeSplash = async () => {
      try {
        await SplashScreen.hide({ fadeOutDuration: 0 })
      } catch {
        /* ignore */
      }
    }

    const finish = async () => {
      if (finished || cancelled) return
      finished = true
      window.clearInterval(poll)
      const wait = Math.max(0, MIN_DISPLAY_MS - (Date.now() - started))
      await new Promise((r) => {
        timers.push(window.setTimeout(r, wait))
      })
      if (cancelled) return
      setFadeOut(true)
      await new Promise((r) => {
        timers.push(window.setTimeout(r, 400))
      })
      if (!cancelled) setPhase('hide')
    }

    setPhase('show')
    requestAnimationFrame(() => {
      void hideNativeSplash()
    })

    const poll = window.setInterval(() => {
      if (pageIsReady()) {
        window.clearInterval(poll)
        void finish()
      }
    }, 100)
    timers.push(poll)

    const onLoad = () => void finish()
    if (pageIsReady()) {
      void finish()
    } else {
      window.addEventListener('load', onLoad, { once: true })
    }

    timers.push(window.setTimeout(() => void finish(), MAX_WAIT_MS))

    return () => {
      cancelled = true
      window.removeEventListener('load', onLoad)
      timers.forEach((id) => window.clearTimeout(id))
      window.clearInterval(poll)
    }
  }, [])

  if (phase !== 'show') return null

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-opacity duration-300 ${
        fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{ backgroundColor: BRAND_BLUE }}
      aria-hidden={fadeOut}
      role="status"
      aria-label="Ouverture de MES POCHES"
    >
      <div className="relative flex flex-col items-center">
        <motion.span
          aria-hidden
          className="absolute left-1/2 top-[60px] h-[140px] w-[140px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/30"
          initial={{ scale: 0.4, opacity: 0.8 }}
          animate={{ scale: 1.55, opacity: 0 }}
          transition={{ duration: 1.15, ease: 'easeOut', repeat: Infinity, repeatDelay: 0.25 }}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.35 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 16 }}
          className="relative"
        >
          <motion.div
            animate={{ y: [0, -7, 0], scale: [1, 1.045, 1] }}
            transition={{ duration: 1.7, repeat: Infinity, ease: 'easeInOut' }}
            className="rounded-full shadow-[0_18px_50px_-18px_rgba(0,0,0,0.45)]"
          >
            <AppLogo size="xl" priority className="shadow-lg" />
          </motion.div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="mt-7 font-display text-xl tracking-wide text-white"
        >
          MES POCHES
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="mt-1 text-sm text-white/80"
        >
          Vos finances, en poche
        </motion.p>
      </div>

      <div className="absolute bottom-16 left-1/2 w-44 -translate-x-1/2">
        <div className="h-0.5 overflow-hidden rounded-full bg-white/25">
          <span className="loading-bar-indeterminate block h-full w-1/2 rounded-full bg-white" />
        </div>
        <p className="mt-3 text-center text-xs text-white/70">Chargement…</p>
      </div>
    </div>
  )
}
