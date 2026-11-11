'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { authApi } from '@/lib/api'
import { getUser, hasSession, hydrateAuthSession, logout } from '@/lib/auth'

/** Suppression depuis le site, pour qui n'a plus l'application (exigence Google Play). */
export default function AccountDeletionPanel() {
  const [ready, setReady] = useState(false)
  const [email, setEmail] = useState<string | null>(null)
  const [confirm, setConfirm] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let cancelled = false
    void hydrateAuthSession().then(() => {
      if (cancelled) return
      setEmail(hasSession() ? getUser()?.email ?? null : null)
      setReady(true)
    })
    return () => {
      cancelled = true
    }
  }, [])

  if (!ready) return <p className="lp-delete-note">Vérification de votre session…</p>

  if (!email) {
    return (
      <div className="lp-delete-panel">
        <p>
          Connectez-vous avec le compte à supprimer, puis revenez sur cette page : le bouton de suppression
          apparaîtra ici.
        </p>
        <Link href="/login" className="lp-btn lp-btn-primary">
          Se connecter
        </Link>
      </div>
    )
  }

  const run = async () => {
    if (confirm.trim().toUpperCase() !== 'SUPPRIMER') return
    setBusy(true)
    try {
      await authApi.deleteMe()
      toast.success('Votre compte et vos données ont été supprimés.')
      logout('/')
    } catch {
      toast.error('La suppression a échoué. Réessayez ou écrivez-nous.')
      setBusy(false)
    }
  }

  return (
    <div className="lp-delete-panel">
      <p>
        Connecté en tant que <strong>{email}</strong>. Pour confirmer, saisissez <strong>SUPPRIMER</strong>.
      </p>
      <label className="lp-delete-label" htmlFor="confirm-delete">
        Confirmation
      </label>
      <input
        id="confirm-delete"
        className="lp-delete-input"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        autoComplete="off"
        placeholder="SUPPRIMER"
      />
      <button
        type="button"
        className="lp-btn lp-delete-btn"
        disabled={busy || confirm.trim().toUpperCase() !== 'SUPPRIMER'}
        onClick={() => void run()}
      >
        {busy ? 'Suppression…' : 'Supprimer définitivement mon compte'}
      </button>
    </div>
  )
}
