'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import PageShell from '@/components/PageShell'
import Header from '@/components/Header'
import Link from 'next/link'
import { User, Mail, Calendar, Crown } from 'lucide-react'
import { isPremiumUser } from '@/lib/subscription'
import Button from '@/components/Button'
import ConfirmModal from '@/components/ConfirmModal'
import { useConfirm } from '@/hooks/useConfirm'
import { authApi, MeUser } from '@/lib/api'
import { logout } from '@/lib/auth'

export default function ProfilePage() {
  const { confirm, confirmState, closeConfirm } = useConfirm()
  const [user, setUser] = useState<MeUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const me = await authApi.me()
        setUser(me)
      } catch (error: any) {
        console.error('Erreur profil:', error)
        toast.error(error.message || 'Impossible de charger le profil')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const handleDeleteAccount = async () => {
    const confirmed = await confirm({
      title: 'Supprimer mon compte ?',
      message:
        'Cette action est irréversible. Toutes vos données (transactions, portefeuilles, catégories) seront supprimées définitivement.',
      confirmText: 'Oui, supprimer définitivement',
      cancelText: 'Annuler',
      variant: 'danger',
    })

    if (!confirmed) return

    try {
      await authApi.deleteMe()
      toast.success('Compte supprimé')
      logout()
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la suppression du compte')
    }
  }

  return (
    <PageShell>
      <Header title="Mon profil" showBack />

      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Card profil */}
        <div className="card p-6 text-center">
          <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-4">
            <User size={40} className="text-primary-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1">
            {loading ? 'Chargement...' : user?.name || 'Utilisateur'}
          </h2>
          {user && isPremiumUser(user) ? (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-1 rounded-full mt-2">
              <Crown size={12} />
              Premium
            </span>
          ) : (
            <Link
              href="/subscription"
              className="inline-block text-sm text-primary-600 font-medium mt-2"
            >
              Passer à Premium →
            </Link>
          )}
        </div>

        {/* Informations */}
        <div className="card overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex items-center gap-3">
            <Mail size={20} className="text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium text-gray-900">{user?.email || 'Non disponible'}</p>
            </div>
          </div>
          
          <div className="p-4 flex items-center gap-3">
            <Calendar size={20} className="text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Membre depuis</p>
              <p className="font-medium text-gray-900">
                {user?.created_at 
                  ? new Date(user.created_at).toLocaleDateString('fr-FR') 
                  : 'Non disponible'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Suppression compte */}
        <div className="card p-4">
          <h3 className="font-semibold text-gray-900 mb-2">Zone dangereuse</h3>
          <p className="text-sm text-gray-500 mb-4">
            Supprimer votre compte effacera définitivement vos données. Aucun retour en arrière n’est possible.
          </p>
          <Button variant="primary" fullWidth onClick={handleDeleteAccount}>
            Supprimer mon compte
          </Button>
        </div>
      </main>

      {/* Modal de confirmation */}
      <ConfirmModal
        isOpen={confirmState.isOpen}
        onClose={closeConfirm}
        onConfirm={confirmState.onConfirm}
        title={confirmState.title}
        message={confirmState.message}
        confirmText={confirmState.confirmText}
        cancelText={confirmState.cancelText}
        variant={confirmState.variant}
      />

    </PageShell>
  )
}
