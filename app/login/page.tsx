'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Wallet, Eye, EyeOff } from 'lucide-react'
import Button from '@/components/Button'
import Input from '@/components/Input'
import {
  login,
  register,
  redirectToVerification,
  setPendingVerificationEmail,
  checkRegisterAvailability,
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

type TouchedState = Partial<Record<LoginField, boolean>>

const INITIAL_AVAILABILITY: RegisterAvailability = {
  email: 'idle',
  name: 'idle',
}

export default function LoginPage() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [touched, setTouched] = useState<TouchedState>({})
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const [availability, setAvailability] =
    useState<RegisterAvailability>(INITIAL_AVAILABILITY)

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

    setAvailability((prev) => ({
      email: needsEmailCheck ? 'checking' : 'idle',
      name: needsNameCheck ? 'checking' : 'idle',
    }))

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
      if (!shouldShowFeedback(field)) {
        return { error: undefined, hint: undefined, valid: false, checking: false }
      }

      const base = validateLoginField(field, formValues)

      if (!isLogin && field === 'email' && base.valid) {
        return applyAvailabilityToField('email', base, availability.email)
      }
      if (!isLogin && field === 'name' && base.valid) {
        return applyAvailabilityToField('name', base, availability.name)
      }

      if (base.valid) {
        return { valid: true, error: undefined, hint: undefined, checking: false }
      }

      return {
        error: base.error,
        hint: base.hint,
        valid: false,
        checking: false,
      }
    },
    [formValues, shouldShowFeedback, isLogin, availability]
  )

  const markTouched = (field: LoginField) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
  }

  const switchMode = () => {
    setIsLogin(!isLogin)
    setConfirmPassword('')
    setTouched({})
    setSubmitAttempted(false)
    setAvailability(INITIAL_AVAILABILITY)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitAttempted(true)
    setTouched({
      email: true,
      password: true,
      ...(!isLogin ? { name: true, confirmPassword: true } : {}),
    })

    if (!isLoginFormValid(formValues, isLogin ? undefined : availability)) {
      toast.error('Corrigez les champs indiqués avant de continuer')
      return
    }

    setLoading(true)

    try {
      if (isLogin) {
        const response = await login(email.trim(), password)
        if (response.success) {
          toast.success('Connexion réussie !')
          router.push('/')
        } else if (response.code === 'EMAIL_NOT_VERIFIED') {
          toast.info('Vérifiez votre email pour continuer')
          redirectToVerification(email.trim())
        } else {
          toast.error(response.message || 'Email ou mot de passe incorrect')
        }
      } else {
        const response = await register(email.trim(), password, name.trim())
        if (response.success) {
          toast.success('Compte créé ! Consultez votre email pour le code.')
          setPendingVerificationEmail(email.trim())
          router.push(`/verify-email?email=${encodeURIComponent(email.trim())}`)
        } else {
          toast.error(response.message || 'Erreur lors de la création du compte')
        }
      }
    } catch (error: unknown) {
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
      ? 'Minimum 6 caractères'
      : undefined

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="flex flex-col items-center mb-8">
            <div className="w-20 h-20 balance-gradient rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-primary-500/30">
              <Wallet className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">MES POCHES</h1>
            <p className="text-gray-500 mt-2 text-center">
              {isLogin ? 'Connectez-vous à votre compte' : 'Créez votre compte'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="card p-6 space-y-4" noValidate>
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
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            {isLogin ? 'Pas encore de compte ?' : 'Déjà un compte ?'}
            <button
              type="button"
              onClick={switchMode}
              className="ml-2 text-primary-500 hover:text-primary-600 font-semibold touch-manipulation"
            >
              {isLogin ? "S'inscrire" : 'Se connecter'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
