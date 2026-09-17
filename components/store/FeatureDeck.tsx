'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const SLIDES = [
  {
    id: 'sms',
    kicker: 'Lecture notification',
    title: (
      <>
        Le SMS arrive.{' '}
        <em className="store-em">La ligne est déjà prête.</em>
      </>
    ),
    body: (
      <>
        Orange Money, MTN, la banque. <span className="store-k">MES POCHES lit</span> le
        message, extrait le montant, le compte, le type et le libéllé. Et vous <span className="store-k">validez</span>.
        Tout simplement.
      </>
    ),
    Art: ArtSms,
  },
  {
    id: 'scan',
    kicker: 'Scan image',
    title: (
      <>
        Un ticket. Une photo.{' '}
        <em className="store-em">C’est noté.</em>
      </>
    ),
    body: (
      <>
        Cadrez le reçu. L’app <span className="store-k">extrait</span> le total, la date, les
        articles. Un regard, un tap — en quelques secondes, c’est dans la poche.
      </>
    ),
    Art: ArtScan,
  },
  {
    id: 'voice',
    kicker: 'note vocale',
    title: (
      <>
        Dites-le.{' '}
        <em className="store-em">Le solde suit.</em>
      </>
    ),
    body: (
      <>
        « Deux mille, transport. » La dictée <span className="store-k">propose</span> la
        transaction. Vous confirmez. Cash, MoMo ou banque : la bonne poche{' '}
        <span className="store-k">bouge</span>.
      </>
    ),
    Art: ArtVoice,
  },
  {
    id: 'wallets',
    kicker: 'plusieurs poches',
    title: (
      <>
        Chaque argent a{' '}
        <em className="store-em">sa poche.</em>
      </>
    ),
    body: (
      <>
        Espèces, mobile money, compte bancaire : <span className="store-k">séparés</span>. Plus
        de mélange dans la tête. Vous savez exactement ce qu’il reste,{' '} et
        <span className="store-k"> où</span>.
      </>
    ),
    Art: ArtWallets,
  },
  {
    id: 'control',
    kicker: 'le contrôle',
    title: (
      <>
        Rien ne passe{' '}
        <em className="store-em">sans votre feu vert.</em>
      </>
    ),
    body: (
      <>
        Les détections attendent dans <span className="store-k">À valider</span>. Vous pouvez modifier,
        confirmer, ignorer. Vous avez <span className="store-k">toujours</span> le dernier mot.
      </>
    ),
    Art: ArtControl,
  },
]

export default function FeatureDeck() {
  const [i, setI] = useState(0)
  const [leaving, setLeaving] = useState<number | null>(null)
  const [dir, setDir] = useState<1 | -1>(1)
  const busy = leaving !== null
  const iRef = useRef(i)
  const busyRef = useRef(busy)
  const swipe = useRef({ x: 0, y: 0, on: false })
  iRef.current = i
  busyRef.current = busy

  const go = (next: number, d: 1 | -1) => {
    if (busy || next === i) return
    setDir(d)
    setLeaving(i)
    setI(next)
  }

  const onPointerDown = (e: React.PointerEvent) => {
    swipe.current = { x: e.clientX, y: e.clientY, on: true }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const onPointerUp = (e: React.PointerEvent) => {
    if (!swipe.current.on) return
    swipe.current.on = false
    if (busyRef.current) return
    const dx = e.clientX - swipe.current.x
    const dy = e.clientY - swipe.current.y
    if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy) * 1.15) return
    const n = SLIDES.length
    const cur = iRef.current
    if (dx < 0) go((cur + 1) % n, 1)
    else go((cur - 1 + n) % n, -1)
  }

  useEffect(() => {
    if (leaving === null) return
    const t = window.setTimeout(() => setLeaving(null), 780)
    return () => window.clearTimeout(t)
  }, [leaving])

  const current = SLIDES[i]
  const outgoing = leaving !== null ? SLIDES[leaving] : null

  return (
    <div className="mx-auto max-w-6xl px-5 lg:px-8">
      <div
        className="feature-frame"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          swipe.current.on = false
        }}
      >
        {outgoing ? (
          <div
            key={`out-${outgoing.id}`}
            className={`feature-layer is-exit dir-${dir === 1 ? 'next' : 'prev'}`}
            onAnimationEnd={(e) => {
              if (e.target === e.currentTarget) setLeaving(null)
            }}
          >
            <Slide slide={outgoing} />
          </div>
        ) : null}
        <div
          key={`in-${current.id}`}
          className={`feature-layer ${outgoing ? `is-enter dir-${dir === 1 ? 'next' : 'prev'}` : ''}`}
        >
          <Slide slide={current} />
        </div>
      </div>

      <div className="mt-8 flex items-center justify-center gap-3">
        <button
          type="button"
          className="feature-nav"
          aria-label="Slide précédent"
          disabled={busy}
          onClick={() => go((i - 1 + SLIDES.length) % SLIDES.length, -1)}
        >
          <ChevronLeft size={18} />
        </button>
        <div className="flex gap-1.5">
          {SLIDES.map((s, n) => (
            <button
              key={s.id}
              type="button"
              aria-label={`Slide ${n + 1}`}
              disabled={busy}
              onClick={() => go(n, n > i ? 1 : -1)}
              className={`h-1.5 rounded-full transition-all ${n === i ? 'w-7 bg-[#2563EB]' : 'w-1.5 bg-[#2563EB]/25'}`}
            />
          ))}
        </div>
        <button
          type="button"
          className="feature-nav"
          aria-label="Slide suivant"
          disabled={busy}
          onClick={() => go((i + 1) % SLIDES.length, 1)}
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  )
}

