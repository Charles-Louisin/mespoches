'use client'

import PageShell from '@/components/PageShell'
import Header from '@/components/Header'
import { Smartphone, Wifi, Cloud, Shield, Zap, Heart } from 'lucide-react'

export default function AboutPage() {
  const features = [
    {
      icon: Smartphone,
      title: 'Application PWA',
      description: 'Installable sur mobile et desktop comme une app native'
    },
    {
      icon: Wifi,
      title: 'Mode offline',
      description: 'Fonctionne sans connexion internet'
    },
    {
      icon: Cloud,
      title: 'Synchronisation auto',
      description: 'Vos données se synchronisent automatiquement'
    },
    {
      icon: Shield,
      title: 'Sécurisé',
      description: 'Authentification JWT et données chiffrées'
    },
    {
      icon: Zap,
      title: 'Rapide',
      description: 'Performance optimale avec cache intelligent'
    },
    {
      icon: Heart,
      title: 'Gratuit',
      description: 'Application 100% gratuite et open source'
    }
  ]

  return (
    <PageShell>
      <Header title="À propos" showBack />

      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Logo et nom */}
        <div className="balance-gradient rounded-3xl p-8 text-white text-center shadow-lg shadow-primary-500/25">
          <h1 className="text-3xl font-bold mb-2">MES POCHES</h1>
          <p className="text-primary-100">Gestion financière personnelle</p>
          <p className="text-sm text-primary-200 mt-4">Version 1.0.0</p>
        </div>

        {/* Description */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            À propos de l'application
          </h2>
          <p className="text-gray-600 leading-relaxed">
            MES POCHES est une application moderne de gestion financière personnelle. 
            Gérez vos portefeuilles, suivez vos transactions et analysez vos dépenses 
            en toute simplicité.
          </p>
        </div>

        {/* Fonctionnalités */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 px-1">
            Fonctionnalités
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div
                  key={index}
                  className="card p-4"
                >
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center mb-3">
                    <Icon size={20} className="text-primary-500" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

       

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 py-4">
          <p className="mt-2">© 2026 MES POCHES</p>
        </div>
      </main>

    </PageShell>
  )
}
