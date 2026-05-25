'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Wallet, Mail } from 'lucide-react'
import Button from '@/components/Button'
import {
  verifyEmail,
  resendVerificationCode,
  getPendingVerificationEmail,
  isAuthenticated,
} from '@/lib/auth'
import { toast } from 'sonner'

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    if (isAuthenticated()) {
      router.replace('/')
      return
    }

    const fromQuery = searchParams.get('email')
    const pending = getPendingVerificationEmail()
    const resolved = fromQuery || pending || ''

    if (!resolved) {
      router.replace('/login')
      return
    }
    setEmail(resolved)
  }, [searchParams, router])

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setInterval(() => {
      setCooldown((s) => (s <= 1 ? 0 : s - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [cooldown])

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      toast.error('Email manquant')
      return
    }

    if (code.length !== 6) {
      toast.error('Entrez le code à 6 chiffres')
      return
    }

    setLoading(true)
    try {
      const response = await verifyEmail(email, code)
      if (response.success) {
        toast.success('Email vérifié ! Connexion en cours...')
        router.push('/')
      } else {
        toast.error(response.message || 'Code invalide')
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Une erreur est survenue'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const handleResend = useCallback(async () => {
    if (!email || cooldown > 0) return

    setResending(true)
    try {
      const response = await resendVerificationCode(email)
      if (response.success) {
        toast.success('Un nouveau code a été envoyé')
        setCooldown(60)
      } else if (response.code === 'RESEND_COOLDOWN') {
        const seconds = response.cooldownSeconds ?? 60
        setCooldown(seconds)
        toast.error(
          response.message ||
            `Attendez ${seconds}s avant de renvoyer le code`
        )
      } else {
        toast.error(response.message || "Erreur lors de l'envoi")
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Une erreur est survenue'
      toast.error(message)
    } finally {
      setResending(false)
    }
  }, [email, cooldown])

  const handleCodeChange = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 6)
    setCode(digits)
  }

  if (!email) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <p className="text-gray-500">Chargement...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="flex flex-col items-center mb-8">
            <div className="w-20 h-20 balance-gradient rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-primary-500/30">
              <Wallet className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Vérification</h1>
            <p className="text-gray-500 mt-2 text-center">
              Entrez le code à 6 chiffres envoyé à votre adresse email
            </p>
          </div>

          <div className="card p-6 space-y-5">
            <div className="flex items-center gap-3 p-3 bg-primary-50 rounded-xl">
              <Mail className="w-5 h-5 text-primary-500 shrink-0" />
              <span className="text-sm text-gray-700 break-all">{email}</span>
            </div>

            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Code de vérification
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="000000"
                  value={code}
                  onChange={(e) => handleCodeChange(e.target.value)}
                  disabled={loading}
                  maxLength={6}
                  className="w-full text-center text-2xl font-bold tracking-[0.5em] px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>

              <Button type="submit" disabled={loading} fullWidth size="lg">
                {loading ? 'Vérification...' : 'Vérifier et se connecter'}
              </Button>
            </form>

            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2">
                Vous n&apos;avez pas reçu le code ?
              </p>
              <button
                type="button"
                onClick={handleResend}
                disabled={resending || cooldown > 0}
                className="text-sm text-primary-500 hover:text-primary-600 font-semibold disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
              >
                {cooldown > 0
                  ? `Renvoyer le code (${cooldown}s)`
                  : resending
                    ? 'Envoi en cours...'
                    : 'Renvoyer le code'}
              </button>
            </div>
          </div>

          <p className="text-center text-sm text-gray-600 mt-6">
            <button
              type="button"
              onClick={() => router.push('/login')}
              className="text-primary-500 hover:text-primary-600 font-semibold touch-manipulation"
            >
              Retour à la connexion
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
