'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, ChevronLeft, Shield, Wallet } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Button from '@/components/Button'
import { setOnboardingSeen } from '@/lib/auth'
import {
  WelcomePreview,
  TransactionsPreview,
  AnalyticsPreview,
} from '@/components/onboarding/OnboardingPreviews'

const slides = [
  {
    title: "Vos finances, en un coup d'œil",
    description:
      'MES POCHES centralise vos portefeuilles et votre solde global. Une interface claire, pensée pour le quotidien.',
    preview: WelcomePreview,
    highlights: ['Multi-portefeuilles', 'Solde en temps réel', 'Devise locale'],
  },
  {
    title: 'Chaque mouvement, bien enregistré',
    description:
      'Revenus, dépenses et transferts : saisissez en quelques secondes. Vos soldes se mettent à jour automatiquement.',
    preview: TransactionsPreview,
    highlights: ['Revenus & dépenses', 'Historique complet', 'Export'],
  },
  {
    title: 'Décidez en connaissance de cause',
    description:
      'Graphiques, tendances et répartition par catégorie pour mieux piloter votre budget chaque mois.',
    preview: AnalyticsPreview,
    highlights: ['Stats mensuelles', 'Par catégorie', "Vue d'ensemble"],
  },
] as const

const slideVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 48 : -48 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -48 : 48 }),
}

export default function OnboardingPage() {
  const router = useRouter()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [direction, setDirection] = useState(0)

  const isLast = currentSlide === slides.length - 1
  const progress = ((currentSlide + 1) / slides.length) * 100

  const finish = useCallback(() => {
    setOnboardingSeen()
    router.push('/login')
  }, [router])

  const goNext = () => {
    if (isLast) {
      finish()
      return
    }
    setDirection(1)
    setCurrentSlide((s) => s + 1)
  }

  const goPrev = () => {
    if (currentSlide === 0) return
    setDirection(-1)
    setCurrentSlide((s) => s - 1)
  }

  const slide = slides[currentSlide]
  const Preview = slide.preview

  return (
    <div className="min-h-screen flex flex-col bg-surface overflow-hidden">
      <header className="relative z-10 px-5 pt-6 pb-2">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 balance-gradient rounded-xl flex items-center justify-center shadow-md shadow-primary-500/25">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 leading-tight">MES POCHES</p>
              <p className="text-[10px] text-gray-500">Gestion financière</p>
            </div>
          </div>
          <button
            type="button"
            onClick={finish}
            className="text-sm font-medium text-gray-500 hover:text-gray-800 px-2 py-1 touch-manipulation transition-colors"
          >
            Passer
          </button>
        </div>

        <div className="h-1 bg-gray-200/80 rounded-full overflow-hidden">
          <motion.div
            className="h-full balance-gradient rounded-full"
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          />
        </div>
        <p className="text-[11px] text-gray-400 mt-2 tabular-nums">
          {currentSlide + 1} / {slides.length}
        </p>
      </header>

      <main className="relative z-10 flex-1 flex flex-col min-h-0 px-5">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentSlide}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
            className="flex-1 flex flex-col"
          >
            <div className="flex-1 flex items-center justify-center py-4 min-h-[300px]">
              <Preview />
            </div>

            <div className="pb-4 text-center max-w-sm mx-auto">
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight leading-snug mb-2">
                {slide.title}
              </h1>
              <p className="text-sm text-gray-600 leading-relaxed">{slide.description}</p>

              <ul className="flex flex-wrap justify-center gap-2 mt-4">
                {slide.highlights.map((h) => (
                  <li
                    key={h}
                    className="text-[11px] font-medium text-gray-600 bg-white border border-gray-100 px-2.5 py-1 rounded-lg shadow-sm"
                  >
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="relative z-10 px-5 pb-8 pt-2 space-y-4">
        {isLast && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-2 text-xs text-gray-500"
          >
            <Shield className="w-4 h-4 text-primary-400" />
            <span>Données sécurisées · Compte personnel</span>
          </motion.div>
        )}

        <div className="flex gap-3">
          {currentSlide > 0 && (
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={goPrev}
              className="shrink-0 px-4"
              aria-label="Étape précédente"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
          )}
          <Button
            type="button"
            size="lg"
            fullWidth
            onClick={goNext}
            className="flex items-center justify-center gap-2"
          >
            {isLast ? 'Commencer' : 'Continuer'}
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex justify-center gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setDirection(i > currentSlide ? 1 : -1)
                setCurrentSlide(i)
              }}
              aria-label={`Étape ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 touch-manipulation ${
                i === currentSlide
                  ? 'w-6 bg-primary-500'
                  : 'w-1.5 bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      </footer>
    </div>
  )
}
