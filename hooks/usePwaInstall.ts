'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function usePwaInstall() {
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null)
  const [canInstall, setCanInstall] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true

    if (standalone) {
      setIsInstalled(true)
      return
    }

    const onInstallable = (e: Event) => {
      e.preventDefault()
      deferredPrompt.current = e as BeforeInstallPromptEvent
      setCanInstall(true)
    }

    const onInstalled = () => {
      setIsInstalled(true)
      setCanInstall(false)
      deferredPrompt.current = null
    }

    window.addEventListener('beforeinstallprompt', onInstallable)
    window.addEventListener('appinstalled', onInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', onInstallable)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  const install = useCallback(async () => {
    if (isInstalled) {
      toast.info('L\'application est déjà installée')
      return
    }

    if (deferredPrompt.current) {
      await deferredPrompt.current.prompt()
      const { outcome } = await deferredPrompt.current.userChoice
      if (outcome === 'accepted') {
        toast.success('Application installée !')
        setIsInstalled(true)
      }
      deferredPrompt.current = null
      setCanInstall(false)
      return
    }

    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)
    if (isIOS) {
      toast.info(
        'Sur iOS : touchez Partager puis « Sur l\'écran d\'accueil » pour installer l\'app.',
        { duration: 5000 }
      )
    } else {
      toast.info(
        'Utilisez le menu du navigateur (⋮) puis « Installer l\'application » ou « Ajouter à l\'écran d\'accueil ».',
        { duration: 5000 }
      )
    }
  }, [isInstalled])

  return { canInstall, isInstalled, install }
}
