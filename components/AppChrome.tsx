'use client'

import { usePathname } from 'next/navigation'
import SyncIndicator from '@/components/SyncIndicator'
import SetupCoach from '@/components/SetupCoach'
import NativePermissionsOnLaunch from '@/components/NativePermissionsOnLaunch'
import AutomationBridge from '@/components/AutomationBridge'
import CapacitorBridge from '@/components/CapacitorBridge'
import AppBootLoader from '@/components/AppBootLoader'

const WEB_ONLY = ['/download', '/legal']

export default function AppChrome() {
  const pathname = usePathname()
  const webOnly = WEB_ONLY.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  )

  if (webOnly) return null

  return (
    <>
      <AppBootLoader />
      <NativePermissionsOnLaunch />
      <AutomationBridge />
      <CapacitorBridge />
      <SyncIndicator />
      <SetupCoach />
    </>
  )
}
