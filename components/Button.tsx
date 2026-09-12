'use client'

import { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  /** Désactive le bouton et affiche une barre de chargement (anti double-clic). */
  loading?: boolean
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  className = '',
  disabled,
  onClick,
  type = 'button',
  ...props
}: ButtonProps) {
  const baseStyles =
    'relative font-semibold rounded-xl touch-manipulation transition-transform duration-150 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center active:scale-[0.97] disabled:active:scale-100'

  const variantStyles = {
    primary:
      'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 shadow-soft',
    secondary: 'bg-primary-50 text-primary-800 hover:bg-primary-100 active:bg-primary-100',
    outline:
      'border border-primary-600/30 text-primary-700 hover:bg-primary-50 active:bg-primary-50',
    ghost: 'text-primary-700 hover:bg-primary-50 active:bg-primary-50',
  }

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-6 py-3.5 text-lg',
  }

  const widthStyle = fullWidth ? 'w-full' : ''
  const barTone =
    variant === 'primary'
      ? 'bg-white/25 [&_span]:bg-white'
      : 'bg-primary-600/15 [&_span]:bg-primary-600'

  return (
    <button
      type={type}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${className}`}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      onClick={(e) => {
        if (loading || disabled) {
          e.preventDefault()
          return
        }
        onClick?.(e)
      }}
      {...props}
    >
      {loading && (
        <span
          className={`pointer-events-none absolute inset-x-3 top-2 h-0.5 overflow-hidden rounded-full ${barTone}`}
          aria-hidden
        >
          <span className="loading-bar-indeterminate block h-full w-1/2 rounded-full" />
        </span>
      )}
      <span
        className={`inline-flex items-center justify-center gap-2 ${
          loading ? 'opacity-80' : ''
        }`}
      >
        {children}
      </span>
    </button>
  )
}
