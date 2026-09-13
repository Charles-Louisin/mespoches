'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'

interface SelectModalProps {
  label?: string
  labelAction?: React.ReactNode
  value: string
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void
  options: { value: string; label: string }[]
  error?: string
  required?: boolean
  disabled?: boolean
  className?: string
  placeholder?: string
}

export default function SelectModal({
  label,
  labelAction,
  value,
  onChange,
  options,
  error,
  required,
  disabled,
  className = '',
  placeholder = 'Sélectionner...',
}: SelectModalProps) {
  const [isOpen, setIsOpen] = useState(false)

  const selectedOption = options.find((opt) => opt.value === value)

  const handleSelect = (newValue: string) => {
    // Créer un événement synthétique compatible avec les handlers React standards
    const syntheticEvent = {
      target: { value: newValue },
      currentTarget: { value: newValue },
    } as React.ChangeEvent<HTMLSelectElement>
    onChange(syntheticEvent)
    setIsOpen(false)
  }

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-sm font-medium text-gray-700">{label}</label>
          {labelAction}
        </div>
      )}

      <button
        type="button"
        onClick={() => !disabled && setIsOpen(true)}
        className={`w-full px-4 py-2.5 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-left ${
          error ? 'border-red-500' : 'border-gray-200'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'touch-manipulation'}`}
        disabled={disabled}
      >
        <span className={selectedOption ? 'text-gray-900' : 'text-gray-400'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
      </button>

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

      {/* Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/40"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-xl max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-ink">
                {label || 'Sélectionner'}
              </h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-medium touch-manipulation"
              >
                Fermer
              </button>
            </div>

            {/* Options */}
            <div className="overflow-y-auto flex-1">
              {options.map((option) => {
                const isSelected = option.value === value
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    className={`w-full px-5 py-3.5 flex items-center justify-between border-b border-gray-50 touch-manipulation transition-colors ${
                      isSelected
                        ? 'bg-primary-50'
                        : 'hover:bg-gray-50 active:bg-gray-100'
                    }`}
                  >
                    <span
                      className={`text-left ${
                        isSelected
                          ? 'font-semibold text-primary-600'
                          : 'text-gray-900'
                      }`}
                    >
                      {option.label}
                    </span>
                    {isSelected && (
                      <Check size={20} className="text-primary-600" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
