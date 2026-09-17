'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { hydrateAuthSession, isAdminSession, isAuthenticated, logout } from '@/lib/auth'

export default function StoreAuthActions({
  onNavigate,
}: {
  onNavigate?: () => void
}) {
  const [ready, setReady] = useState(false)
  const [signedIn, setSignedIn] = useState(false)
  const [admin, setAdmin] = useState(false)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      await hydrateAuthSession()
      if (cancelled) return
      setSignedIn(isAuthenticated())
      setAdmin(isAdminSession())
      setReady(true)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  if (!ready) return null

  if (signedIn) {
    return (
      <>
        {admin ? (
          <Link href="/admin" className="store-auth-btn is-admin" onClick={onNavigate}>
            Tableau de bord
          </Link>
        ) : null}
        <button type="button" className="store-auth-btn is-out" onClick={() => logout()}>
          Déconnexion
        </button>
      </>
    )
  }

  return (
    <Link href="/login" className="store-auth-btn" onClick={onNavigate}>
      Se connecter
    </Link>
  )
}
