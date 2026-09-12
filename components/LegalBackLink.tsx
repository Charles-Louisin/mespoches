'use client'

import Link from 'next/link'
import { Capacitor } from '@capacitor/core'

export default function LegalBackLink() {
  const native = Capacitor.isNativePlatform()

  if (native) {
    return (
      <Link href="/settings" className="block text-gray-500">
        Retour aux paramètres
      </Link>
    )
  }

  return (
    <Link href="/download" className="block text-gray-500">
      Retour à l&apos;accueil
    </Link>
  )
}
