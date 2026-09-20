'use client'

import { useEffect, useState, type ReactNode } from 'react'
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

  const startDownload = () => {
    setOpen(true)
    window.open(APK_URL, '_blank', 'noopener,noreferrer')
  }

  return (
    <>
      <button type="button" onClick={startDownload} className={className}>
        {children}
      </button>
      {open ? <InstallGuide onClose={() => setOpen(false)} /> : null}
    </>
  )
}

function InstallGuide({ onClose }: { onClose: () => void }) {
  return (
    <div className="apk-guide" role="dialog" aria-modal="true" aria-labelledby="apk-guide-title">
      <button type="button" className="apk-guide-backdrop" aria-label="Fermer" onClick={onClose} />
      <div className="apk-guide-card">
        <p className="apk-guide-kicker">Installation Android</p>
        <h2 id="apk-guide-title">MES POCHES se télécharge</h2>
        <p className="apk-guide-lead">
          Le fichier APK s’ouvre dans un nouvel onglet (Google Drive). Une fois
          téléchargé, installez-le comme ceci.
        </p>

        <ol className="apk-guide-steps">
          <li>Ouvrez le fichier dans <strong>Téléchargements</strong> ou dans Drive.</li>
          <li>
            Si Android demande d’autoriser l’installation : Paramètres → Applications →
            Accès spécial → <strong>Installer des applis inconnues</strong> → autorisez
            Chrome, Fichiers ou Drive.
          </li>
          <li>Touchez <strong>Installer</strong>, puis ouvrez MES POCHES.</li>
        </ol>

        <div className="apk-guide-protect">
          <p className="apk-guide-protect-title">Play Protect bloque l’installation ?</p>
          <p>
            L’app n’est pas encore sur le Play Store : Play Protect peut refuser une
            source inconnue. Ne désactivez pas la protection. <strong>Suspendez-la</strong>{' '}
            seulement — elle se relance toute seule le lendemain.
          </p>
          <ol className="apk-guide-steps">
            <li>Ouvrez le <strong>Play Store</strong>.</li>
            <li>Touchez votre photo de profil (en haut à droite).</li>
            <li>Ouvrez <strong>Play Protect</strong>.</li>
            <li>Touchez l’engrenage <strong>Paramètres</strong>.</li>
            <li>
              Choisissez <strong>Suspendre</strong> — pas « Désactiver ». La protection
              reprend automatiquement le lendemain.
            </li>
            <li>Revenez au fichier APK et touchez <strong>Installer</strong>.</li>
          </ol>
        </div>

        <div className="apk-guide-actions">
          <a href={APK_URL} target="_blank" rel="noopener noreferrer" className="store-apk">
            Relancer le téléchargement
          </a>
          <button type="button" className="apk-guide-close" onClick={onClose}>
            J’ai compris
          </button>
        </div>
      </div>
    </div>
  )
}
