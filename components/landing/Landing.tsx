'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import Link from 'next/link'
import AppLogo from '@/components/AppLogo'
import { DownloadApkButton } from '@/components/store/DownloadApkButton'
import SiteFooter from './SiteFooter'
import { AnalyticsScreen, HomeScreen, PendingScreen, WalletsScreen } from '@/components/store/screens'
import './landing.css'

/* ─────────────────────────── Données ─────────────────────────── */

// Seuls formats validés sur de vrais SMS (backend/src/tests/real-sms-parser.test.ts) : ils portent un ID de transaction.
const OPERATORS = ['Orange Money', 'MTN MoMo']

const STEPS = [
  {
    id: 'capture',
    n: '01',
    title: 'Capturez sans taper',
    body: 'Le SMS Orange Money arrive, vous photographiez un ticket ou vous dites « deux mille, transport ». MES POCHES lit le montant, la poche, la catégorie et le libellé.',
    screen: <PendingScreen />,
  },
  {
    id: 'validate',
    n: '02',
    title: 'Validez d’un geste',
    body: 'Chaque ligne proposée attend votre « oui ». Le solde de la bonne poche bouge aussitôt : cash, mobile money ou banque, chaque argent reste à sa place.',
    screen: <WalletsScreen />,
  },
  {
    id: 'understand',
    n: '03',
    title: 'Comprenez où part l’argent',
    body: 'Analyses du mois, budgets par catégorie, objectifs d’épargne et dépenses prévues : vous voyez la fuite avant la fin du mois, pas après.',
    screen: <AnalyticsScreen />,
  },
] as const

const FEATURES: { title: string; body: string; icon: ReactNode; tone: string }[] = [
  {
    title: 'Lecture des notifications',
    body: 'Orange Money et MTN MoMo : chaque paiement confirmé est préparé dès la notification.',
    icon: <path d="M4 5h16v11H8l-4 4V5Z" />,
    tone: 'blue',
  },
  {
    title: 'Scan de tickets',
    body: 'Une photo du reçu : total, date et articles extraits en quelques secondes.',
    icon: (
      <>
        <path d="M4 8V5h3M17 5h3v3M20 16v3h-3M7 19H4v-3" />
        <path d="M8 12h8" />
      </>
    ),
    tone: 'amber',
  },
  {
    title: 'Note vocale',
    body: 'Dites la dépense à voix haute, l’app propose la ligne. Idéal entre deux courses.',
    icon: (
      <>
        <rect x="9" y="3" width="6" height="11" rx="3" />
        <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
      </>
    ),
    tone: 'green',
  },
  {
    title: 'Plusieurs poches',
    body: 'Espèces, mobile money, comptes bancaires : séparés, transférables, toujours à jour.',
    icon: (
      <>
        <rect x="3" y="6" width="18" height="13" rx="3" />
        <path d="M16 12.5h2M3 10h18" />
      </>
    ),
    tone: 'blue',
  },
  {
    title: 'Budgets & épargne',
    body: 'Un plafond par catégorie, un objectif par projet. L’app vous prévient avant le dépassement.',
    icon: (
      <>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    tone: 'red',
  },
  {
    title: 'Export & rapports',
    body: 'CSV, PDF ou Excel pour votre comptable, votre association ou vous-même.',
    icon: (
      <>
        <path d="M6 3h8l4 4v14H6V3Z" />
        <path d="M14 3v4h4M9 13h6M9 17h6" />
      </>
    ),
    tone: 'green',
  },
]

const TIERS = [
  { id: 'free', label: 'Gratuit', monthly: 0, desc: 'Pour démarrer et prendre l’habitude.', perks: ['5 poches', '5 catégories', '3 scans et 3 notes vocales / mois', '3 mois d’historique'] },
  // Limites identiques à backend/src/config/planLimits.ts (TIER_DEFS)
  { id: 'pro', label: 'Pro', monthly: 2500, desc: 'Le suivi complet au quotidien.', perks: ['20 poches', '100 catégories', '30 scans et 30 notes vocales / mois', 'Budgets, analyses, historique complet', 'Export PDF'], highlight: true },
  { id: 'pro_plus', label: 'Pro+', monthly: 6000, desc: 'Pour les gros volumes.', perks: ['50 poches', '200 catégories', '100 scans et 100 notes vocales / mois', 'Exports PDF, Excel et CSV'] },
  { id: 'business', label: 'Business', monthly: 20000, desc: 'Commerce, association, équipe.', perks: ['Poches et catégories illimitées', '500 scans et 500 notes vocales / mois', 'Exports sur une plage de dates', 'Export par catégorie'] },
] as const

const FAQ = [
  {
    q: 'Pourquoi l’app n’est pas encore sur le Play Store ?',
    a: 'La publication est en cours. En attendant, l’APK officiel est téléchargé depuis notre dépôt. Play Protect peut afficher un avertissement : notre guide montre comment le suspendre un jour seulement, sans désactiver la protection.',
  },
  {
    q: 'L’app lit-elle mes SMS ou toutes mes notifications ?',
    a: 'Elle ne lit jamais votre boîte SMS. Avec votre accord, elle lit les notifications de vos opérateurs et ne retient que les confirmations de paiement, de transfert ou de retrait qui portent un ID de transaction. Une demande de paiement, un code ou une promo sont ignorés. Rien n’est enregistré sans votre validation, et la fonction se coupe à tout moment dans les réglages.',
  },
  {
    q: 'Quels opérateurs sont reconnus ?',
    a: 'Orange Money et MTN MoMo. Pour les autres moyens (Wave, banque, espèces), ajoutez la dépense en photo, à la voix ou à la main : l’app propose la catégorie.',
  },
  {
    q: 'Comment payer un forfait ?',
    a: 'Depuis l’app, par mobile money dans 21 pays d’Afrique ou par carte Visa/Mastercard depuis n’importe où. Les frais de l’opérateur sont affichés avant validation. Vous gardez la version gratuite aussi longtemps que vous voulez.',
  },
  {
    q: 'Et sur iPhone ?',
    a: 'La version iOS arrive. Laissez l’app installée sur Android ou revenez bientôt : le même compte fonctionnera sur les deux.',
  },
]

const fmt = (n: number) => n.toLocaleString('fr-FR').replace(/ /g, ' ')

/* ─────────────────────────── Hooks ─────────────────────────── */

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReduced(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])
  return reduced
}

