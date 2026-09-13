'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, Mail } from 'lucide-react'
import AppLogo from '@/components/AppLogo'
import Button from '@/components/Button'
import Input from '@/components/Input'
import {
  forgotPassword,
  resetPassword,
  hydrateAuthSession,
} from '@/lib/auth'
import { toast } from 'sonner'

function ForgotPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [step, setStep] = useState<'email' | 'reset'>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    const fromQuery = searchParams.get('email')
    if (fromQuery) setEmail(fromQuery.trim())
  }, [searchParams])

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setInterval(() => {
      setCooldown((s) => (s <= 1 ? 0 : s - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [cooldown])

  const sendCode = async () => {
    const trimmed = email.trim().toLowerCase()
    if (!trimmed.includes('@')) {
      toast.error('Entrez un email valide')
      return
    }
    setLoading(true)
    try {
      const response = await forgotPassword(trimmed)
      if (response.success) {
        setEmail(trimmed)
        setStep('reset')
        setCooldown(60)
        toast.success('Si un compte existe, un code a été envoyé par email.')
      } else if (response.code === 'RESEND_COOLDOWN') {
        setCooldown(response.cooldownSeconds ?? 60)
        toast.error(response.message || 'Attendez avant de renvoyer')
      } else {
        toast.error(response.message || 'Envoi impossible')
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Une erreur est survenue'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (cooldown > 0 || resending) return
    setResending(true)
    try {
      const response = await forgotPassword(email)
      if (response.success) {
        setCooldown(60)
        toast.success('Un nouveau code a été envoyé')
      } else if (response.code === 'RESEND_COOLDOWN') {
        setCooldown(response.cooldownSeconds ?? 60)
        toast.error(response.message || 'Attendez avant de renvoyer')
      } else {
        toast.error(response.message || "Erreur lors de l'envoi")
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Une erreur est survenue'
      )
    } finally {
      setResending(false)
    }
  }

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return
    if (code.length !== 6) {
      toast.error('Entrez le code à 6 chiffres')
      return
    }
    if (password.length < 10) {
      toast.error('Le mot de passe doit contenir au moins 10 caractères')
      return
    }
    if (password !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas')
      return
    }

    setLoading(true)
    try {
      const response = await resetPassword(email, code, password)
      if (response.success) {
        await hydrateAuthSession({ preserveExisting: true })
        toast.success(response.message || 'Mot de passe mis à jour')
        window.location.assign('/')
        return
      } else {
        toast.error(response.message || 'Code invalide')
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Une erreur est survenue'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="flex flex-col items-center mb-8">
            <AppLogo size="lg" priority className="mb-4" />
            <h1 className="text-2xl font-semibold text-ink">
              {step === 'email' ? 'Mot de passe oublié' : 'Nouveau mot de passe'}
            </h1>
            <p className="text-sm text-ink-mute mt-2 text-center">
              {step === 'email'
                ? 'Nous vous enverrons un code par email pour définir ou réinitialiser votre mot de passe.'
                : 'Entrez le code reçu, puis choisissez un nouveau mot de passe.'}
            </p>
          </div>

          <div className="card p-6 space-y-4">
            {step === 'email' ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  void sendCode()
                }}
                className="space-y-4"
              >
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  autoComplete="email"
                  required
                />
                <Button type="submit" loading={loading} fullWidth size="lg">
                  {loading ? 'Envoi…' : 'Recevoir le code'}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleReset} className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-primary-50 rounded-xl">
                  <Mail className="w-5 h-5 text-primary-500 shrink-0" />
                  <span className="text-sm text-gray-700 break-all">{email}</span>
                </div>

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
                    onChange={(e) =>
                      setCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                    }
                    disabled={loading}
                    maxLength={6}
                    className="w-full text-center text-2xl font-bold tracking-[0.5em] px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                <div className="relative">
                  <Input
                    label="Nouveau mot de passe"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Minimum 10 caractères"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    autoComplete="new-password"
                    showStatusIcon={false}
                    className="pr-11"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-[2.35rem] text-ink-mute z-10"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Masquer' : 'Afficher'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>

                <Input
                  label="Confirmer le mot de passe"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  autoComplete="new-password"
                  required
                />

                <Button type="submit" loading={loading} fullWidth size="lg">
                  {loading ? 'Enregistrement…' : 'Enregistrer le mot de passe'}
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => void handleResend()}
                    disabled={resending || cooldown > 0}
                    className="text-sm text-primary-500 hover:text-primary-600 font-semibold disabled:opacity-50"
                  >
                    {cooldown > 0
                      ? `Renvoyer le code (${cooldown}s)`
                      : resending
                        ? 'Envoi…'
                        : 'Renvoyer le code'}
                  </button>
                </div>
              </form>
            )}
          </div>

          <p className="text-center text-sm text-gray-600 mt-6">
            <button
              type="button"
              onClick={() => router.push('/login')}
              className="text-primary-500 hover:text-primary-600 font-semibold"
            >
              Retour à la connexion
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-surface flex items-center justify-center">
          <p className="text-gray-500">Chargement…</p>
        </div>
      }
    >
      <ForgotPasswordContent />
    </Suspense>
  )
}
