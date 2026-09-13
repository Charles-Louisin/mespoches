'use client'

import { useEffect } from 'react'

/**
 * Composant pour initialiser des scripts côté client uniquement
 */
export default function ClientSideInit() {
  useEffect(() => {
    // Importer le suppresseur d'erreurs côté client uniquement
    import('@/lib/suppressNetworkErrors').catch(console.error)
  }, [])

  return null
}
