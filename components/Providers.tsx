'use client'

import { useEffect } from 'react'
import { CurrencyProvider } from '@/contexts/CurrencyContext'
import { SubscriptionProvider } from '@/contexts/SubscriptionContext'
import { ReceiptScanProvider } from '@/contexts/ReceiptScanContext'
import { hydrateAuthSession } from '@/lib/auth'

function AuthHydration({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    void hydrateAuthSession()
  }, [])

  return <>{children}</>
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthHydration>
      <SubscriptionProvider>
        <CurrencyProvider>
          <ReceiptScanProvider>{children}</ReceiptScanProvider>
        </CurrencyProvider>
      </SubscriptionProvider>
    </AuthHydration>
  )
}
