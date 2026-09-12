'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Capacitor } from '@capacitor/core'
import { SpeechRecognition } from '@capacitor-community/speech-recognition'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, Square, X } from 'lucide-react'
import { toast } from 'sonner'
import { pendingTransactionApi } from '@/lib/api'
import {
  cancelTransactionProcessing,
  notifyTransactionProcessing,
  notifyTransactionReady,
} from '@/lib/capacitor/app-notifications'
import { PremiumRequiredError } from '@/lib/subscription'

type SpeechRecognitionLike = {
  lang: string
  continuous: boolean
  interimResults: boolean
  start: () => void
  stop: () => void
  abort: () => void
  onresult: ((ev: { results: ArrayLike<{ 0: { transcript: string }; isFinal: boolean }> }) => void) | null
  onerror: ((ev: { error?: string }) => void) | null
  onend: (() => void) | null
}

type PluginListener = { remove: () => Promise<void> | void }

function withTimeout(promise: Promise<unknown>, ms = 1200): Promise<void> {
  return Promise.race([
    promise.then(() => undefined).catch(() => undefined),
    new Promise<void>((resolve) => setTimeout(resolve, ms)),
  ])
}

function getWebSpeechRecognition(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === 'undefined') return null
  const w = window as Window & {
    SpeechRecognition?: new () => SpeechRecognitionLike
    webkitSpeechRecognition?: new () => SpeechRecognitionLike
  }
  return w.SpeechRecognition || w.webkitSpeechRecognition || null
}

interface VoiceNoteOverlayProps {
  open: boolean
  onClose: () => void
  isPremium: boolean
  requirePremium: (msg: string) => void
}

