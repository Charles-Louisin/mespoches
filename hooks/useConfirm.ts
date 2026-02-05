import { useState, useRef } from 'react'

interface ConfirmOptions {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
}

interface ConfirmState extends ConfirmOptions {
  isOpen: boolean
  onConfirm: () => void
}

export const useConfirm = () => {
  const [confirmState, setConfirmState] = useState<ConfirmState>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirmer',
    cancelText: 'Annuler',
    variant: 'danger',
    onConfirm: () => {}
  })

  const resolveRef = useRef<((value: boolean) => void) | null>(null)

  const confirm = (options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      resolveRef.current = resolve

      setConfirmState({
        isOpen: true,
        ...options,
        confirmText: options.confirmText || 'Confirmer',
        cancelText: options.cancelText || 'Annuler',
        variant: options.variant || 'danger',
        onConfirm: () => {
          if (resolveRef.current) {
            resolveRef.current(true)
            resolveRef.current = null
          }
          setConfirmState(prev => ({ ...prev, isOpen: false }))
        }
      })
    })
  }

  const closeConfirm = () => {
    if (resolveRef.current) {
      resolveRef.current(false)
      resolveRef.current = null
    }
    setConfirmState(prev => ({ ...prev, isOpen: false }))
  }

  return {
    confirm,
    confirmState,
    closeConfirm
  }
}
