'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Category } from '@/lib/api'
import { offlineCategoryApi } from '@/lib/offlineApi'
import { getToken } from '@/lib/auth'
import { useConfirm } from '@/hooks/useConfirm'
import BottomNav from '@/components/BottomNav'
import Header from '@/components/Header'
import Button from '@/components/Button'
import Input from '@/components/Input'
import Select from '@/components/Select'
import LoadingSpinner from '@/components/LoadingSpinner'
import EmptyState from '@/components/EmptyState'
import ConfirmModal from '@/components/ConfirmModal'
import { Tag, Plus, Pencil, Trash2 } from 'lucide-react'

export default function CategoriesPage() {
  const { confirm, confirmState, closeConfirm } = useConfirm()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    type: 'expense' as 'income' | 'expense'
  })

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      setLoading(true)
      const data = await offlineCategoryApi.getAll()
      setCategories(data)
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors du chargement des catégories')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast.error('Veuillez entrer un nom')
      return
    }

    try {
      const token = getToken()
      if (!token) {
        throw new Error('Non authentifié')
      }

      if (editingId) {
        // Modifier une catégorie existante
        const response = await fetch(`/api/categories/${editingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        })

        const result = await response.json()

        if (!result.success) {
          throw new Error(result.message)
        }

        toast.success('Catégorie modifiée avec succès !')
        await loadCategories()
        resetForm()
      } else {
        // Créer une nouvelle catégorie
        const response = await fetch('/api/categories', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        })

        const result = await response.json()

        if (!result.success) {
          throw new Error(result.message)
        }

        toast.success('Catégorie créée avec succès !')
        await loadCategories()
        resetForm()
      }
    } catch (error: any) {
      toast.error(error.message || 'Une erreur est survenue')
    }
  }

  const handleEdit = (category: Category) => {
    setEditingId(category._id)
    setFormData({
      name: category.name,
      type: category.type
    })
    setShowForm(true)
  }

  const handleDelete = async (category: Category) => {
    const confirmed = await confirm({
      title: 'Supprimer la catégorie ?',
      message: `Êtes-vous sûr de vouloir supprimer "${category.name}" ? Cette action est irréversible.`,
      confirmText: 'Oui, supprimer',
      cancelText: 'Annuler',
      variant: 'danger'
    })

    if (!confirmed) return

    try {
      const token = getToken()
      if (!token) {
        throw new Error('Non authentifié')
      }

      const response = await fetch(`/api/categories/${category._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.message)
      }

      toast.success('Catégorie supprimée avec succès !')
      await loadCategories()
    } catch (error: any) {
      toast.error(error.message || 'Une erreur est survenue')
    }
  }

  const resetForm = () => {
    setFormData({ name: '', type: 'expense' })
    setEditingId(null)
    setShowForm(false)
  }

  const incomeCategories = categories.filter(c => c.type === 'income')
  const expenseCategories = categories.filter(c => c.type === 'expense')

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Catégories" />
        <LoadingSpinner />
        <BottomNav />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header 
        title="Catégories" 
        action={
          <button 
            onClick={() => setShowForm(!showForm)}
            className="p-2 touch-manipulation"
          >
            <Plus size={24} className="text-primary-500" />
          </button>
        }
      />

      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Formulaire d'ajout/modification */}
        {showForm && (
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">
              {editingId ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Nom de la catégorie"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Alimentation, Salaire..."
                required
              />

              <Select
                label="Type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'income' | 'expense' })}
                options={[
                  { value: 'expense', label: 'Dépense' },
                  { value: 'income', label: 'Revenu' }
                ]}
                required
              />

              <div className="flex gap-2">
                <Button type="submit" fullWidth>
                  {editingId ? 'Modifier' : 'Créer'}
                </Button>
                <Button type="button" variant="outline" fullWidth onClick={resetForm}>
                  Annuler
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Liste des catégories */}
        {categories.length === 0 ? (
          <EmptyState
            icon={<Tag size={48} />}
            title="Aucune catégorie"
            description="Créez vos premières catégories pour organiser vos transactions"
            action={
              <Button 
              className='flex items-center justify-center'
              onClick={() => setShowForm(true)}>
                <Plus size={20} className="mr-2" />
                Créer une catégorie
              </Button>
            }
          />
        ) : (
          <>
            {/* Catégories de revenus */}
            {incomeCategories.length > 0 && (
              <section>
                <h3 className="text-sm font-semibold text-gray-500 mb-3 px-1">
                  Revenus ({incomeCategories.length})
                </h3>
                <div className="space-y-2">
                  {incomeCategories.map((category) => (
                    <div
                      key={category._id}
                      className="bg-white rounded-lg p-4 border border-gray-200 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                          <Tag size={20} className="text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{category.name}</p>
                          <p className="text-sm text-emerald-600">Revenu</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(category)}
                          className="p-2 text-gray-400 hover:text-primary-500 touch-manipulation"
                        >
                          <Pencil size={18} />
                        </button>
                         <button
                           onClick={() => handleDelete(category)}
                           className="p-2 text-gray-400 hover:text-red-500 touch-manipulation"
                         >
                           <Trash2 size={18} />
                         </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Catégories de dépenses */}
            {expenseCategories.length > 0 && (
              <section>
                <h3 className="text-sm font-semibold text-gray-500 mb-3 px-1">
                  Dépenses ({expenseCategories.length})
                </h3>
                <div className="space-y-2">
                  {expenseCategories.map((category) => (
                    <div
                      key={category._id}
                      className="bg-white rounded-lg p-4 border border-gray-200 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                          <Tag size={20} className="text-red-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{category.name}</p>
                          <p className="text-sm text-red-600">Dépense</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(category)}
                          className="p-2 text-gray-400 hover:text-primary-500 touch-manipulation"
                        >
                          <Pencil size={18} />
                        </button>
                         <button
                           onClick={() => handleDelete(category)}
                           className="p-2 text-gray-400 hover:text-red-500 touch-manipulation"
                         >
                           <Trash2 size={18} />
                         </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
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

      <BottomNav />
    </div>
  )
}
