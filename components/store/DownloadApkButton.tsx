'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { APK_URL } from '@/lib/apk'

export function DownloadApkButton({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open])

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        {children}
      </button>
      {open ? <InstallGuide onClose={() => setOpen(false)} /> : null}
    </>
  )
}

function InstallGuide({ onClose }: { onClose: () => void }) {
  return createPortal(
    <div className="apk-guide" role="dialog" aria-modal="true" aria-labelledby="apk-guide-title">
      <button type="button" className="apk-guide-backdrop" aria-label="Fermer" onClick={onClose} />
      <div className="apk-guide-card">
        <p className="apk-guide-kicker">Play Protect</p>
        <h2 id="apk-guide-title">Play Protect peut bloquer l’installation</h2>
        <p className="apk-guide-lead">
          MES POCHES n’est pas encore sur le Play Store. Play Protect peut donc
          refuser l’APK. Ne désactivez pas la protection :{' '}
          <strong>suspendez-la</strong> seulement — elle se relance toute seule
          le lendemain.
        </p>

        <ol className="apk-guide-steps">
          <li>Ouvrez le <strong>Play Store</strong>.</li>
          <li>Touchez votre photo de profil (en haut à droite).</li>
          <li>Ouvrez <strong>Play Protect</strong>.</li>
          <li>Touchez l’engrenage <strong>Paramètres</strong>.</li>
          <li>
            Choisissez <strong>Suspendre</strong> — pas « Désactiver ». La
            protection reprend automatiquement le lendemain.
          </li>
          <li>Revenez ensuite au fichier APK et touchez <strong>Installer</strong>.</li>
        </ol>

        <div className="apk-guide-actions">
          <a href={APK_URL} target="_blank" rel="noopener noreferrer" className="store-apk">
            Lancer le téléchargement (125 MB)
          </a>
          <button type="button" className="apk-guide-close" onClick={onClose}>
            Annuler
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
