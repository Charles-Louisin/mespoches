'use client'

import { Component, ReactNode } from 'react'
import { WifiOff } from 'lucide-react'
import Button from './Button'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class NetworkErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    // Ne capturer que les erreurs réseau, pas les erreurs de code
    if (
      error.message.includes('fetch') ||
      error.message.includes('network') ||
      error.message.includes('Failed to load')
    ) {
      return { hasError: true, error }
    }
    // Laisser les autres erreurs se propager
    throw error
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Erreur réseau capturée:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-surface flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-gray-100 flex items-center justify-center">
              <WifiOff size={40} className="text-gray-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-ink mb-2">
                Problème de connexion
              </h2>
              <p className="text-ink-soft">
                Impossible de charger certaines ressources. Vérifiez votre connexion internet.
              </p>
            </div>
            <Button
              fullWidth
              onClick={() => {
                this.setState({ hasError: false, error: null })
                window.location.reload()
              }}
            >
              Réessayer
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
