import type { Metadata } from 'next'
import { Suspense } from 'react'
import PaymentReturn from './PaymentReturn'

export const metadata: Metadata = {
  title: 'Paiement — MES POCHES',
  robots: { index: false, follow: false },
}

export default function PaymentReturnPage() {
  return (
    <Suspense fallback={null}>
      <PaymentReturn />
    </Suspense>
  )
}
