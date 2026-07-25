'use client'

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useRouter } from 'next/navigation'
import { Camera as CapCamera, CameraResultType, CameraSource } from '@capacitor/camera'
import { pendingTransactionApi } from '@/lib/api'
import { compressImageForScan } from '@/lib/imageCompress'
import { isNativeApp } from '@/lib/capacitor/native-permissions'
import {
  notifyTransactionProcessing,
  notifyTransactionReady,
} from '@/lib/capacitor/app-notifications'
import ReceiptScanOverlay from '@/components/ReceiptScanOverlay'

type ScanPhase = 'idle' | 'scanning' | 'success' | 'error'

interface PendingImage {
  dataUrl: string
  mime: string
}

function formatScanError(e: unknown): string {
  const raw = e instanceof Error ? e.message : 'Analyse impossible'
  const lower = raw.toLowerCase()
  if (lower.includes('413') || lower.includes('too large') || lower.includes('volumineux')) {
    return 'Image trop volumineuse. Rapprochez le reçu ou réessayez.'
  }
  if (
    lower.includes('model') &&
    (lower.includes('not found') || lower.includes('support') || lower.includes('introuvable'))
  ) {
    return 'Service IA temporairement indisponible. Réessayez dans quelques instants.'
  }
  if (lower.includes('quota') || lower.includes('429') || lower.includes('rate limit')) {
    return 'Quota IA atteint. Réessayez dans 1 à 2 minutes.'
  }
  if (raw.length > 120) {
    return 'Analyse impossible. Réessayez avec une photo plus nette.'
  }
  return raw
}

interface ReceiptScanContextValue {
  startScan: (isPremium: boolean, requirePremium: (msg: string) => void) => Promise<boolean>
  scanning: boolean
}

const ReceiptScanContext = createContext<ReceiptScanContextValue | null>(null)

export function ReceiptScanProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [phase, setPhase] = useState<ScanPhase>('idle')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [createdCount, setCreatedCount] = useState(0)
  const pendingImage = useRef<PendingImage | null>(null)

  const reset = useCallback(() => {
    setPhase('idle')
    setImagePreview(null)
    setMessage('')
    setCreatedCount(0)
    pendingImage.current = null
  }, [])

  const processImage = useCallback(
    async (dataUrl: string, mime: string) => {
      pendingImage.current = { dataUrl, mime }
      setImagePreview(dataUrl)
      setPhase('scanning')
      setMessage('Analyse de votre reçu en cours…')
      void notifyTransactionProcessing()

      try {
        const { image, mimeType } = await compressImageForScan(dataUrl, mime)
        const created = await pendingTransactionApi.aiScan(image, mimeType)
        const count = created.length
        setCreatedCount(count)
        setPhase('success')
        const lowConf = created.some((t) => t.confidence < 0.75 || !!t.low_confidence_warning)
        setMessage(
          lowConf
            ? "Certaines informations n'ont pas pu être reconnues avec certitude."
            : count === 1
              ? '1 transaction détectée'
              : `${count} transactions détectées`
        )
        void notifyTransactionReady(
          count === 1 ? '1 transaction détectée sur votre reçu' : `${count} transactions détectées`
        )
        pendingImage.current = null
        window.setTimeout(() => {
          reset()
          router.push('/pending')
        }, 1400)
        return true
      } catch (e) {
        const msg = formatScanError(e)
        setPhase('error')
        setMessage(msg)
        return false
      }
    },
    [reset, router]
  )

  const retryScan = useCallback(async () => {
    const saved = pendingImage.current
    if (!saved) {
      reset()
      return
    }
    await processImage(saved.dataUrl, saved.mime)
  }, [processImage, reset])

  const pickImage = useCallback((): Promise<string | null> => {
    return new Promise((resolve) => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.onchange = () => {
        const file = input.files?.[0]
        if (!file) {
          resolve(null)
          return
        }
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = () => resolve(null)
        reader.readAsDataURL(file)
      }
      input.click()
    })
  }, [])

  const startScan = useCallback(
    async (isPremium: boolean, requirePremium: (msg: string) => void): Promise<boolean> => {
      if (phase !== 'idle' && phase !== 'error') return false

      if (!isPremium) {
        requirePremium('Scan de reçu réservé aux abonnés Premium')
        return false
      }

      if (phase === 'error') {
        reset()
      }

      try {
        let dataUrl: string | null = null
        let mime = 'image/jpeg'

        if (isNativeApp()) {
          const photo = await CapCamera.getPhoto({
            quality: 60,
            resultType: CameraResultType.DataUrl,
            source: CameraSource.Prompt,
          })
          if (!photo.dataUrl) return false
          dataUrl = photo.dataUrl
          mime = photo.format === 'png' ? 'image/png' : 'image/jpeg'
        } else {
          dataUrl = await pickImage()
          if (!dataUrl) return false
        }

        return await processImage(dataUrl, mime)
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Analyse impossible'
        if (msg.toLowerCase().includes('cancel') || msg.toLowerCase().includes('user')) {
          return false
        }
        setImagePreview(null)
        setPhase('error')
        setMessage(formatScanError(e))
        return false
      }
    },
    [phase, pickImage, processImage, reset]
  )

  const scanning = phase === 'scanning'

  return (
    <ReceiptScanContext.Provider value={{ startScan, scanning }}>
      {children}
      <ReceiptScanOverlay
        open={phase !== 'idle'}
        phase={phase}
        imagePreview={imagePreview}
        message={message}
        createdCount={createdCount}
        onClose={reset}
        onRetry={retryScan}
      />
    </ReceiptScanContext.Provider>
  )
}

export function useReceiptScan() {
  const ctx = useContext(ReceiptScanContext)
  if (!ctx) throw new Error('useReceiptScan must be used within ReceiptScanProvider')
  return ctx
}