/** Révélation au scroll : ajoute .is-in une fois l'élément visible (une seule fois). */
function useReveal(ready: boolean) {
  useEffect(() => {
    if (!ready) return
    const nodes = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]:not(.is-in)'))
    if (!('IntersectionObserver' in window)) {
      nodes.forEach((n) => n.classList.add('is-in'))
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('is-in')
            io.unobserve(e.target)
          }
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.12 }
    )
    nodes.forEach((n) => io.observe(n))
    return () => io.disconnect()
  }, [ready])
}

/* ─────────────────────────── Page ─────────────────────────── */

export default function Landing() {
  const reduced = usePrefersReducedMotion()
  const [loaded, setLoaded] = useState(false)
  const [showBar, setShowBar] = useState(false)
  const heroRef = useRef<HTMLElement>(null)
  useReveal(loaded)

  // Barre de téléchargement collante (mobile) quand le hero n'est plus visible.
  useEffect(() => {
    const el = heroRef.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setShowBar(!e.isIntersecting), { threshold: 0.05 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div className={`lp ${loaded ? 'is-loaded' : ''}`}>
      <Loader reduced={reduced} onDone={() => setLoaded(true)} />
      <Nav />

      <main id="contenu">
        <Hero heroRef={heroRef} />
        <OperatorMarquee />
        <Pains />
        <HowItWorks />
        <Features />
        <Pricing />
        <Faq />
        <FinalCta />
      </main>

      <SiteFooter />

      <div className={`lp-bar ${showBar ? 'is-on' : ''}`} aria-hidden={!showBar}>
        <AppLogo size="xs" />
        <div className="lp-bar-copy">
          <strong>MES POCHES</strong>
          <span>Gratuit · Android</span>
        </div>
        <DownloadApkButton className="lp-btn lp-btn-primary lp-btn-sm">Télécharger</DownloadApkButton>
      </div>
    </div>
  )
}

/* ─────────────────────────── Loader ─────────────────────────── */

function Loader({ reduced, onDone }: { reduced: boolean; onDone: () => void }) {
  const [phase, setPhase] = useState<'on' | 'leaving' | 'off'>('on')

  useEffect(() => {
    let seen = false
    try {
      seen = sessionStorage.getItem('mp-loader') === '1'
      sessionStorage.setItem('mp-loader', '1')
    } catch {
      /* stockage indisponible : on joue le loader */
    }
    const quick = seen || reduced
    const minShow = quick ? 0 : 1050
    const start = performance.now()

    const finish = () => {
      const wait = Math.max(0, minShow - (performance.now() - start))
      window.setTimeout(() => {
        setPhase('leaving')
        onDone()
        window.setTimeout(() => setPhase('off'), quick ? 0 : 650)
      }, wait)
    }
    if (document.readyState === 'complete') finish()
    else window.addEventListener('load', finish, { once: true })
    // Filet : ne jamais bloquer la page plus de 2,5 s (réseau lent).
    const safety = window.setTimeout(finish, 2500)
    return () => {
      window.removeEventListener('load', finish)
      window.clearTimeout(safety)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (phase === 'off') return null
  return (
    <div className={`lp-loader ${phase === 'leaving' ? 'is-leaving' : ''}`} role="status" aria-label="Chargement de MES POCHES">
      <div className="lp-loader-mark">
        <span className="lp-loader-ring" />
        <AppLogo size="md" priority />
      </div>
      <p className="lp-loader-word">
        <span>Chaque</span> <span>franc</span> <span>à</span> <span>sa</span> <span>place</span>
      </p>
      <span className="lp-loader-bar" aria-hidden />
    </div>
  )
}

/* ─────────────────────────── Navigation ─────────────────────────── */

function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Menu plein écran : page figée derrière, Échap pour fermer.
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  const links = [
    ['#comment', 'Comment ça marche'],
    ['#fonctionnalites', 'Fonctionnalités'],
    ['#tarifs', 'Tarifs'],
    ['#faq', 'Questions'],
  ] as const

  return (
    <>
      <header className={`lp-nav ${scrolled ? 'is-scrolled' : ''}`}>
        <a href="#contenu" className="lp-skip">
          Aller au contenu
        </a>
        <div className="lp-shell lp-nav-row">
          <a href="#top" className="lp-brand" aria-label="MES POCHES, accueil">
            <AppLogo size="xs" priority />
            <span>MES POCHES</span>
          </a>
          <nav className="lp-nav-links" aria-label="Sections">
            {links.map(([href, label]) => (
              <a key={href} href={href}>
                {label}
              </a>
            ))}
          </nav>
          <div className="lp-nav-cta">
            <Link href="/login" className="lp-btn lp-btn-ghost lp-btn-sm lp-nav-login">
              Connexion
            </Link>
            <DownloadApkButton className="lp-btn lp-btn-primary lp-btn-sm">Télécharger</DownloadApkButton>
            <button
              type="button"
              className="lp-burger"
              aria-expanded={open}
              aria-controls="lp-menu"
              aria-label="Ouvrir le menu"
              onClick={() => setOpen(true)}
            >
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      <div
        id="lp-menu"
        className={`lp-menu ${open ? 'is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        hidden={!open}
      >
        <div className="lp-shell lp-nav-row">
          <a href="#top" className="lp-brand" onClick={() => setOpen(false)}>
            <AppLogo size="xs" />
            <span>MES POCHES</span>
          </a>
          <button type="button" className="lp-burger" aria-expanded="true" aria-label="Fermer le menu" onClick={() => setOpen(false)}>
            <span />
            <span />
          </button>
        </div>
        <nav className="lp-shell lp-menu-links" aria-label="Sections">
          {links.map(([href, label], i) => (
            <a key={href} href={href} onClick={() => setOpen(false)} style={{ '--d': `${60 + i * 45}ms` } as React.CSSProperties}>
              {label}
            </a>
          ))}
        </nav>
        <div className="lp-shell lp-menu-cta">
          <DownloadApkButton className="lp-btn lp-btn-primary lp-btn-lg lp-btn-block">
            <AndroidIcon />
            Télécharger pour Android
          </DownloadApkButton>
          <Link href="/login" className="lp-btn lp-btn-ghost lp-btn-lg lp-btn-block" onClick={() => setOpen(false)}>
            Connexion
          </Link>
        </div>
      </div>
    </>
  )
}

/* ─────────────────────────── Hero ─────────────────────────── */

function Hero({ heroRef }: { heroRef: React.RefObject<HTMLElement> }) {
  return (
    <section id="top" ref={heroRef} className="lp-hero">
      <div className="lp-shell lp-hero-grid">
        <div className="lp-hero-copy">
          <h1 className="lp-h1">
            <span className="lp-line">
              <span className="lp-in" style={{ '--d': '80ms' } as React.CSSProperties}>
                Chaque franc
              </span>
            </span>
            <span className="lp-line">
              <span className="lp-in lp-accent" style={{ '--d': '170ms' } as React.CSSProperties}>
                retrouve sa poche.
              </span>
            </span>
          </h1>
          <p className="lp-lead lp-in" style={{ '--d': '280ms' } as React.CSSProperties}>
            Cash, mobile money, banque : MES POCHES lit les notifications de vos paiements, scanne vos tickets et écoute vos notes
            vocales. Vous validez, le solde suit. Fini les fins de mois où l’argent a « disparu ».
          </p>
          <div className="lp-cta-row lp-in" style={{ '--d': '380ms' } as React.CSSProperties}>
            <DownloadApkButton className="lp-btn lp-btn-primary lp-btn-lg">
              <AndroidIcon />
              Télécharger gratuitement
            </DownloadApkButton>
            <a href="#comment" className="lp-btn lp-btn-ghost lp-btn-lg">
              Voir comment ça marche
            </a>
          </div>
          <ul className="lp-proof lp-in" style={{ '--d': '460ms' } as React.CSSProperties}>
            <li>
              <Check /> 1 mois Pro offert
            </li>
            <li>
              <Check /> Version gratuite à vie
            </li>
          </ul>
        </div>

        <div className="lp-hero-visual" aria-hidden>
          <div className="lp-hero-stage lp-stage-in" />
          <div className="lp-phone-rise">
            <Phone className="lp-phone-hero">
              <HomeScreen />
            </Phone>
          </div>
        </div>
      </div>
    </section>
  )
}

function OperatorMarquee() {
  return (
    <section className="lp-marquee" aria-label="Opérateurs reconnus">
      <div className="lp-shell lp-marquee-inner">
        <p className="lp-marquee-label">Reconnaît les SMS de</p>
        <ul className="lp-ops">
          {OPERATORS.map((o) => (
            <li key={o}>{o}</li>
          ))}
        </ul>
      </div>
    </section>
  )
}

/* ─────────────────────────── Problème ─────────────────────────── */

function Pains() {
  const pains = [
    ['« Où est passé mon salaire ? »', 'Le 20 du mois, le solde ne colle plus avec ce que vous pensiez avoir.'],
    ['Trois portefeuilles, zéro vue d’ensemble', 'Un peu en cash, un peu sur MoMo, le reste à la banque : impossible d’additionner de tête.'],
    ['Noter à la main, on abandonne', 'Un carnet ou un tableur tient trois jours. Ensuite, plus rien.'],
  ]
  return (
    <section className="lp-section lp-pains">
      <div className="lp-shell lp-pains-grid">
        <h2 className="lp-h2" data-reveal>
          Ce n’est pas que vous dépensez trop.{' '}
          <span className="lp-muted">C’est que personne ne note pour vous.</span>
        </h2>
        <dl className="lp-pain-list">
          {pains.map(([t, b], i) => (
            <div key={t} className="lp-pain" data-reveal style={{ '--d': `${i * 70}ms` } as React.CSSProperties}>
              <dt>{t}</dt>
              <dd>{b}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}

/* ─────────────────────────── Comment ça marche ─────────────────────────── */

function HowItWorks() {
  const [active, setActive] = useState(0)
  const refs = useRef<(HTMLElement | null)[]>([])

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.step))
        }
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
    )
    refs.current.forEach((n) => n && io.observe(n))
    return () => io.disconnect()
  }, [])

  return (
    <section id="comment" className="lp-section lp-how">
      <div className="lp-shell">
        <div className="lp-head" data-reveal>
          <h2 className="lp-h2">Trois gestes. Plus aucune saisie.</h2>
        </div>

        <div className="lp-how-grid">
          <ol className="lp-steps">
            {STEPS.map((s, i) => (
              <li
                key={s.id}
                ref={(n) => {
                  refs.current[i] = n
                }}
                data-step={i}
                className={`lp-step ${active === i ? 'is-active' : ''}`}
              >
                <span className="lp-step-n">{s.n}</span>
                <div>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="lp-how-sticky" aria-hidden>
            <div className="lp-progress">
              {STEPS.map((s, i) => (
                <span key={s.id} className={i <= active ? 'is-on' : ''} />
              ))}
            </div>
            <Phone>
              {STEPS.map((s, i) => (
                <div key={s.id} className={`lp-screen-layer ${active === i ? 'is-active' : ''}`}>
                  {s.screen}
                </div>
              ))}
            </Phone>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────── Fonctionnalités ─────────────────────────── */

function Features() {
  return (
    <section id="fonctionnalites" className="lp-section lp-features">
      <div className="lp-shell">
        <div className="lp-features-grid">
          <h2 className="lp-h2 lp-features-title" data-reveal>
            Tout ce qu’il faut pour tenir ses comptes, rien de plus.
          </h2>
          <ul className="lp-feature-list">
            {FEATURES.map((f) => (
              <li key={f.title} className="lp-feature">
                <span className={`lp-feature-ico lp-ink-${f.tone}`}>
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    {f.icon}
                  </svg>
                </span>
                <div>
                  <h3>{f.title}</h3>
                  <p>{f.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────── Tarifs ─────────────────────────── */

function Pricing() {
  const [yearly, setYearly] = useState(false)
  return (
    <section id="tarifs" className="lp-section lp-pricing">
      <div className="lp-shell">
        <div className="lp-head lp-head-center" data-reveal>
          <h2 className="lp-h2">Commencez gratuitement. Passez Pro si ça vous change la vie.</h2>
          <p className="lp-sub">La version gratuite reste la vôtre, sans limite de durée.</p>
          <div className="lp-toggle" role="group" aria-label="Période de facturation">
            <button type="button" aria-pressed={!yearly} onClick={() => setYearly(false)}>
              Mensuel
            </button>
            <button type="button" aria-pressed={yearly} onClick={() => setYearly(true)}>
              Annuel <em>−20 %</em>
            </button>
            <span className={`lp-toggle-pill ${yearly ? 'is-right' : ''}`} aria-hidden />
          </div>
        </div>

        <div className="lp-price-grid">
          {TIERS.map((t, i) => {
            const price = yearly ? Math.round(t.monthly * 12 * 0.8) : t.monthly
            return (
              <article
                key={t.id}
                className={`lp-price ${'highlight' in t && t.highlight ? 'is-highlight' : ''}`}
                data-reveal
                style={{ '--d': `${i * 80}ms` } as React.CSSProperties}
              >
                {'highlight' in t && t.highlight ? <span className="lp-badge">Recommandé</span> : null}
                <h3>{t.label}</h3>
                <p className="lp-price-desc">{t.desc}</p>
                <p className="lp-price-amount">
                  <span key={`${t.id}-${yearly}`} className="lp-price-num">
                    {t.monthly === 0 ? '0' : fmt(price)}
                  </span>
                  <span className="lp-price-unit">FCFA {t.monthly === 0 ? '' : yearly ? '/ an' : '/ mois'}</span>
                </p>
                <ul>
                  {t.perks.map((p) => (
                    <li key={p}>
                      <Check /> {p}
                    </li>
                  ))}
                </ul>
                <DownloadApkButton className={`lp-btn ${'highlight' in t && t.highlight ? 'lp-btn-primary' : 'lp-btn-outline'} lp-btn-block`}>
                  {t.monthly === 0 ? 'Commencer gratuitement' : `Choisir ${t.label}`}
                </DownloadApkButton>
              </article>
            )
          })}
        </div>

        <div className="lp-pay-note" data-reveal>
          <span className="lp-pay-ico" aria-hidden>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3 4 6v6c0 4.5 3.4 8.3 8 9 4.6-.7 8-4.5 8-9V6l-8-3Z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </span>
          <div>
            <p className="lp-pay-gift">
              <strong>1 mois Pro offert</strong> à l’inscription, sans moyen de paiement.
            </p>
            <p>
              Paiement sécurisé dans l’app : <strong>mobile money dans 21 pays d’Afrique</strong> ou <strong>carte Visa/Mastercard</strong> depuis
              l’international. Le forfait est activé dès la confirmation du paiement. Le prix affiché est le prix du forfait ; les frais de
              l’opérateur sont indiqués avant validation.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────── FAQ ─────────────────────────── */

function Faq() {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <section id="faq" className="lp-section lp-faq">
      <div className="lp-shell lp-faq-grid">
        <div className="lp-head" data-reveal>
          <h2 className="lp-h2">Ce qu’on nous demande avant d’installer.</h2>
          <p className="lp-sub">
            Une autre question ? Écrivez-nous depuis l’app, rubrique « Avis et aide ».
          </p>
        </div>
        <div className="lp-faq-list" data-reveal>
          {FAQ.map((f, i) => {
            const isOpen = open === i
            return (
              <div key={f.q} className={`lp-qa ${isOpen ? 'is-open' : ''}`}>
                <h3>
                  <button type="button" aria-expanded={isOpen} aria-controls={`qa-${i}`} id={`qa-btn-${i}`} onClick={() => setOpen(isOpen ? null : i)}>
                    {f.q}
                    <span className="lp-qa-ico" aria-hidden />
                  </button>
                </h3>
                <div id={`qa-${i}`} role="region" aria-labelledby={`qa-btn-${i}`} className="lp-qa-a">
                  <div>
                    <p>{f.a}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────── CTA final ─────────────────────────── */

function FinalCta() {
  return (
    <section className="lp-section lp-final">
      <div className="lp-shell">
        <div className="lp-final-card" data-reveal>
          <div className="lp-final-copy">
            <h2>Ce mois-ci, sachez où va chaque franc.</h2>
            <p>Installez MES POCHES en deux minutes. Votre premier SMS de transaction fera le reste.</p>
            <div className="lp-cta-row">
              <DownloadApkButton className="lp-btn lp-btn-white lp-btn-lg">
                <AndroidIcon />
                Télécharger pour Android
              </DownloadApkButton>
              <span className="lp-final-soon">iPhone : bientôt</span>
            </div>
          </div>
          <div className="lp-ledger" aria-hidden>
            <p className="lp-ledger-head">Exemple · fin du mois</p>
            {[
              ['Espèces', '18 500'],
              ['Mobile money', '64 200'],
              ['Banque', '165 800'],
            ].map(([label, amount]) => (
              <div key={label} className="lp-ledger-row">
                <span>{label}</span>
                <span>{amount} F</span>
              </div>
            ))}
            <div className="lp-ledger-row lp-ledger-total">
              <span>Total</span>
              <span>248 500 F</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────── Pied de page ─────────────────────────── */

/* ─────────────────────────── Primitives ─────────────────────────── */

function Phone({ children, className = '', small = false }: { children: ReactNode; className?: string; small?: boolean }) {
  return (
    <div className={`lp-phone ${small ? 'lp-phone-sm' : ''} ${className}`}>
      <div className="lp-phone-island" />
      <div className="lp-phone-screen">{children}</div>
    </div>
  )
}

function Check() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  )
}

function AndroidIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden>
      <path d="M17.6 9.5 19.3 6.6a.4.4 0 0 0-.7-.4l-1.7 3a10.6 10.6 0 0 0-9.8 0l-1.7-3a.4.4 0 1 0-.7.4L6.4 9.5A9.6 9.6 0 0 0 1.5 17h21a9.6 9.6 0 0 0-4.9-7.5ZM7 14.3a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm10 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z" />
    </svg>
  )
}
