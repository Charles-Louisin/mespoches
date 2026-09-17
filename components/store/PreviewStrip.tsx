'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { PREVIEW_SCREENS } from './screens'

export default function PreviewStrip() {
  const scroller = useRef<HTMLDivElement>(null)
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(false)

  const sync = useCallback(() => {
    const el = scroller.current
    if (!el) return
    const max = el.scrollWidth - el.clientWidth
    setCanLeft(el.scrollLeft > 6)
    setCanRight(max > 6 && el.scrollLeft < max - 6)
  }, [])

  useEffect(() => {
    const el = scroller.current
    if (!el) return
    sync()
    const ro = new ResizeObserver(sync)
    ro.observe(el)
    el.addEventListener('scroll', sync, { passive: true })
    return () => {
      ro.disconnect()
      el.removeEventListener('scroll', sync)
    }
  }, [sync])

  const scrollByCard = (dir: 1 | -1) => {
    const el = scroller.current
    if (!el) return
    const card = el.querySelector<HTMLElement>('[data-preview-card]')
    const step = (card?.offsetWidth ?? 200) + 16
    el.scrollBy({ left: dir * step, behavior: 'smooth' })
  }

  return (
    <div className="relative">
      <button
        type="button"
        className="preview-chevron left-2"
        aria-label="Précédent"
        disabled={!canLeft}
        onClick={() => scrollByCard(-1)}
      >
        <ChevronLeft size={22} />
      </button>
      <button
        type="button"
        className="preview-chevron right-2"
        aria-label="Suivant"
        disabled={!canRight}
        onClick={() => scrollByCard(1)}
      >
        <ChevronRight size={22} />
      </button>

      <div ref={scroller} className="preview-scroller">
        {PREVIEW_SCREENS.map((s) => (
          <div key={s.id} data-preview-card className="preview-card">
            {s.node}
          </div>
        ))}
      </div>
    </div>
  )
}
