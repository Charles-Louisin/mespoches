'use client'

import { motion, useReducedMotion } from 'framer-motion'
import BottomNav from '@/components/BottomNav'
import PullToRefresh from '@/components/PullToRefresh'
import OfflineIndicator from '@/components/OfflineIndicator'

interface PageShellProps {
  children: React.ReactNode
  className?: string
  enablePullToRefresh?: boolean
  onRefresh?: () => Promise<void> | void
}

export default function PageShell({ 
  children, 
  className = '',
  enablePullToRefresh = true,
  onRefresh
}: PageShellProps) {
  const reduce = useReducedMotion()

  return (
    <div className={`min-h-screen bg-surface pb-28 ${className}`}>
      <OfflineIndicator />
      <PullToRefresh enabled={enablePullToRefresh} onRefresh={onRefresh}>
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
