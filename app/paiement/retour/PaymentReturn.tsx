'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { getClientApiUrl } from '@/lib/api-config'

type Status = 'checking' | 'completed' | 'pending' | 'failed' | 'invalid' | 'error'

const REF_RE = /^MP[a-f0-9]{20}$/
const POLL_DELAYS = [0, 2500, 4000, 6000, 8000, 12000]
const APP_SCHEME = 'mespoches://subscription/success'

const COPY: Record<Status, { title: string; body: string }> = {
  checking: { title: 'Vérification du paiement…', body: 'Nous confirmons la transaction auprès de l’opérateur.' },
  completed: { title: 'Paiement reçu', body: 'Votre forfait MES POCHES est actif.' },
  pending: {
    title: 'Confirmation en cours',
    body: 'Votre opérateur n’a pas encore confirmé. Si vous avez validé sur votre téléphone, l’activation se fera toute seule dans quelques minutes.',
  },
  failed: { title: 'Paiement non abouti', body: 'Aucun montant n’a été prélevé pour ce forfait. Vous pouvez réessayer depuis l’application.' },
  invalid: { title: 'Lien incomplet', body: 'Cette page de retour ne contient pas de référence de paiement valide.' },
  error: { title: 'Vérification indisponible', body: 'Rouvrez l’application : elle vérifiera votre paiement automatiquement.' },
}

export default function PaymentReturn() {
  const params = useSearchParams()
  const ref = params.get('ref') || ''
  const fromApp = params.get('client') !== 'web'
  const valid = REF_RE.test(ref)
  const [status, setStatus] = useState<Status>(valid ? 'checking' : 'invalid')
  const deepLink = useMemo(() => `${APP_SCHEME}?transactionId=${encodeURIComponent(ref)}`, [ref])

  // Depuis l'app : on rend la main tout de suite (l'app ferme le navigateur et vérifie elle-même).
  useEffect(() => {
    if (!valid || !fromApp) return
    const t = window.setTimeout(() => {
      window.location.href = deepLink
    }, 700)
    return () => window.clearTimeout(t)
  }, [valid, fromApp, deepLink])

  useEffect(() => {
    if (!valid) return
    let cancelled = false
    ;(async () => {
      for (const delay of POLL_DELAYS) {
        if (delay) await new Promise((r) => setTimeout(r, delay))
        if (cancelled) return
        try {
          const res = await fetch(`${getClientApiUrl()}/subscription/return-status?ref=${encodeURIComponent(ref)}`, {
            cache: 'no-store',
          })
          const json = await res.json().catch(() => null)
          const s = json?.data?.status as string | undefined
          if (s === 'completed' || s === 'failed') {
            if (!cancelled) setStatus(s)
            return
          }
          if (!res.ok && res.status !== 502) {
            if (!cancelled) setStatus('error')
            return
          }
        } catch {
          /* réseau : on retente */
        }
      }
      if (!cancelled) setStatus('pending')
    })()
    return () => {
      cancelled = true
    }
  }, [valid, ref])

  const copy = COPY[status]
  const tone =
    status === 'completed' ? 'bg-emerald-50 text-emerald-600' : status === 'failed' || status === 'invalid' ? 'bg-red-50 text-red-600' : 'bg-primary-50 text-primary-600'

  return (
    <main className="min-h-[100dvh] bg-white text-ink flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm text-center">
        <img src="/logo.png" alt="" width={56} height={56} className="mx-auto mb-8 rounded-2xl" />
        <div className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full ${tone}`} aria-hidden>
          {status === 'checking' || status === 'pending' ? (
            <span className="h-7 w-7 animate-spin rounded-full border-[3px] border-current border-t-transparent" />
          ) : status === 'completed' ? (
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
          ) : (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 7v6M12 17h.01" /></svg>
          )}
        </div>
        <h1 className="text-2xl font-bold tracking-tight" role="status" aria-live="polite">
          {copy.title}
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">{copy.body}</p>

        {valid && (
          <a
            href={deepLink}
            className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-full bg-primary-600 px-6 font-semibold text-white transition hover:bg-primary-700 active:scale-[0.98]"
          >
            Retourner dans l’application
          </a>
        )}
        <a href="/" className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-full text-sm font-medium text-ink-soft hover:text-ink">
          Aller sur mespoches.store
        </a>
        {valid && <p className="mt-6 text-xs text-ink-mute">Référence : {ref}</p>}
      </div>
    </main>
  )
}