function Slide({ slide }: { slide: (typeof SLIDES)[number] }) {
  const Art = slide.Art
  return (
    <div className="feature-grid">
      <div className="feature-art">
        <Art />
      </div>
      <div className="feature-copy">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#2563EB]">
          {slide.kicker}
        </p>
        <h2 className="mt-3 font-display text-[2.1rem] leading-[1.12] tracking-tight text-[#111] sm:text-5xl">
          {slide.title}
        </h2>
        <p className="mt-6 max-w-md text-[17px] leading-[1.7] text-[#4a4458]">{slide.body}</p>
      </div>
    </div>
  )
}

function ArtSms() {
  return (
    <div className="art-stage">
      <div className="art-phone">
        <div className="art-phone-screen">
          <div className="h-1.5 w-10 rounded-full bg-white/20" />
          <div className="mt-4 space-y-1.5">
            <div className="h-2 w-16 rounded bg-white/25" />
            <div className="h-2 w-24 rounded bg-white/15" />
          </div>
        </div>
      </div>
      <div className="art-sms">
        <p className="text-[9px] font-semibold uppercase tracking-wider text-[#2563EB]">Orange Money</p>
        <p className="mt-1 text-[13px] font-bold text-[#111]">−25 000 F</p>
        <p className="mt-0.5 text-[10px] text-[#666]">Transfert reçu · à valider</p>
      </div>
      <div className="art-orb art-orb-a" />
      <div className="art-orb art-orb-b" />
    </div>
  )
}

function ArtScan() {
  return (
    <div className="art-stage">
      <div className="art-receipt">
        <div className="h-2 w-16 rounded bg-[#111]/15" />
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-[10px] text-[#333]">
            <span>Pain</span>
            <span>800</span>
          </div>
          <div className="flex justify-between text-[10px] text-[#333]">
            <span>Lait</span>
            <span>1 200</span>
          </div>
          <div className="flex justify-between text-[10px] text-[#333]">
            <span>Huile</span>
            <span>3 500</span>
          </div>
          <div className="mt-2 border-t border-dashed border-[#111]/20 pt-2 text-[12px] font-bold">
            Total 5 500 F
          </div>
        </div>
        <div className="art-scanline" />
      </div>
      <div className="art-lens" />
    </div>
  )
}

function ArtVoice() {
  return (
    <div className="art-stage">
      <div className="art-mic">
        <div className="art-mic-head" />
        <div className="art-mic-stem" />
        <div className="art-mic-base" />
      </div>
      <span className="art-ring r1" />
      <span className="art-ring r2" />
      <span className="art-ring r3" />
      <p className="art-quote">« deux mille, transport »</p>
    </div>
  )
}

function ArtWallets() {
  return (
    <div className="art-stage">
      <div className="art-card c1">
        <span>Cash</span>
        <b>42 000</b>
      </div>
      <div className="art-card c2">
        <span>Orange</span>
        <b>86 500</b>
      </div>
      <div className="art-card c3">
        <span>Banque</span>
        <b>88 800</b>
      </div>
    </div>
  )
}

function ArtControl() {
  return (
    <div className="art-stage">
      <div className="art-pending">
        <p className="text-[10px] font-semibold text-[#2563EB]">À valider</p>
        <p className="mt-2 text-2xl font-bold text-[#111]">−2 000 F</p>
        <p className="text-sm text-[#555]">Transport</p>
        <div className="mt-4 flex gap-2">
          <span className="rounded-full bg-[#2563EB] px-3 py-1 text-[10px] font-semibold text-white">
            Valider
          </span>
          <span className="rounded-full border border-[#2563EB] px-3 py-1 text-[10px] font-semibold text-[#2563EB]">
            Ignorer
          </span>
        </div>
      </div>
      <div className="art-stamp">OK</div>
    </div>
  )
}
