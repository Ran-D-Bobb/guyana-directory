'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { AdminStatCard } from '@/components/admin/AdminStatCard'
import { logAdminAction } from '@/lib/audit'
import {
  FolderOpen,
  Plus,
  Pencil,
  Trash2,
  GripVertical,
  Search,
  Check,
  X,
  AlertTriangle,
  Loader2,
  ChevronUp,
  ChevronDown,
  Building2,
  UtensilsCrossed,
  ShoppingCart,
  Scissors,
  Stethoscope,
  Car,
  Home,
  Hammer,
  Laptop,
  Shirt,
  GraduationCap,
  Briefcase,
  PartyPopper,
  Dumbbell,
  PawPrint,
  Banknote,
  Hotel,
  Truck,
  Camera,
  MoreHorizontal,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Icon map for categories
const iconMap: Record<string, LucideIcon> = {
  UtensilsCrossed,
  ShoppingCart,
  Scissors,
  Stethoscope,
  Car,
  Home,
  Hammer,
  Laptop,
  Shirt,
  GraduationCap,
  Briefcase,
  PartyPopper,
  Dumbbell,
  PawPrint,
  Building2,
  Banknote,
  Hotel,
  Truck,
  Camera,
  MoreHorizontal,
  FolderOpen,
}

const iconOptions = Object.keys(iconMap)

interface Category {
  id: string
  name: string
  slug: string
  icon: string
  description: string | null
  display_order?: number  // Optional until migration is applied
  created_at: string | null
  business_count?: number
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    icon: 'FolderOpen',
    description: '',
  })

  const supabase = createClient()

  const loadCategories = useCallback(async () => {
    setLoading(true)

    // Get categories with business counts
    // Try ordering by display_order first, fall back to name if column doesn't exist
    const { data: categoriesData, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      console.error('Error loading categories:', error)
      setLoading(false)
      return
    }

    // Get business counts per category
    const { data: businessCounts } = await supabase
      .from('businesses')
      .select('category_id')

    const countMap = businessCounts?.reduce((acc, b) => {
      if (b.category_id) {
        acc[b.category_id] = (acc[b.category_id] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>) || {}

    // Add business counts and ensure display_order has a default
    const categoriesWithCounts = (categoriesData || []).map((c, index) => ({
      ...c,
      display_order: (c as Category).display_order ?? index,
      business_count: countMap[c.id] || 0,
    }))

    // Sort by display_order
    categoriesWithCounts.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))

    setCategories(categoriesWithCounts)
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    loadCategories()
  }, [loadCategories])

  function generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }

  async function handleCreate() {
    if (!formData.name.trim()) return

    setSaving(true)
    const slug = formData.slug || generateSlug(formData.name)
    const maxOrder = Math.max(...categories.map(c => c.display_order ?? 0), -1)

    const { data, error } = await supabase
      .from('categories')
      .insert({
        name: formData.name.trim(),
        slug,
        icon: formData.icon,
        description: formData.description.trim() || null,
        display_order: maxOrder + 1,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating category:', error)
      alert('Failed to create category: ' + error.message)
    } else if (data) {
      await logAdminAction({
        action: 'create',
        entity_type: 'category',
        entity_id: data.id,
        entity_name: data.name,
        after_data: data,
      })
      setShowCreateForm(false)
      setFormData({ name: '', slug: '', icon: 'FolderOpen', description: '' })
      loadCategories()
    }

    setSaving(false)
  }

  async function handleUpdate(category: Category) {
    if (!formData.name.trim()) return

    setSaving(true)
    const slug = formData.slug || generateSlug(formData.name)

    const { error } = await supabase
      .from('categories')
      .update({
        name: formData.name.trim(),
        slug,
        icon: formData.icon,
        description: formData.description.trim() || null,
      })
      .eq('id', category.id)

    if (error) {
      console.error('Error updating category:', error)
      alert('Failed to update category: ' + error.message)
    } else {
      await logAdminAction({
        action: 'update',
        entity_type: 'category',
        entity_id: category.id,
        entity_name: formData.name.trim(),
        before_data: { name: category.name, slug: category.slug, icon: category.icon, description: category.description },
        after_data: { name: formData.name.trim(), slug, icon: formData.icon, description: formData.description.trim() || null },
      })
      setEditingId(null)
      loadCategories()
    }

    setSaving(false)
  }

  async function handleDelete(category: Category) {
    if (category.business_count && category.business_count > 0) {
      alert(`Cannot delete category with ${category.business_count} linked businesses. Reassign them first.`)
      return
    }

    setSaving(true)

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', category.id)

    if (error) {
      console.error('Error deleting category:', error)
      alert('Failed to delete category: ' + error.message)
    } else {
      await logAdminAction({
        action: 'delete',
        entity_type: 'category',
        entity_id: category.id,
        entity_name: category.name,
        before_data: { id: category.id, name: category.name, slug: category.slug, icon: category.icon, description: category.description },
      })
      setDeleteConfirm(null)
      loadCategories()
    }

    setSaving(false)
  }

  async function handleMove(category: Category, direction: 'up' | 'down') {
    const currentIndex = categories.findIndex(c => c.id === category.id)
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1

    if (targetIndex < 0 || targetIndex >= categories.length) return

    const targetCategory = categories[targetIndex]

    // Swap display_order values
    const updates = [
      supabase
        .from('categories')
        .update({ display_order: targetCategory.display_order ?? targetIndex })
        .eq('id', category.id),
      supabase
        .from('categories')
        .update({ display_order: category.display_order ?? currentIndex })
        .eq('id', targetCategory.id),
    ]

    const results = await Promise.all(updates)
    const hasError = results.some(r => r.error)

    if (hasError) {
      console.error('Error reordering:', results)
      alert('Failed to reorder categories')
    } else {
      loadCategories()
    }
  }

  function startEdit(category: Category) {
    setEditingId(category.id)
    setFormData({
      name: category.name,
      slug: category.slug,
      icon: category.icon,
      description: category.description || '',
    })
  }

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.slug.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const Icon = ({ name }: { name: string }) => {
    const IconComponent = iconMap[name] || FolderOpen
    return <IconComponent size={20} />
  }

  return (
    <div className="min-h-screen">
      <AdminHeader
        title="Categories"
        subtitle={`Manage ${categories.length} business categories`}
      />

      <div className="px-4 lg:px-8 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <AdminStatCard
            label="Total Categories"
            value={categories.length}
            icon="Building2"
            color="purple"
            size="sm"
          />
          <AdminStatCard
            label="With Businesses"
            value={categories.filter(c => (c.business_count || 0) > 0).length}
            icon="CheckCircle"
            color="emerald"
            size="sm"
          />
          <AdminStatCard
            label="Empty Categories"
            value={categories.filter(c => (c.business_count || 0) === 0).length}
            icon="AlertTriangle"
            color="yellow"
            size="sm"
          />
          <AdminStatCard
            label="Total Businesses"
            value={categories.reduce((sum, c) => sum + (c.business_count || 0), 0)}
            icon="Building2"
            color="blue"
            size="sm"
          />
        </div>

        {/* Actions Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-purple-300 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all"
              />
            </div>
            <button
              onClick={() => {
                setShowCreateForm(true)
                setFormData({ name: '', slug: '', icon: 'FolderOpen', description: '' })
              }}
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm flex items-center gap-2"
            >
              <Plus size={18} />
              Add Category
            </button>
          </div>

          {/* Create Form */}
          {showCreateForm && (
            <div className="p-4 bg-purple-50 border-b border-purple-100">
              <h3 className="font-medium text-purple-900 mb-3">Create New Category</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <input
                  type="text"
                  placeholder="Category Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value, slug: generateSlug(e.target.value) })}
                  className="px-3 py-2 border border-purple-200 rounded-lg text-sm focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="slug-name"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="px-3 py-2 border border-purple-200 rounded-lg text-sm focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 focus:outline-none"
                />
                <select
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="px-3 py-2 border border-purple-200 rounded-lg text-sm focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 focus:outline-none"
                >
                  {iconOptions.map(icon => (
                    <option key={icon} value={icon}>{icon}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Description (optional)"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="px-3 py-2 border border-purple-200 rounded-lg text-sm focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={saving || !formData.name.trim()}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {saving && <Loader2 size={16} className="animate-spin" />}
                  Create Category
                </button>
              </div>
            </div>
          )}

          {/* Categories List */}
          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 text-purple-500 animate-spin mx-auto mb-3" />
              <p className="text-slate-500">Loading categories...</p>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="p-12 text-center">
              <FolderOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-slate-900 mb-1">No categories found</h3>
              <p className="text-slate-500">
                {searchQuery ? 'Try adjusting your search' : 'Create your first category to get started'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredCategories.map((category, index) => (
                <div
                  key={category.id}
                  className={cn(
                    'p-4 hover:bg-slate-50/50 transition-colors',
                    editingId === category.id && 'bg-blue-50'
                  )}
                >
                  {editingId === category.id ? (
                    // Edit Mode
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <input
                          type="text"
                          placeholder="Category Name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="px-3 py-2 border border-blue-200 rounded-lg text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                        />
                        <input
                          type="text"
                          placeholder="slug-name"
                          value={formData.slug}
                          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                          className="px-3 py-2 border border-blue-200 rounded-lg text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                        />
                        <select
                          value={formData.icon}
                          onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                          className="px-3 py-2 border border-blue-200 rounded-lg text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                        >
                          {iconOptions.map(icon => (
                            <option key={icon} value={icon}>{icon}</option>
                          ))}
                        </select>
                        <input
                          type="text"
                          placeholder="Description"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          className="px-3 py-2 border border-blue-200 rounded-lg text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                        >
                          <X size={16} />
                          Cancel
                        </button>
                        <button
                          onClick={() => handleUpdate(category)}
                          disabled={saving || !formData.name.trim()}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-1"
                        >
                          {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                          Save
                        </button>
                      </div>
                    </div>
                  ) : deleteConfirm === category.id ? (
                    // Delete Confirmation
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="text-red-500" size={24} />
                        <div>
                          <p className="font-medium text-red-900">Delete &quot;{category.name}&quot;?</p>
                          <p className="text-sm text-red-600">This action cannot be undone.</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleDelete(category)}
                          disabled={saving}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-1"
                        >
                          {saving ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                          Delete
                        </button>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <div className="flex items-center gap-4">
                      {/* Drag Handle & Order Buttons */}
                      <div className="flex flex-col items-center gap-1">
                        <button
                          onClick={() => handleMove(category, 'up')}
                          disabled={index === 0}
                          className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronUp size={16} />
                        </button>
                        <GripVertical className="text-slate-300" size={16} />
                        <button
                          onClick={() => handleMove(category, 'down')}
                          disabled={index === filteredCategories.length - 1}
                          className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronDown size={16} />
                        </button>
                      </div>

                      {/* Icon */}
                      <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                        <Icon name={category.icon} />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-slate-900">{category.name}</h3>
                          <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                            {category.slug}
                          </span>
                        </div>
                        {category.description && (
                          <p className="text-sm text-slate-500 truncate">{category.description}</p>
                        )}
                      </div>

                      {/* Business Count */}
                      <div className="text-center px-4">
                        <p className="text-2xl font-bold text-slate-900">{category.business_count || 0}</p>
                        <p className="text-xs text-slate-500">businesses</p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => startEdit(category)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(category.id)}
                          disabled={(category.business_count || 0) > 0}
                          className={cn(
                            'p-2 rounded-lg transition-colors',
                            (category.business_count || 0) > 0
                              ? 'text-slate-300 cursor-not-allowed'
                              : 'text-slate-400 hover:text-red-600 hover:bg-red-50'
                          )}
                          title={(category.business_count || 0) > 0 ? 'Cannot delete category with businesses' : 'Delete'}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
