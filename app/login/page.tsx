'use client'

import { useCallback, useEffect, useMemo, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
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
  redirectAfterAuth,
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
import LoadingBar from '@/components/LoadingBar'
import StoreChrome from '@/components/store/StoreChrome'
import Link from 'next/link'

type TouchedState = Partial<Record<LoginField, boolean>>

const INITIAL_AVAILABILITY: RegisterAvailability = {
  name: 'idle',
}

function googleErrorMessage(code: string | null): string | null {
  if (!code) return null
  const map: Record<string, string> = {
    google_config: 'La connexion Google est temporairement indisponible. Réessayez plus tard.',
    google_denied: 'Connexion Google annulée.',
    google_token: 'Impossible de finaliser la connexion Google. Réessayez.',
    google_session: 'Session Google invalide. Veuillez recommencer.',
    google_state: 'Session expirée. Veuillez recommencer.',
    google_nonce: 'La connexion Google n’a pas pu aboutir. Réessayez.',
    google_failed: 'Connexion Google impossible. Réessayez.',
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
      if (isAuthenticated()) {
        redirectAfterAuth()
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

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

    const nameBase = validateLoginField('name', formValues)
    const needsNameCheck = nameBase.valid && name.trim().length > 0

    if (!needsNameCheck) {
      setAvailability(INITIAL_AVAILABILITY)
      return
    }

    setAvailability({ name: 'checking' })

    const timer = setTimeout(async () => {
      try {
        const data = await checkRegisterAvailability({ name })
        setAvailability({ name: data.name?.available ? 'available' : 'taken' })
      } catch {
        setAvailability((prev) => ({
          name: prev.name === 'checking' ? 'idle' : prev.name,
        }))
      }
    }, 450)

    return () => clearTimeout(timer)
  }, [isLogin, name, formValues])

  const resolveFieldProps = useCallback(
    (field: LoginField) => {
      const base = validateLoginField(field, formValues)
      const withAvailability =
        field === 'name' ? applyAvailabilityToField(base, availability.name) : base
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
    if (googleLoading || loading) return
    setGoogleLoading(true)
    const origin = getGoogleOAuthOrigin() || window.location.origin
    const url = `${origin}/api/auth/google?web=1`
    window.location.href = url
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading || googleLoading) return
    setSubmitAttempted(true)

    if (!isLoginFormValid(formValues, isLogin ? undefined : availability)) {
      return
    }

    setLoading(true)
    try {
      if (isLogin) {
        const response = await login(email.trim(), password)
        if (response.success) {
          await hydrateAuthSession({ preserveExisting: true })
          redirectAfterAuth()
          return
        } else if (response.code === 'JWT_MISMATCH') {
          toast.error('Connexion impossible pour le moment. Réessayez plus tard.')
        } else if (response.code === 'EMAIL_NOT_VERIFIED') {
          toast.error(response.message || 'Email non vérifié')
          redirectToVerification(email.trim())
        } else if (
          response.code === 'NEED_PASSWORD' ||
          response.code === 'USE_GOOGLE'
        ) {
          toast.error(
            response.message ||
              'Pas encore de mot de passe. Utilisez « Mot de passe oublié ».'
          )
          router.push(
            `/forgot-password?email=${encodeURIComponent(email.trim())}`
          )
        } else {
          toast.error(response.message || 'Connexion impossible')
        }
      } else {
        const response = await register(email.trim(), password, name.trim())
        if (response.success) {
          setPendingVerificationEmail(email.trim())
          toast.success('Compte créé. Vérifiez votre e-mail pour l’activer.')
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
    <StoreChrome compact>
      <div className="auth-split">
        <section className="auth-brand">
          <p className="auth-brand-mark" aria-hidden>
            {'MES\nPOCHES'}
          </p>
          <div className="auth-brand-copy">
            <AppLogo size="lg" priority />
            <h1>Votre espace compte</h1>
            <p>
              Connectez-vous pour administrer le service ou gérer un compte MES POCHES. Le
              suivi quotidien de vos poches se fait dans l’application mobile.
            </p>
            <ul className="auth-brand-list">
              <li>
                <b>—</b>
                <span>Téléchargement officiel de l’APK Android depuis ce site.</span>
              </li>
              <li>
                <b>—</b>
                <span>Vos mouvements ne sont enregistrés qu’après validation.</span>
              </li>
              <li>
                <b>—</b>
                <span>Données personnelles traitées pour le seul fonctionnement du service.</span>
              </li>
            </ul>
          </div>
        </section>

        <section className="auth-form-col">
          <div className="auth-card">
            <h2>{isLogin ? 'Connexion' : 'Créer un compte'}</h2>
            <p className="auth-lead">
              {isLogin
                ? 'Utilisez Google ou votre e-mail.'
                : 'Un e-mail de vérification vous sera envoyé.'}
            </p>

            <div className="space-y-4">
            <Button
              type="button"
              variant="outline"
              fullWidth
              size="lg"
              onClick={startGoogle}
              loading={googleLoading}
              disabled={loading}
              className="gap-3 border-black/[0.08] bg-white text-ink hover:bg-white/80 !shadow-none"
            >
              <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden>
                <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.2 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.5-.4-3.5z"/>
                <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.2 6.1 29.3 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"/>
                <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.3 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
                <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.2 5.6l.1.1 6.2 5.2C39.2 37.3 44 32 44 24c0-1.3-.1-2.5-.4-3.5z"/>
              </svg>
              {googleLoading ? 'Redirection…' : 'Continuer avec Google'}
            </Button>

            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-black/[0.08]" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white/80 px-3 text-[#6b6280]">ou</span>
              </div>
            </div>

            {!showEmailForm ? (
              <button
                type="button"
                onClick={() => setShowEmailForm(true)}
                className="w-full rounded-xl border border-black/[0.08] bg-white px-4 py-3 text-sm font-medium text-ink hover:bg-[#f7f5fb] touch-manipulation"
              >
                Continuer avec e-mail
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
                  label="E-mail"
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
                    className="absolute right-3 top-[2.35rem] text-ink-mute touch-manipulation z-10"
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

                {isLogin && (
                  <div className="flex justify-end -mt-1">
                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          `/forgot-password${
                            email.trim()
                              ? `?email=${encodeURIComponent(email.trim())}`
                              : ''
                          }`
                        )
                      }
                      className="text-sm text-[#2563EB] hover:underline font-medium touch-manipulation"
                    >
                      Mot de passe oublié ?
                    </button>
                  </div>
                )}

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
                      className="absolute right-3 top-[2.35rem] text-ink-mute touch-manipulation z-10"
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
                  loading={loading}
                  disabled={submitAttempted && !formValid}
                  fullWidth
                  size="lg"
                  className="!bg-[#2563eb] hover:!bg-[#1d4ed8]"
                >
                  {loading
                    ? 'Chargement...'
                    : isLogin
                      ? 'Se connecter'
                      : 'Créer mon compte'}
                </Button>

                <p className="text-center text-sm text-[#6b6280]">
                  {isLogin ? 'Pas encore de compte ?' : 'Déjà un compte ?'}
                  <button
                    type="button"
                    onClick={switchMode}
                    className="ml-2 text-[#1b1630] font-semibold touch-manipulation"
                  >
                    {isLogin ? "S'inscrire" : 'Se connecter'}
                  </button>
                </p>
              </form>
            )}
            </div>
            <p className="mt-6 text-center text-[12px] leading-relaxed text-[#6b6280]">
              En continuant, vous acceptez les{' '}
              <Link href="/legal/terms" className="font-semibold text-[#2563EB]">
                conditions
              </Link>{' '}
              et la{' '}
              <Link href="/legal/privacy" className="font-semibold text-[#2563EB]">
                confidentialité
              </Link>
              .
            </p>
          </div>
        </section>
      </div>
    </StoreChrome>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="store-root flex min-h-dvh items-center justify-center">
          <LoadingBar />
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  )
}