export default function VoiceNoteOverlay({
  open,
  onClose,
  isPremium,
  requirePremium,
}: VoiceNoteOverlayProps) {
  const router = useRouter()
  const [listening, setListening] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const webRecognitionRef = useRef<SpeechRecognitionLike | null>(null)
  const nativeListeners = useRef<PluginListener[]>([])
  /** Une seule hypothèse courante — jamais empilée (évite le double texte). */
  const latestText = useRef('')
  const usingNative = useRef(false)
  const starting = useRef(false)
  const submittingRef = useRef(false)

  const clearNativeListeners = useCallback(async () => {
    for (const listener of nativeListeners.current) {
      try {
        await listener.remove()
      } catch {
        /* ignore */
      }
    }
    nativeListeners.current = []
    try {
      await SpeechRecognition.removeAllListeners()
    } catch {
      /* ignore */
    }
  }, [])

  const stopRecognition = useCallback(async () => {
    setListening(false)

    if (usingNative.current) {
      usingNative.current = false
      try {
        await withTimeout(Promise.resolve(SpeechRecognition.stop()))
      } catch {
        /* ignore */
      }
      await clearNativeListeners()
    }

    try {
      webRecognitionRef.current?.stop()
    } catch {
      /* ignore */
    }
    webRecognitionRef.current = null
  }, [clearNativeListeners])

  const reset = useCallback(() => {
    latestText.current = ''
    setSubmitting(false)
    submittingRef.current = false
  }, [])

  useEffect(() => {
    if (!open) {
      void stopRecognition()
      reset()
    }
  }, [open, reset, stopRecognition])

  useEffect(() => {
    return () => {
      void stopRecognition()
    }
  }, [stopRecognition])

  const submitText = useCallback(
    async (text: string) => {
      const cleaned = text.trim()
      if (!cleaned || submittingRef.current) return
      submittingRef.current = true
      setSubmitting(true)
      void stopRecognition()
      void notifyTransactionProcessing()
      try {
        const created = await pendingTransactionApi.voiceNote(cleaned)
        void notifyTransactionReady(created.description || 'Transaction vocale prête')
        toast.success('Transaction proposée')
        onClose()
        router.push('/pending')
      } catch (e) {
        void cancelTransactionProcessing()
        if (e instanceof PremiumRequiredError) {
          requirePremium(e.message)
        } else {
          toast.error(e instanceof Error ? e.message : 'Analyse impossible')
        }
      } finally {
        submittingRef.current = false
        setSubmitting(false)
      }
    },
    [onClose, requirePremium, router, stopRecognition]
  )

  const finishAndAnalyze = useCallback(async () => {
    const text = latestText.current.trim()
    await stopRecognition()
    if (!text) {
      toast.error('Rien n’a été capté — réessayez')
      return
    }
    await submitText(text)
  }, [stopRecognition, submitText])

  const startNativeListening = async () => {
    const available = await SpeechRecognition.available()
    if (!available.available) {
      throw new Error('Reconnaissance vocale indisponible sur cet appareil')
    }

    const permission = await SpeechRecognition.requestPermissions()
    if (permission.speechRecognition !== 'granted') {
      throw new Error('Autorisez le micro et la reconnaissance vocale')
    }

    await clearNativeListeners()
    usingNative.current = true
    latestText.current = ''

    const partial = await SpeechRecognition.addListener('partialResults', (data) => {
      const text = (data.matches || []).find(Boolean)?.trim()
      if (text) latestText.current = text
    })
    nativeListeners.current.push(partial)

    const state = await SpeechRecognition.addListener('listeningState', (data) => {
      if (data.status === 'stopped') {
        setListening(false)
      }
    })
    nativeListeners.current.push(state)

    setListening(true)
    try {
      const result = (await SpeechRecognition.start({
        language: 'fr-FR',
        maxResults: 1,
        prompt: 'Dites votre transaction',
        partialResults: true,
        popup: false,
      })) as { matches?: string[] } | undefined

      const finalMatch = result?.matches?.find(Boolean)?.trim()
      if (finalMatch) {
        latestText.current = finalMatch
      }
    } catch (e) {
      setListening(false)
      throw e
    }
  }

  const startWebListening = async () => {
    const Ctor = getWebSpeechRecognition()
    if (!Ctor) {
      throw new Error('Reconnaissance vocale non disponible sur cet appareil')
    }

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch {
      throw new Error('Autorisez le micro pour dicter une transaction')
    }

    latestText.current = ''
    const recognition = new Ctor()
    recognition.lang = 'fr-FR'
    recognition.continuous = true
    recognition.interimResults = true
    recognition.onresult = (ev) => {
      let session = ''
      for (let i = 0; i < ev.results.length; i++) {
        session += `${ev.results[i][0].transcript} `
      }
      latestText.current = session.trim()
    }
    recognition.onerror = () => setListening(false)
    recognition.onend = () => setListening(false)
    webRecognitionRef.current = recognition
    recognition.start()
    setListening(true)
  }

  const startListening = async () => {
    if (!isPremium) {
      requirePremium('Note vocale réservée aux abonnés Premium')
      return
    }
    if (starting.current || listening || submitting) return
    starting.current = true
    latestText.current = ''

    try {
      if (Capacitor.isNativePlatform()) {
        await startNativeListening()
      } else {
        await startWebListening()
      }
    } catch (e) {
      usingNative.current = false
      setListening(false)
      toast.error(e instanceof Error ? e.message : 'Impossible de démarrer le micro')
    } finally {
      starting.current = false
    }
  }

  useEffect(() => {
    if (!open || !isPremium) return
    const t = setTimeout(() => {
      void startListening()
    }, 350)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- démarrage unique à l'ouverture
  }, [open, isPremium])

  if (!open) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[70] flex items-end justify-center">
        <motion.button
          type="button"
          className="absolute inset-0 bg-black/45"
          aria-label="Fermer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 28 }}
          transition={{ type: 'spring', stiffness: 340, damping: 28 }}
          className="relative w-full max-w-md mx-auto mb-24 px-4"
        >
          <div className="rounded-[1.75rem] bg-white shadow-xl border border-gray-100 p-5 space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-gray-900">Note vocale</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Parlez, puis arrêtez — l’analyse part tout de suite
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-full text-gray-400 hover:bg-gray-50 touch-manipulation"
                aria-label="Fermer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col items-center gap-3 py-2">
              {submitting ? (
                <>
                  <div className="w-full max-w-[200px] space-y-2 py-2">
                    <div className="h-3 animate-pulse rounded bg-ink/10" />
                    <div className="h-3 w-2/3 mx-auto animate-pulse rounded bg-ink/[0.07]" />
                  </div>
                  <p className="text-sm text-gray-600">Analyse en cours…</p>
                </>
              ) : listening ? (
                <>
                  <button
                    type="button"
                    onClick={() => void finishAndAnalyze()}
                    className="w-16 h-16 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg touch-manipulation animate-pulse"
                    aria-label="Arrêter et analyser"
                  >
                    <Square size={22} fill="currentColor" />
                  </button>
                  <p className="text-sm text-gray-600">Écoute… appuyez pour analyser</p>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => void startListening()}
                    className="w-16 h-16 rounded-full bg-primary-600 text-white flex items-center justify-center shadow-lg touch-manipulation"
                    aria-label="Parler"
                  >
                    <Mic size={26} />
                  </button>
                  <p className="text-sm text-gray-600">Appuyez pour parler</p>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
