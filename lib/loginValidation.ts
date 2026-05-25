const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export type LoginField = 'name' | 'email' | 'password' | 'confirmPassword'

export type AvailabilityStatus = 'idle' | 'checking' | 'available' | 'taken'

export interface LoginFormValues {
  isLogin: boolean
  name: string
  email: string
  password: string
  confirmPassword: string
}

export interface RegisterAvailability {
  email: AvailabilityStatus
  name: AvailabilityStatus
}

export function validateLoginField(
  field: LoginField,
  values: LoginFormValues
): { error?: string; hint?: string; valid: boolean } {
  const { isLogin, name, email, password, confirmPassword } = values

  switch (field) {
    case 'name': {
      if (isLogin) return { valid: false }
      const trimmed = name.trim()
      if (!trimmed) {
        return { error: 'Le nom est requis', valid: false }
      }
      if (trimmed.length < 2) {
        return { error: 'Minimum 2 caractères', valid: false }
      }
      return { valid: true }
    }
    case 'email': {
      const trimmed = email.trim()
      if (!trimmed) {
        return { error: "L'email est requis", valid: false }
      }
      if (!EMAIL_RE.test(trimmed)) {
        return { error: 'Format email invalide', valid: false }
      }
      return { valid: true }
    }
    case 'password': {
      if (!password) {
        return { error: 'Le mot de passe est requis', valid: false }
      }
      if (!isLogin && password.length < 6) {
        return { error: 'Minimum 6 caractères', valid: false }
      }
      return { valid: true }
    }
    case 'confirmPassword': {
      if (isLogin) return { valid: false }
      if (!confirmPassword) {
        return { error: 'Confirmez votre mot de passe', valid: false }
      }
      if (confirmPassword !== password) {
        return { error: 'Les mots de passe ne correspondent pas', valid: false }
      }
      return { valid: true }
    }
    default:
      return { valid: false }
  }
}

export function applyAvailabilityToField(
  field: 'name' | 'email',
  base: { error?: string; hint?: string; valid: boolean },
  status: AvailabilityStatus
): { error?: string; hint?: string; valid: boolean; checking?: boolean } {
  if (!base.valid) return base

  if (status === 'checking') {
    return { valid: false, checking: true }
  }
  if (status === 'taken') {
    return {
      error:
        field === 'email'
          ? 'Cet email est déjà utilisé'
          : 'Ce nom est déjà utilisé',
      valid: false,
    }
  }
  if (status === 'available') {
    return { valid: true }
  }
  return { valid: false }
}

export function isLoginFormValid(
  values: LoginFormValues,
  availability?: RegisterAvailability
): boolean {
  const fields: LoginField[] = values.isLogin
    ? ['email', 'password']
    : ['name', 'email', 'password', 'confirmPassword']

  for (const f of fields) {
    const base = validateLoginField(f, values)
    if (!base.valid) return false

    if (!values.isLogin && f === 'email') {
      if (availability?.email !== 'available') return false
    }
    if (!values.isLogin && f === 'name') {
      if (availability?.name !== 'available') return false
    }
  }

  return true
}
