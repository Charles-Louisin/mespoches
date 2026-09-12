import { Suspense } from 'react'
import GoogleMobileReturnClient from './GoogleMobileReturnClient'
import AppLogo from '@/components/AppLogo'
import LoadingBar from '@/components/LoadingBar'

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-surface flex flex-col items-center justify-center gap-4 px-4">
          <AppLogo size="md" />
          <LoadingBar label="Finalisation Google…" />
        </div>
      }
    >
      <GoogleMobileReturnClient />
    </Suspense>
  )
}
