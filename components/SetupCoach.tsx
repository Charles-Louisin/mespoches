'use client'

import { useCallback, useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import type { CSSProperties } from 'react'
import {
  COACH_STEPS,
  getSetupStep,
  isSetupActive,
  setSetupStep,
  subscribeSetupStep,
  type SetupStep,
} from '@/lib/setupGuide'

type Rect = { top: number; left: number; width: number; height: number }

const PAD = 10
const COACH_Z = '90'
const EDGE = 20
const TIP_H = 150

function isFormStep(step: SetupStep): boolean {
  return step === 'wallet-form' || step === 'category-form'
}

function readTargetRect(id: string): Rect | null {
  const el = document.querySelector(`[data-coach="${id}"]`) as HTMLElement | null
  if (!el) return null
  const r = el.getBoundingClientRect()
  if (r.width < 2 && r.height < 2) return null
  return {
    top: Math.max(0, r.top - PAD),
    left: Math.max(0, r.left - PAD),
    width: r.width + PAD * 2,
    height: r.height + PAD * 2,
  }
}

function elevateTarget(id: string, step: SetupStep): () => void {
  // Formulaires : pas d'élévation (interaction via le trou du voile)
  if (isFormStep(step)) return () => undefined

  const el = document.querySelector(`[data-coach="${id}"]`) as HTMLElement | null
  if (!el) return () => undefined

  const prev = {
    position: el.style.position,
    zIndex: el.style.zIndex,
    pointerEvents: el.style.pointerEvents,
  }
  const computed = window.getComputedStyle(el)
  if (computed.position === 'static') {
    el.style.position = 'relative'
  }
  el.style.zIndex = COACH_Z
  el.style.pointerEvents = 'auto'
  el.classList.add('coach-target-live')

  return () => {
    el.style.position = prev.position
    el.style.zIndex = prev.zIndex
    el.style.pointerEvents = prev.pointerEvents
    el.classList.remove('coach-target-live')
  }
}

function advanceAfterNav(step: SetupStep) {
  if (step === 'nav-wallets') setSetupStep('wallets-add')
  if (step === 'nav-categories') setSetupStep('categories-add')
}

function computeTipStyle(rect: Rect, vw: number, vh: number): CSSProperties {
  const tipMaxW = Math.min(300, Math.max(200, vw - EDGE * 2))
  const preferLeft = rect.left + rect.width / 2 - tipMaxW / 2
  const left = Math.min(
    Math.max(EDGE, preferLeft),
    Math.max(EDGE, vw - tipMaxW - EDGE)
  )

  const placeAbove = rect.top + rect.height / 2 > vh * 0.5
  if (placeAbove) {
    return {
      left,
      top: Math.max(EDGE, rect.top - TIP_H - 12),
      width: tipMaxW,
      maxWidth: tipMaxW,
    }
  }

  return {
    left,
    top: Math.max(
      EDGE,
      Math.min(rect.top + rect.height + 14, vh - TIP_H - EDGE)
    ),
    width: tipMaxW,
    maxWidth: tipMaxW,
  }
}

export default function SetupCoach() {
  const pathname = usePathname()
  const router = useRouter()
  const [step, setStep] = useState<SetupStep>(null)
  const [rect, setRect] = useState<Rect | null>(null)
  const [ready, setReady] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setStep(getSetupStep())
    return subscribeSetupStep(setStep)
  }, [])

  const syncRect = useCallback(() => {
    if (!step || step === 'done') {
      setRect(null)
      return
    }
    setRect(readTargetRect(COACH_STEPS[step].target))
  }, [step])

  useEffect(() => {
    if (!step || step === 'done') {
      setReady(false)
      setRect(null)
      return
    }

    const meta = COACH_STEPS[step]
    if (meta.paths && meta.paths.length > 0) {
      const ok = meta.paths.some(
        (p) => pathname === p || pathname.startsWith(`${p}/`)
      )
      if (!ok) {
        if (step === 'wallets-add') router.replace('/wallets')
        if (step === 'wallet-form') router.replace('/wallets/new')
        if (step === 'categories-add' || step === 'category-form') {
          router.replace('/categories?setup=1')
        }
      }
    }

    setReady(true)
    const clearElevate = elevateTarget(meta.target, step)

    const t0 = window.setTimeout(syncRect, 50)
    const t1 = window.setTimeout(syncRect, 280)
    const t2 = window.setTimeout(syncRect, 600)

    window.addEventListener('resize', syncRect)
    window.addEventListener('scroll', syncRect, true)
    const mo = new MutationObserver(() => syncRect())
    mo.observe(document.body, { childList: true, subtree: true })

    return () => {
      clearElevate()
      window.clearTimeout(t0)
      window.clearTimeout(t1)
      window.clearTimeout(t2)
      window.removeEventListener('resize', syncRect)
      window.removeEventListener('scroll', syncRect, true)
      mo.disconnect()
    }
  }, [step, pathname, router, syncRect])

  useEffect(() => {
    if (!step || step === 'done') return
    if (step !== 'nav-wallets' && step !== 'nav-categories') return
    const el = document.querySelector(
      `[data-coach="${COACH_STEPS[step].target}"]`
    )
    if (!el) return
    const onClick = () => advanceAfterNav(step)
    el.addEventListener('click', onClick, { capture: true })
    return () => el.removeEventListener('click', onClick, { capture: true })
  }, [step, rect])

  useEffect(() => {
    if (step !== 'categories-add') return
    const el = document.querySelector('[data-coach="categories-add"]')
    if (!el) return
    const onClick = () => setSetupStep('category-form')
    el.addEventListener('click', onClick, { capture: true })
    return () => el.removeEventListener('click', onClick, { capture: true })
  }, [step, rect])

  useEffect(() => {
    if (step !== 'wallets-add') return
    const el = document.querySelector('[data-coach="wallets-add"]')
    if (!el) return
    const onClick = () => setSetupStep('wallet-form')
    el.addEventListener('click', onClick, { capture: true })
    return () => el.removeEventListener('click', onClick, { capture: true })
  }, [step, rect])

  useEffect(() => {
    if (!mounted || !ready || !step || step === 'done' || !isSetupActive()) {
      return
    }
    // Bloque le scroll tant que le guide (voile) est affiché
    const prevOverflow = document.body.style.overflow
    const prevTouch = document.body.style.touchAction
    document.body.style.overflow = 'hidden'
    document.body.style.touchAction = 'none'
    const prevent = (e: Event) => {
      e.preventDefault()
    }
    document.addEventListener('wheel', prevent, { passive: false })
    document.addEventListener('touchmove', prevent, { passive: false })
    return () => {
      document.body.style.overflow = prevOverflow
      document.body.style.touchAction = prevTouch
      document.removeEventListener('wheel', prevent)
      document.removeEventListener('touchmove', prevent)
    }
  }, [mounted, ready, step])

  if (!mounted || !ready || !step || step === 'done' || !isSetupActive()) {
    return null
  }

  const meta = COACH_STEPS[step]
  const vw = window.innerWidth
  const vh = window.innerHeight
  const showTip = !isFormStep(step)

  if (!rect) {
    return (
      <div
        className="fixed inset-0 z-[80] flex items-center justify-center bg-[#0c0e12]/70 pointer-events-auto"
        aria-live="polite"
      >
        <div className="flex flex-col items-center gap-3">
          <div className="h-1 w-40 overflow-hidden rounded-full bg-white/20">
            <div className="loading-bar-indeterminate h-full w-1/2 rounded-full bg-white" />
          </div>
          <p className="text-sm text-white/80">Préparation du guide…</p>
        </div>
      </div>
    )
  }

  const tipStyle = showTip ? computeTipStyle(rect, vw, vh) : null

  return (
    <div className="fixed inset-0 z-[80] pointer-events-none" aria-live="polite">
      <svg
        className="absolute inset-0 h-full w-full pointer-events-none"
        aria-hidden
      >
        <defs>
          <mask id="coach-mask">
            <rect width="100%" height="100%" fill="white" />
            <rect
              x={rect.left}
              y={rect.top}
              width={rect.width}
              height={rect.height}
              rx={16}
              ry={16}
              fill="black"
            />
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(12, 14, 18, 0.72)"
          mask="url(#coach-mask)"
          style={{ pointerEvents: 'none' }}
        />
      </svg>

      <div
        className="absolute rounded-2xl ring-2 ring-white pointer-events-none"
        style={{
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        }}
      />

      {(step === 'nav-wallets' ||
        step === 'nav-categories' ||
        step === 'wallets-add' ||
        step === 'categories-add') && (
        <button
          type="button"
          aria-label={meta.title}
          className="absolute z-[95] rounded-2xl bg-transparent pointer-events-auto touch-manipulation"
          style={{
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
          }}
          onClick={() => {
            const target = document.querySelector(
              `[data-coach="${meta.target}"]`
            ) as HTMLElement | null
            target?.click()
          }}
        />
      )}

      <div
        className="absolute left-0 right-0 top-0 z-[81] pointer-events-auto"
        style={{ height: Math.max(0, rect.top) }}
      />
      <div
        className="absolute left-0 right-0 bottom-0 z-[81] pointer-events-auto"
        style={{ top: rect.top + rect.height }}
      />
      <div
        className="absolute left-0 z-[81] pointer-events-auto"
        style={{
          top: rect.top,
          height: rect.height,
          width: Math.max(0, rect.left),
        }}
      />
      <div
        className="absolute right-0 z-[81] pointer-events-auto"
        style={{
          top: rect.top,
          height: rect.height,
          left: rect.left + rect.width,
        }}
      />

      {showTip && tipStyle && (
        <motion.div
          key={`tip-${step}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="absolute z-[120] pointer-events-auto rounded-2xl bg-white p-4 shadow-xl border border-black/[0.08]"
          style={tipStyle}
        >
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-primary-600">
              Guide · démarrage
            </p>
            <button
              type="button"
              onClick={() => setSetupStep('done')}
              className="p-1 -mr-1 text-gray-400 hover:text-gray-600 touch-manipulation"
              aria-label="Passer le guide"
            >
              <X size={18} />
            </button>
          </div>
          <h3 className="font-semibold text-ink text-[15px]">{meta.title}</h3>
          <p className="text-sm text-ink-soft mt-1 leading-relaxed">{meta.body}</p>
        </motion.div>
      )}
    </div>
  )
}
