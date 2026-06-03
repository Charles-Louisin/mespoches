'use client'

import Link from 'next/link'
import PageShell from '@/components/PageShell'
import Header from '@/components/Header'
import AppLogo from '@/components/AppLogo'
import { Smartphone, Wifi, Cloud, Shield, Zap, Heart } from 'lucide-react'

export default function AboutPage() {
  const features = [
    {
      icon: Smartphone,
      title: 'Application web & mobile',
      description: 'Utilisable dans le navigateur, en PWA ou via l’app Android'
    },
    {
      icon: Shield,
      title: 'Compte sécurisé',
      description: 'Connexion par e-mail et mot de passe, session protégée'
    },
    {
      icon: Zap,
      title: 'Formule gratuite',
      description: 'Poches, transactions, catégories et historique (3 derniers mois)'
    },
    {
      icon: Heart,
      title: 'Premium optionnel',
      description: 'Budgets, objectifs d’épargne, export, analytics et plus'
    }
  ]

  return (
    <PageShell>
      <Header title="À propos" showBack />

      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Logo et nom */}
        <div className="rounded-3xl p-8 text-center shadow-lg shadow-[#2563EB]/20 bg-[#2563EB] text-white">
          <div className="flex justify-center mb-4">
            <AppLogo size="xl" className="ring-4 ring-white/20" />
          </div>
          <h1 className="text-3xl font-bold mb-2">MES POCHES</h1>
          <p className="text-blue-100">vos finances, en poche</p>
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


        <div className="text-center text-sm text-gray-500 py-4">
          <p className="mt-2">© 2026 MES POCHES</p>
        </div>
      </main>

    </PageShell>
  )
}
