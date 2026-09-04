'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Capacitor } from '@capacitor/core'
import { SpeechRecognition } from '@capacitor-community/speech-recognition'
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

/** Sur Android, stop() peut ne jamais résoudre : on ne bloque jamais l'UI dessus. */
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
  const [transcript, setTranscript] = useState('')
  const webRecognitionRef = useRef<SpeechRecognitionLike | null>(null)
  const nativeListeners = useRef<PluginListener[]>([])
  /** Segments déjà terminés (dictées successives). */
  const committedText = useRef('')
  /** Phrase en cours de reconnaissance, remplacée à chaque résultat partiel. */
  const currentText = useRef('')
  const usingNative = useRef(false)
  const starting = useRef(false)

  const fullText = useCallback(
    () => `${committedText.current} ${currentText.current}`.trim(),
    []
  )

  const commitCurrent = useCallback(() => {
    if (!currentText.current) return
    committedText.current = `${committedText.current} ${currentText.current}`.trim()
    currentText.current = ''
  }, [])

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
    commitCurrent()

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
  }, [clearNativeListeners, commitCurrent])

  const resetTranscript = useCallback(() => {
    committedText.current = ''
    currentText.current = ''
    setTranscript('')
  }, [])

  useEffect(() => {
    if (!open) {
      void stopRecognition()
      resetTranscript()
      setSubmitting(false)
    }
  }, [open, resetTranscript, stopRecognition])

  useEffect(() => {
    return () => {
      void stopRecognition()
    }
  }, [stopRecognition])

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

    const partial = await SpeechRecognition.addListener('partialResults', (data) => {
      // Android renvoie plusieurs hypothèses concurrentes de la même phrase :
      // seule la première (la plus probable) doit être conservée.
      const text = (data.matches || []).find(Boolean)?.trim()
      if (!text) return
      currentText.current = text
      setTranscript(fullText())
    })
    nativeListeners.current.push(partial)

    const state = await SpeechRecognition.addListener('listeningState', (data) => {
      if (data.status === 'stopped') {
        commitCurrent()
        setListening(false)
      }
    })
    nativeListeners.current.push(state)

    // start() ne résout pas toujours immédiatement selon la version d'Android :
    // l'état d'écoute est affiché tout de suite pour éviter un second démarrage.
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
        currentText.current = finalMatch
        setTranscript(fullText())
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

    const recognition = new Ctor()
    recognition.lang = 'fr-FR'
    recognition.continuous = true
    recognition.interimResults = true
    recognition.onresult = (ev) => {
      // ev.results est cumulatif : il décrit toute la session en cours.
      let session = ''
      for (let i = 0; i < ev.results.length; i++) {
        session += `${ev.results[i][0].transcript} `
      }
      currentText.current = session.trim()
      setTranscript(fullText())
    }
    recognition.onerror = () => {
      commitCurrent()
      setListening(false)
    }
    recognition.onend = () => {
      commitCurrent()
      setListening(false)
    }
    webRecognitionRef.current = recognition
    recognition.start()
    setListening(true)
  }

  const startListening = async () => {
    if (!isPremium) {
      requirePremium('Note vocale réservée aux abonnés Premium')
      return
    }
    if (starting.current || listening) return
    starting.current = true

    // Le texte déjà dicté est conservé : une nouvelle prise s'ajoute à la suite.
    commitCurrent()

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

  const submit = async () => {
    const text = fullText() || transcript.trim()
    if (!text) {
      toast.error('Parlez d’abord, puis validez')
      return
    }

    setSubmitting(true)
    // Volontairement non bloquant : l'arrêt du micro ne doit jamais retarder l'envoi.
    void stopRecognition()
    void notifyTransactionProcessing()
    try {
      const created = await pendingTransactionApi.voiceNote(text)
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
      setSubmitting(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Fermer"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md mx-auto mb-24 px-4 animate-in">
        <div className="rounded-[1.75rem] bg-white shadow-xl border border-gray-100 p-5 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-gray-900">Note vocale</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Ex. « Dépensé 2000 pour le pain »
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

          <div className="min-h-[72px] rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-700">
            {transcript || (
              <span className="text-gray-400">
                {listening ? 'Écoute en cours…' : 'Appuyez sur le micro pour parler'}
              </span>
            )}
          </div>

          {transcript && !listening && (
            <button
              type="button"
              onClick={resetTranscript}
              disabled={submitting}
              className="text-xs text-gray-500 underline touch-manipulation disabled:opacity-50"
            >
              Effacer et recommencer
            </button>
          )}

          <div className="flex items-center justify-center gap-4">
            {listening ? (
              <button
                type="button"
                onClick={() => void stopRecognition()}
                className="w-16 h-16 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg touch-manipulation animate-pulse"
                aria-label="Arrêter"
              >
                <Square size={22} fill="currentColor" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => void startListening()}
                disabled={submitting}
                className="w-16 h-16 rounded-full bg-primary-600 text-white flex items-center justify-center shadow-lg touch-manipulation disabled:opacity-60"
                aria-label="Parler"
              >
                <Mic size={26} />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => void submit()}
            disabled={submitting || !transcript.trim()}
            className="w-full py-3 rounded-2xl bg-primary-800 text-white font-semibold text-sm disabled:opacity-50 touch-manipulation"
          >
            {submitting ? 'Analyse…' : 'Créer la proposition'}
          </button>
        </div>
      </div>
    </div>
  )
}
