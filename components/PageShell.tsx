'use client'

import { motion, useReducedMotion } from 'framer-motion'
import BottomNav from '@/components/BottomNav'
import PullToRefresh from '@/components/PullToRefresh'

interface PageShellProps {
  children: React.ReactNode
  className?: string
}

export default function PageShell({ children, className = '' }: PageShellProps) {
  const reduce = useReducedMotion()

  return (
    <div className={`min-h-screen bg-surface pb-28 ${className}`}>
      <PullToRefresh>
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        >
          {children}
        </motion.div>
      </PullToRefresh>
      <BottomNav />
    </div>
  )
}
