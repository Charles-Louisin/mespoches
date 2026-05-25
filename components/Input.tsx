import { InputHTMLAttributes, forwardRef } from 'react'
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  valid?: boolean
  /** Afficher l’icône ✓ / ⚠ à droite (désactiver si bouton custom, ex. œil mot de passe) */
  showStatusIcon?: boolean
  checking?: boolean
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      valid = false,
      showStatusIcon = true,
      checking = false,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || props.name
    const showValid = valid && !error && !checking
    const statusIcon =
      showStatusIcon && (error || showValid || checking)
    const borderClass = error
      ? 'border-red-500 focus:ring-red-500/30'
      : showValid
        ? 'border-green-500 focus:ring-green-500/30'
        : checking
          ? 'border-primary-300 focus:ring-primary-500/30'
          : 'border-gray-200 focus:ring-primary-500'

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            aria-invalid={!!error}
            aria-describedby={
              error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
            }
            className={`w-full px-4 py-2.5 border rounded-2xl focus:outline-none focus:ring-2 focus:border-transparent bg-white transition-colors ${borderClass} ${
              statusIcon ? 'pr-10' : ''
            } ${className}`}
            {...props}
          />
          {showStatusIcon && error && (
            <AlertCircle
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500 pointer-events-none"
              aria-hidden
            />
          )}
          {showStatusIcon && checking && (
            <Loader2
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-500 animate-spin pointer-events-none"
              aria-hidden
            />
          )}
          {showStatusIcon && showValid && (
            <CheckCircle2
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500 pointer-events-none"
              aria-hidden
            />
          )}
        </div>
        {error && (
          <p id={`${inputId}-error`} className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
            {error}
          </p>
        )}
        {!error && hint && (
          <p
            id={`${inputId}-hint`}
            className={`mt-1.5 text-sm ${showValid ? 'text-green-600' : 'text-gray-500'}`}
          >
            {hint}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
