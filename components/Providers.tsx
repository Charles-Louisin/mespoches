'use client'

import { useEffect } from 'react'
import { hydrateAuthSession } from '@/lib/auth'

export default function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    void hydrateAuthSession()
  }, [])

  return <>{children}</>
}
