'use client'

import { CurrencyProvider } from '@/contexts/CurrencyContext'
import { SubscriptionProvider } from '@/contexts/SubscriptionContext'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SubscriptionProvider>
      <CurrencyProvider>{children}</CurrencyProvider>
    </SubscriptionProvider>
  )
}
