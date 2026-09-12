'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import {
  ArrowDown,
  Bell,
  Download,
  Mic,
  Receipt,
  Wallet,
} from 'lucide-react'
import AppLogo from '@/components/AppLogo'
import LandingHomePreview, {
  LandingPhoneFrame,
} from '@/components/LandingHomePreview'

const APK_URL = process.env.NEXT_PUBLIC_APK_URL?.trim() || '/mes-poches.apk'

const FEATURES = [
  {
    icon: Bell,
    title: 'Lecture automatique des notifications',
    text: 'MoMo, Orange Money, SMS banque : l’app lit la notification, prépare la transaction. Vous ouvrez, vous validez. Pas besoin de tout retaper.',
  },
  {
    icon: Receipt,
    title: 'Le ticket papier ne se perd plus.',
    text: 'Une photo du reçu. L’app sort le montant et les lignes. Vous confirmez. C\'est dans la poche.',
  },
  {
    icon: Mic,
    title: 'La flemme de taper ? Parlez.',
    text: '« Deux mille transport. » L’app crée la transaction. Vous validez. C’est OKAY.',
  },
  {
    icon: Wallet,
    title: 'Cash, MoMo, banque : plus de mélange.',
    text: 'Chaque poche a son solde. Vous savez ce qu’il reste vraiment.',
  },
]

function ScrollStage({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [11, 0, -7])
  const y = useTransform(scrollYProgress, [0, 1], [56, -36])
  const opacity = useTransform(scrollYProgress, [0, 0.22, 0.78, 1], [0.18, 1, 1, 0.28])

  return (
    <div ref={ref} style={{ perspective: '1400px' }}>
      <motion.div
        style={
          reduce
            ? undefined
            : {
                rotateX,
                y,
                opacity,
                transformStyle: 'preserve-3d',
              }
        }
      >
        {children}
      </motion.div>
    </div>
  )
}

