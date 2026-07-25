'use client'

import BottomNav from '@/components/BottomNav'
import PullToRefresh from '@/components/PullToRefresh'

interface PageShellProps {
  children: React.ReactNode
  className?: string
}

export default function PageShell({ children, className = '' }: PageShellProps) {
  return (
    <div className={`min-h-screen bg-surface pb-28 ${className}`}>
      <PullToRefresh>{children}</PullToRefresh>
      <BottomNav />
    </div>
  )
}
