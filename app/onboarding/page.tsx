'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, Wallet, TrendingUp, PieChart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@/components/Button';
import { setOnboardingSeen } from '@/lib/auth';

const slides = [
  {
    icon: Wallet,
    title: 'Gérez vos portefeuilles',
    description: 'Créez et organisez plusieurs portefeuilles pour suivre facilement vos finances.',
    color: 'from-sky-500 to-blue-500'
  },
  {
    icon: TrendingUp,
    title: 'Suivez vos transactions',
    description: 'Enregistrez vos revenus et dépenses en temps réel. Vos soldes sont calculés automatiquement.',
    color: 'from-emerald-500 to-teal-500'
  },
  {
    icon: PieChart,
    title: 'Analysez vos finances',
    description: 'Obtenez des statistiques détaillées et comprenez où va votre argent.',
    color: 'from-violet-500 to-purple-500'
  }
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setDirection(1);
      setCurrentSlide(currentSlide + 1);
    } else {
      setOnboardingSeen();
      router.push('/login');
    }
  };

  const handleSkip = () => {
    setOnboardingSeen();
    router.push('/login');
  };

  const slide = slides[currentSlide];
  const Icon = slide.icon;

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.5
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.5
    })
  } as const;

  const iconVariants = {
    initial: { scale: 0, rotate: -180 },
    animate: { 
      scale: 1, 
      rotate: 0,
      transition: {
        type: "spring" as const,
        stiffness: 260,
        damping: 20,
        delay: 0.2
      }
    }
  } as const;

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white flex flex-col overflow-hidden">
      {/* Skip button */}
      <motion.div 
        className="p-4 flex justify-end"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <button
          onClick={handleSkip}
          className="text-sm text-gray-500 hover:text-gray-700 transition"
        >
          Passer
        </button>
      </motion.div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-20 relative">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentSlide}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.3 },
              scale: { duration: 0.3 }
            }}
            className="absolute inset-0 flex flex-col items-center justify-center px-6 pointer-events-none"
          >
            {/* Icon */}
            <motion.div
              variants={iconVariants}
              initial="initial"
              animate="animate"
              className={`w-32 h-32 bg-gradient-to-br ${slide.color} rounded-full flex items-center justify-center mb-8 shadow-lg pointer-events-auto`}
            >
              <Icon className="w-16 h-16 text-white" />
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-3xl font-bold text-gray-900 mb-4 text-center pointer-events-auto"
            >
              {slide.title}
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-lg text-gray-600 text-center max-w-md mb-12 pointer-events-auto"
            >
              {slide.description}
            </motion.p>
          </motion.div>
        </AnimatePresence>

        {/* Dots - Fixed position */}
        <div className="absolute bottom-32 left-0 right-0 flex justify-center gap-2 z-10">
          {slides.map((_, index) => (
            <motion.div
              key={index}
              initial={false}
              animate={{
                width: index === currentSlide ? 32 : 8,
                backgroundColor: index === currentSlide ? '#0ea5e9' : '#d1d5db'
              }}
              transition={{ duration: 0.3 }}
              className="h-2 rounded-full"
            />
          ))}
        </div>

        {/* Button - Fixed position */}
        <motion.div
          className="absolute bottom-8 left-6 right-6 z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <Button
            onClick={handleNext}
            className="w-full flex items-center justify-center gap-2 relative z-10"
          >
            {currentSlide < slides.length - 1 ? 'Suivant' : 'Commencer'}
            <ChevronRight className="w-5 h-5" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
