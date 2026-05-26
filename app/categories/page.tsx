'use client'

import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { Category, categoryApi } from '@/lib/api'
import { CACHE_KEYS, invalidateFinancialCaches, setCache } from '@/lib/cache'
import { useCachedData } from '@/hooks/useCachedData'
import ImageUpload from '@/components/ImageUpload'
import EntityAvatar from '@/components/EntityAvatar'
import { useConfirm } from '@/hooks/useConfirm'
import PageShell from '@/components/PageShell'
import Header from '@/components/Header'
import Button from '@/components/Button'
import Input from '@/components/Input'
import Select from '@/components/Select'
import LoadingSpinner from '@/components/LoadingSpinner'
import EmptyState from '@/components/EmptyState'
import ConfirmModal from '@/components/ConfirmModal'
import { Tag, Plus, Pencil, Trash2 } from 'lucide-react'
import { useSubscription } from '@/hooks/useSubscription'
import { isPremiumRequiredError } from '@/lib/subscription'
import UpgradeBanner from '@/components/UpgradeBanner'
import { PLAN_LIMITS } from '@/lib/planLimits'

export default function CategoriesPage() {
  const { confirm, confirmState, closeConfirm } = useConfirm()
  const { isPremium, requirePremium } = useSubscription()
  const fetchCategories = useCallback(() => categoryApi.getAll(), [])
  const { data: categories, loading, setData } = useCachedData(
    CACHE_KEYS.categories,
    fetchCategories
  )
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    type: 'expense' as 'income' | 'expense',
    image_url: null as string | null,
  })

  const refreshCategories = async () => {
    const data = await categoryApi.getAll()
    setCache(CACHE_KEYS.categories, data)
    setData(data)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast.error('Veuillez entrer un nom')
      return
    }

    try {
      if (editingId) {
        await categoryApi.update(editingId, formData)
        toast.success('Catégorie modifiée avec succès !')
      } else {
        await categoryApi.create(formData)
        toast.success('Catégorie créée avec succès !')
      }
      invalidateFinancialCaches()
      await refreshCategories()
      resetForm()
    } catch (error: unknown) {
      if (isPremiumRequiredError(error)) {
        requirePremium(error.message)
        return
      }
      const message = error instanceof Error ? error.message : 'Une erreur est survenue'
      toast.error(message)
    }
  }

  const handleEdit = (category: Category) => {
    setEditingId(category._id)
    setFormData({
      name: category.name,
      type: category.type,
      image_url: category.image_url ?? null,
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
      await categoryApi.delete(category._id)
      toast.success('Catégorie supprimée avec succès !')
      invalidateFinancialCaches()
      await refreshCategories()
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Une erreur est survenue'
      toast.error(message)
    }
  }

  const resetForm = () => {
    setFormData({ name: '', type: 'expense', image_url: null })
    setEditingId(null)
    setShowForm(false)
  }

  const list = categories ?? []
  const incomeCategories = list.filter((c) => c.type === 'income')
  const expenseCategories = list.filter((c) => c.type === 'expense')

  if (loading && !categories) {
    return (
      <PageShell>
        <Header title="Catégories" />
        <LoadingSpinner />
      </PageShell>
    )
  }

  return (
    <PageShell>
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
        {!isPremium && (
          <UpgradeBanner
            compact
            message={`Gratuit : max ${PLAN_LIMITS.FREE_MAX_CATEGORIES_PER_TYPE} catégories par type`}
          />
        )}
        {/* Formulaire d'ajout/modification */}
        {showForm && (
          <div className="card p-4">
            <h3 className="text-lg font-semibold mb-4">
              {editingId ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <ImageUpload
                value={formData.image_url}
                onChange={(url) => setFormData({ ...formData, image_url: url })}
                endpoint="categoryImage"
                label="Icône de la catégorie"
                premiumRequired={!isPremium}
              />

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
        {list.length === 0 ? (
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
                      className="card p-4 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <EntityAvatar
                          imageUrl={category.image_url}
                          name={category.name}
                          type="category"
                          size="sm"
                        />
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
                      className="card p-4 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <EntityAvatar
                          imageUrl={category.image_url}
                          name={category.name}
                          type="category"
                          size="sm"
                        />
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

    </PageShell>
  )
}
