'use client'

interface PageShellProps {
  children: React.ReactNode
  className?: string
}

export default function PageShell({ children, className = '' }: PageShellProps) {
  return <div className={`min-h-screen bg-[#f4f6f9] ${className}`}>{children}</div>
}