export default function DownloadLandingPage() {
  const heroRef = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })
  const heroTilt = useTransform(scrollYProgress, [0, 1], [0, -12])
  const heroShift = useTransform(scrollYProgress, [0, 1], [0, 72])

  return (
    <div className="landing-root min-h-dvh text-[#e8edf6] antialiased">
      <div className="landing-grain" aria-hidden />

      <header className="relative z-20 mx-auto flex max-w-6xl items-center justify-between px-6 py-6 lg:px-8">
        <a href="#top" className="flex items-center gap-3">
          <AppLogo size="sm" priority />
          <span className="font-display text-lg tracking-wide">MES POCHES</span>
        </a>
        <nav className="hidden items-center gap-8 text-sm text-white/60 md:flex">
          <a href="#produit" className="hover:text-white">
            Comment ça marche
          </a>
          <a href="#telecharger" className="hover:text-white">
            Télécharger
          </a>
          <Link href="/legal" className="hover:text-white">
            Mentions légales
          </Link>
        </nav>
        <a
          href={APK_URL}
          download
          className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#0b1220] transition hover:bg-primary-100"
        >
          Télécharger l&apos;APK
        </a>
      </header>

      <section
        id="top"
        ref={heroRef}
        className="relative z-10 mx-auto grid max-w-6xl items-center gap-14 px-6 pb-24 pt-8 lg:grid-cols-[1.02fr_0.98fr] lg:px-8 lg:pb-32 lg:pt-10"
      >
        <div>
          <h1 className="max-w-xl font-display text-[2.7rem] leading-[0.98] tracking-tight text-white sm:text-[3.8rem] lg:text-[4.6rem]">
            Application de
            <br />
            <em className="font-display not-italic text-primary-300">
              gestion des finances
            </em>
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-white/68">
          MES POCHES gère tout. <br/>
          La meilleure application pour gérer tes finances sans faire d'éfforts.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href={APK_URL}
              download
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary-500 px-8 py-4 text-base font-semibold text-white shadow-[0_18px_50px_-16px_rgba(37,99,235,0.85)] transition hover:bg-primary-400"
            >
              <Download size={20} />
              Télécharger l’application
            </a>
          </div>
        </div>

        <motion.div
          className="flex justify-center"
          style={
            reduce
              ? undefined
              : {
                  rotateX: heroTilt,
                  y: heroShift,
                  transformStyle: 'preserve-3d',
                  perspective: 1200,
                }
          }
        >
          <LandingPhoneFrame>
            <LandingHomePreview />
          </LandingPhoneFrame>
        </motion.div>
      </section>

      <section id="produit" className="relative z-10 mx-auto max-w-6xl px-6 pb-24 lg:px-8">
        <ScrollStage>
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-8 backdrop-blur-sm lg:p-14">
            <p className="text-xs uppercase tracking-[0.24em] text-white/40">
              Comment ça marche ?
            </p>
            <h2 className="mt-3 max-w-3xl font-display text-3xl leading-tight text-white lg:text-5xl">
              Vous n’avez pas le temps de tenir un cahier ? L’app le tient à votre
              place.
            </h2>
            <div className="mt-12 grid gap-8 sm:grid-cols-2">
              {FEATURES.map(({ icon: Icon, title, text }) => (
                <article key={title} className="border-t border-white/10 pt-6">
                  <Icon size={22} className="text-primary-300" />
                  <h3 className="mt-4 font-display text-2xl text-white">{title}</h3>
                  <p className="mt-2 max-w-sm text-[15px] leading-relaxed text-white/55">
                    {text}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </ScrollStage>
      </section>

      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-24 lg:px-8">
        <ScrollStage>
          <div className="grid items-end gap-12 lg:grid-cols-[0.9fr_1.1fr]">
            <h2 className="font-display text-4xl leading-tight text-white lg:text-5xl">
              Trois secondes.
              <br />
              Le mois est à jour.
            </h2>
            <ol className="space-y-0">
              {[
                'Notification, image ou voice. L’app crée déjà la ligne.',
                'Vous ouvrez «Transaction à valider ». Un tap : c’est dans la poche.',
                'le solde est ajusté.',
              ].map((line, i) => (
                <li
                  key={line}
                  className="flex gap-5 border-t border-white/10 py-6 text-lg text-white/70"
                >
                  <span className="font-display text-2xl text-primary-300">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {line}
                </li>
              ))}
            </ol>
          </div>
        </ScrollStage>
      </section>

      <section
        id="telecharger"
        className="relative z-10 mx-auto max-w-6xl px-6 pb-28 lg:px-8"
      >
        <ScrollStage>
          <div className="overflow-hidden rounded-[2.2rem] bg-gradient-to-br from-primary-600 via-primary-700 to-[#152046] px-8 py-14 text-center lg:px-20 lg:py-20">
            <p className="text-xs uppercase tracking-[0.28em] text-white/55">
              Téléchargement Gratuit
            </p>
            <h2 className="mx-auto mt-4 max-w-2xl font-display text-4xl text-white lg:text-6xl">
              Arrêtez de perdre le fil.
            </h2>
            <p className="mx-auto mt-5 max-w-md text-white/70">
              Installez MES POCHES. Autorisez les notifications. <br/>
              Laissez MES POCHES gérer vos finances.
            </p>
            <a
              href={APK_URL}
              download
              className="mt-10 inline-flex items-center gap-2 rounded-full bg-white px-10 py-4 text-lg font-semibold text-[#0b1220] shadow-[0_20px_50px_-18px_rgba(0,0,0,0.45)] transition hover:bg-primary-50"
            >
              <Download size={22} />
              Télécharger l’application
            </a>
          </div>
        </ScrollStage>
      </section>

      <footer className="relative z-10 border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 text-sm text-white/45 md:flex-row md:items-center md:justify-between lg:px-8">
          <p>© {new Date().getFullYear()} MES POCHES</p>
          <nav className="flex flex-wrap gap-x-6 gap-y-2">
            <Link href="/legal" className="hover:text-white">
              Informations légales
            </Link>
            <Link href="/legal/privacy" className="hover:text-white">
              Confidentialité
            </Link>
            <Link href="/legal/terms" className="hover:text-white">
              Conditions d&apos;utilisation
            </Link>
            <Link href="/legal/mentions" className="hover:text-white">
              Mentions légales
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
