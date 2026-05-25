'use client'

import BottomNav from '@/components/BottomNav'

interface PageShellProps {
  children: React.ReactNode
  className?: string
}

export default function PageShell({ children, className = '' }: PageShellProps) {
  return (
    <div className={`min-h-screen bg-surface pb-28 ${className}`}>
      {children}
      <BottomNav />
    </div>
  )
}
