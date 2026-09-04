'use client'

import { useCallback, useEffect, useMemo, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Capacitor } from '@capacitor/core'
import { Browser } from '@capacitor/browser'
import AppLogo from '@/components/AppLogo'
import { Eye, EyeOff } from 'lucide-react'
import Button from '@/components/Button'
import Input from '@/components/Input'
import {
  login,
  register,
  redirectToVerification,
  setPendingVerificationEmail,
  checkRegisterAvailability,
  hydrateAuthSession,
  isAuthenticated,
  getToken,
} from '@/lib/auth'
import {
  validateLoginField,
  applyAvailabilityToField,
  isLoginFormValid,
  type LoginField,
  type LoginFormValues,
  type RegisterAvailability,
} from '@/lib/loginValidation'
import { toast } from 'sonner'
import { getGoogleOAuthOrigin } from '@/lib/google-oauth-origin'
import { SmsMonitor } from '@/lib/capacitor/app-notifications'

type TouchedState = Partial<Record<LoginField, boolean>>

const INITIAL_AVAILABILITY: RegisterAvailability = {
  email: 'idle',
  name: 'idle',
}

function googleErrorMessage(code: string | null): string | null {
  if (!code) return null
  const map: Record<string, string> = {
    google_config: 'Connexion Google non configurée (CLIENT_ID / SECRET).',
    google_denied: 'Connexion Google annulée.',
    google_token: 'Échange Google impossible. Réessayez.',
    google_session: 'Session Google invalide.',
    google_state: 'Session Google expirée. Veuillez recommencer.',
    google_nonce: 'Sécurité Google : relancez la connexion depuis l’app.',
    google_failed: 'Connexion Google impossible.',
    access_denied: 'Connexion Google annulée.',
  }
  return map[code] || decodeURIComponent(code)
}

function LoginPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [touched, setTouched] = useState<TouchedState>({})
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const [availability, setAvailability] =
    useState<RegisterAvailability>(INITIAL_AVAILABILITY)

  useEffect(() => {
    const err = googleErrorMessage(searchParams.get('error'))
    if (err) toast.error(err)
  }, [searchParams])

  useEffect(() => {
    let cancelled = false
    void (async () => {
      await hydrateAuthSession()
      if (cancelled) return
      if (getToken() && isAuthenticated()) {
        router.replace('/')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [router])

  const formValues: LoginFormValues = useMemo(
    () => ({ isLogin, name, email, password, confirmPassword }),
    [isLogin, name, email, password, confirmPassword]
  )

  const shouldShowFeedback = useCallback(
    (field: LoginField) => {
      if (submitAttempted || touched[field]) return true
      const values: Record<LoginField, string> = {
        name,
        email,
        password,
        confirmPassword,
      }
      return values[field].length > 0
    },
    [touched, submitAttempted, name, email, password, confirmPassword]
  )

  useEffect(() => {
    if (isLogin) {
      setAvailability(INITIAL_AVAILABILITY)
      return
    }

    const emailBase = validateLoginField('email', formValues)
    const nameBase = validateLoginField('name', formValues)

    const needsEmailCheck = emailBase.valid && email.trim().length > 0
    const needsNameCheck = nameBase.valid && name.trim().length > 0

    if (!needsEmailCheck && !needsNameCheck) {
      setAvailability(INITIAL_AVAILABILITY)
      return
    }

    setAvailability({
      email: needsEmailCheck ? 'checking' : 'idle',
      name: needsNameCheck ? 'checking' : 'idle',
    })

    const timer = setTimeout(async () => {
      try {
        const data = await checkRegisterAvailability({
          email: needsEmailCheck ? email : undefined,
          name: needsNameCheck ? name : undefined,
        })

        setAvailability({
          email: !needsEmailCheck
            ? 'idle'
            : data.email?.available
              ? 'available'
              : 'taken',
          name: !needsNameCheck
            ? 'idle'
            : data.name?.available
              ? 'available'
              : 'taken',
        })
      } catch {
        setAvailability((prev) => ({
          email:
            prev.email === 'checking' && needsEmailCheck ? 'idle' : prev.email,
          name: prev.name === 'checking' && needsNameCheck ? 'idle' : prev.name,
        }))
      }
    }, 450)

    return () => clearTimeout(timer)
  }, [isLogin, email, name, formValues])

  const resolveFieldProps = useCallback(
    (field: LoginField) => {
      const base = validateLoginField(field, formValues)
      const withAvailability =
        field === 'email' || field === 'name'
          ? applyAvailabilityToField(field, base, availability[field])
          : base
      const show = shouldShowFeedback(field)
      return {
        error: show && !withAvailability.valid ? withAvailability.error : undefined,
        valid: show && withAvailability.valid ? true : undefined,
        checking: Boolean(
          'checking' in withAvailability && withAvailability.checking
        ),
      }
    },
    [formValues, availability, shouldShowFeedback]
  )

  const markTouched = (field: LoginField) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
  }

  const switchMode = () => {
    setIsLogin((v) => !v)
    setSubmitAttempted(false)
    setTouched({})
    setShowEmailForm(true)
  }

  const startGoogle = async () => {
    setGoogleLoading(true)
    const isNative = Capacitor.isNativePlatform()
    const origin = getGoogleOAuthOrigin() || window.location.origin
    let url = `${origin}/api/auth/google`

    if (isNative) {
      const bytes = new Uint8Array(32)
      crypto.getRandomValues(bytes)
      const clientNonce = Array.from(bytes, (b) =>
        b.toString(16).padStart(2, '0')
      ).join('')
      sessionStorage.setItem('mp_oauth_client_nonce', clientNonce)
      url += `?mobile=1&client_nonce=${encodeURIComponent(clientNonce)}`
      try {
        // Chrome système (évite WebView / Custom Tab → « Accès bloqué »)
        await SmsMonitor.openExternalUrl({ url })
      } catch {
        try {
          await Browser.open({ url, presentationStyle: 'popover' })
        } catch {
          sessionStorage.removeItem('mp_oauth_client_nonce')
          setGoogleLoading(false)
          toast.error('Impossible d’ouvrir Chrome pour Google.')
        }
      }
      return
    }
    window.location.href = url
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitAttempted(true)

    if (!isLoginFormValid(formValues, isLogin ? undefined : availability)) {
      return
    }

    setLoading(true)
    try {
      if (isLogin) {
        const response = await login(email.trim(), password)
        if (response.success) {
          await hydrateAuthSession()
          toast.success('Connexion réussie !')
          router.push('/')
        } else if (response.code === 'EMAIL_NOT_VERIFIED') {
          toast.error(response.message || 'Email non vérifié')
          redirectToVerification(email.trim())
        } else if (response.code === 'USE_GOOGLE') {
          toast.error(response.message || 'Utilisez Google pour ce compte')
        } else {
          toast.error(response.message || 'Connexion impossible')
        }
      } else {
        const response = await register(email.trim(), password, name.trim())
        if (response.success) {
          setPendingVerificationEmail(email.trim())
          toast.success('Compte créé. 1 mois Premium offert — vérifiez votre email.')
          router.push(`/verify-email?email=${encodeURIComponent(email.trim())}`)
        } else {
          toast.error(response.message || 'Inscription impossible')
        }
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Une erreur est survenue'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const nameProps = resolveFieldProps('name')
  const emailProps = resolveFieldProps('email')
  const passwordProps = resolveFieldProps('password')
  const confirmProps = resolveFieldProps('confirmPassword')

  const formValid = isLoginFormValid(
    formValues,
    isLogin ? undefined : availability
  )

  const passwordHint =
    !isLogin &&
    !passwordProps.error &&
    !passwordProps.valid &&
    !shouldShowFeedback('password')
      ? 'Minimum 10 caractères'
      : undefined

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="flex flex-col items-center mb-8">
            <AppLogo size="lg" priority className="mb-4 shadow-lg shadow-[#2563EB]/30" />
            <h1 className="text-3xl font-bold text-gray-900">MES POCHES</h1>
            <p className="text-gray-500 mt-2 text-center">
              {isLogin ? 'Connectez-vous à votre compte' : 'Créez votre compte'}
            </p>
          </div>

          <div className="card p-6 space-y-4">
            <button
              type="button"
              onClick={startGoogle}
              disabled={loading || googleLoading}
              className="w-full flex items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm font-semibold text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-60 touch-manipulation"
            >
              <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden>
                <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.2 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.5-.4-3.5z"/>
                <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.2 6.1 29.3 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"/>
                <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.3 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
                <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.2 5.6l.1.1 6.2 5.2C39.2 37.3 44 32 44 24c0-1.3-.1-2.5-.4-3.5z"/>
              </svg>
              {googleLoading ? 'Redirection…' : 'Continuer avec Google'}
            </button>

            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-3 text-gray-400 uppercase tracking-wide">
                  ou
                </span>
              </div>
            </div>

            {!showEmailForm ? (
              <button
                type="button"
                onClick={() => setShowEmailForm(true)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 touch-manipulation"
              >
                Continuer avec email
              </button>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                {!isLogin && (
                  <Input
                    label="Nom"
                    name="name"
                    type="text"
                    placeholder="Votre nom"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={() => markTouched('name')}
                    disabled={loading}
                    autoComplete="name"
                    error={nameProps.error}
                    valid={nameProps.valid}
                    checking={nameProps.checking}
                  />
                )}

                <Input
                  label="Email"
                  name="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => markTouched('email')}
                  disabled={loading}
                  autoComplete="email"
                  error={emailProps.error}
                  valid={emailProps.valid}
                  checking={emailProps.checking}
                />

                <div className="relative">
                  <Input
                    label="Mot de passe"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => markTouched('password')}
                    disabled={loading}
                    autoComplete={isLogin ? 'current-password' : 'new-password'}
                    error={passwordProps.error}
                    hint={passwordHint}
                    valid={passwordProps.valid}
                    showStatusIcon={false}
                    className="pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-[2.35rem] text-gray-500 touch-manipulation z-10"
                    tabIndex={-1}
                    aria-label={
                      showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {!isLogin && (
                  <div className="relative">
                    <Input
                      label="Confirmer le mot de passe"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onBlur={() => markTouched('confirmPassword')}
                      disabled={loading}
                      autoComplete="new-password"
                      error={confirmProps.error}
                      valid={confirmProps.valid}
                      showStatusIcon={false}
                      className="pr-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-[2.35rem] text-gray-500 touch-manipulation z-10"
                      tabIndex={-1}
                      aria-label={
                        showConfirmPassword
                          ? 'Masquer la confirmation'
                          : 'Afficher la confirmation'
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading || (submitAttempted && !formValid)}
                  fullWidth
                  size="lg"
                >
                  {loading
                    ? 'Chargement...'
                    : isLogin
                      ? 'Se connecter'
                      : 'Créer mon compte'}
                </Button>

                {!isLogin && (
                  <p className="text-center text-xs text-primary-600 font-medium -mt-1">
                    1 mois Premium offert lors de la création du compte
                  </p>
                )}

                <p className="text-center text-sm text-gray-600">
                  {isLogin ? 'Pas encore de compte ?' : 'Déjà un compte ?'}
                  <button
                    type="button"
                    onClick={switchMode}
                    className="ml-2 text-primary-500 hover:text-primary-600 font-semibold touch-manipulation"
                  >
                    {isLogin ? "S'inscrire" : 'Se connecter'}
                  </button>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-surface flex items-center justify-center">
          <p className="text-gray-500 text-sm">Chargement…</p>
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  )
}
