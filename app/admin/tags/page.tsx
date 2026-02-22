'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { AdminStatCard } from '@/components/admin/AdminStatCard'
import { logAdminAction } from '@/lib/audit'
import {
  Tag,
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
  Filter,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Category {
  id: string
  name: string
  slug: string
}

interface CategoryTag {
  id: string
  category_id: string
  name: string
  slug: string
  display_order: number | null
  created_at: string | null
  business_count?: number
}

export default function AdminTagsPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<CategoryTag[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  // Form state - tags only need name and slug
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
  })

  const supabase = createClient()

  // Load categories once on mount
  useEffect(() => {
    async function loadCategories() {
      setLoadingCategories(true)
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, slug')
        .order('name', { ascending: true })

      if (error) {
        console.error('Error loading categories:', error)
      } else {
        setCategories(data || [])
        // Auto-select first category if available
        if (data && data.length > 0 && !selectedCategoryId) {
          setSelectedCategoryId(data[0].id)
        }
      }
      setLoadingCategories(false)
    }

    loadCategories()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadTags = useCallback(async () => {
    setLoading(true)

    // Build tags query, filtered by category when one is selected
    let query = supabase
      .from('category_tags')
      .select('*')
      .order('display_order', { ascending: true })

    if (selectedCategoryId) {
      query = query.eq('category_id', selectedCategoryId)
    }

    const { data: tagsData, error } = await query

    if (error) {
      console.error('Error loading tags:', error)
      setLoading(false)
      return
    }

    // Get business counts per tag from junction table
    const { data: businessTagCounts } = await supabase
      .from('business_tags')
      .select('tag_id')

    const countMap = businessTagCounts?.reduce((acc, bt) => {
      if (bt.tag_id) {
        acc[bt.tag_id] = (acc[bt.tag_id] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>) || {}

    const tagsWithCounts = (tagsData || []).map((t, index) => ({
      ...t,
      display_order: t.display_order ?? index,
      business_count: countMap[t.id] || 0,
    }))

    setTags(tagsWithCounts)
    setLoading(false)
  }, [supabase, selectedCategoryId])

  useEffect(() => {
    loadTags()
  }, [loadTags])

  function generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }

  async function handleCreate() {
    if (!formData.name.trim()) return
    if (!selectedCategoryId) {
      alert('Please select a category before creating a tag.')
      return
    }

    setSaving(true)
    const slug = formData.slug || generateSlug(formData.name)
    const maxOrder = Math.max(...tags.map(t => t.display_order ?? 0), -1)

    const { data, error } = await supabase
      .from('category_tags')
      .insert({
        category_id: selectedCategoryId,
        name: formData.name.trim(),
        slug,
        display_order: maxOrder + 1,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating tag:', error)
      alert('Failed to create tag: ' + error.message)
    } else if (data) {
      await logAdminAction({
        action: 'create',
        entity_type: 'tag',
        entity_id: data.id,
        entity_name: data.name,
        after_data: data,
      })
      setShowCreateForm(false)
      setFormData({ name: '', slug: '' })
      loadTags()
    }

    setSaving(false)
  }

  async function handleUpdate(tag: CategoryTag) {
    if (!formData.name.trim()) return

    setSaving(true)
    const slug = formData.slug || generateSlug(formData.name)

    const { error } = await supabase
      .from('category_tags')
      .update({
        name: formData.name.trim(),
        slug,
      })
      .eq('id', tag.id)

    if (error) {
      console.error('Error updating tag:', error)
      alert('Failed to update tag: ' + error.message)
    } else {
      await logAdminAction({
        action: 'update',
        entity_type: 'tag',
        entity_id: tag.id,
        entity_name: formData.name.trim(),
        before_data: { name: tag.name, slug: tag.slug },
        after_data: { name: formData.name.trim(), slug },
      })
      setEditingId(null)
      loadTags()
    }

    setSaving(false)
  }

  async function handleDelete(tag: CategoryTag) {
    if (tag.business_count && tag.business_count > 0) {
      alert(`Cannot delete tag with ${tag.business_count} linked business${tag.business_count === 1 ? '' : 'es'}. Remove the tag from businesses first.`)
      return
    }

    setSaving(true)

    const { error } = await supabase
      .from('category_tags')
      .delete()
      .eq('id', tag.id)

    if (error) {
      console.error('Error deleting tag:', error)
      alert('Failed to delete tag: ' + error.message)
    } else {
      await logAdminAction({
        action: 'delete',
        entity_type: 'tag',
        entity_id: tag.id,
        entity_name: tag.name,
        before_data: { id: tag.id, name: tag.name, slug: tag.slug, category_id: tag.category_id },
      })
      setDeleteConfirm(null)
      loadTags()
    }

    setSaving(false)
  }

  async function handleMove(tag: CategoryTag, direction: 'up' | 'down') {
    const currentIndex = filteredTags.findIndex(t => t.id === tag.id)
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1

    if (targetIndex < 0 || targetIndex >= filteredTags.length) return

    const targetTag = filteredTags[targetIndex]

    // Swap display_order values between the two tags
    const updates = [
      supabase
        .from('category_tags')
        .update({ display_order: targetTag.display_order ?? targetIndex })
        .eq('id', tag.id),
      supabase
        .from('category_tags')
        .update({ display_order: tag.display_order ?? currentIndex })
        .eq('id', targetTag.id),
    ]

    const results = await Promise.all(updates)
    const hasError = results.some(r => r.error)

    if (hasError) {
      console.error('Error reordering:', results)
      alert('Failed to reorder tags')
    } else {
      loadTags()
    }
  }

  function startEdit(tag: CategoryTag) {
    setEditingId(tag.id)
    setFormData({
      name: tag.name,
      slug: tag.slug,
    })
  }

  const filteredTags = tags.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.slug.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Derived stats
  const selectedCategory = categories.find(c => c.id === selectedCategoryId)
  const tagsInCategory = selectedCategoryId
    ? tags.length
    : tags.length
  const tagsWithBusinesses = tags.filter(t => (t.business_count || 0) > 0).length
  const emptyTags = tags.filter(t => (t.business_count || 0) === 0).length

  // All-category counts for "Total Tags" stat when no category filter
  const totalTagCount = tags.length

  return (
    <div className="min-h-screen">
      <AdminHeader
        title="Tags"
        subtitle={`Manage ${totalTagCount} tag${totalTagCount === 1 ? '' : 's'}${selectedCategory ? ` in ${selectedCategory.name}` : ''}`}
      />

      <div className="px-4 lg:px-8 py-6 space-y-6">

        {/* Category Selector */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-2 text-slate-600 shrink-0">
              <Filter size={18} />
              <span className="text-sm font-medium">Category</span>
            </div>
            {loadingCategories ? (
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <Loader2 size={16} className="animate-spin" />
                Loading categories...
              </div>
            ) : (
              <select
                value={selectedCategoryId}
                onChange={(e) => {
                  setSelectedCategoryId(e.target.value)
                  setEditingId(null)
                  setShowCreateForm(false)
                  setDeleteConfirm(null)
                  setSearchQuery('')
                }}
                className="w-full sm:w-auto px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-purple-300 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all min-w-[220px]"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            )}
            {selectedCategory && (
              <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-lg font-mono">
                {selectedCategory.slug}
              </span>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <AdminStatCard
            label="Total Tags"
            value={totalTagCount}
            icon="Tag"
            color="purple"
            size="sm"
          />
          <AdminStatCard
            label={selectedCategory ? `In ${selectedCategory.name}` : 'Showing'}
            value={tagsInCategory}
            icon="CheckCircle"
            color="blue"
            size="sm"
          />
          <AdminStatCard
            label="Tags with Businesses"
            value={tagsWithBusinesses}
            icon="Building2"
            color="emerald"
            size="sm"
          />
          <AdminStatCard
            label="Empty Tags"
            value={emptyTags}
            icon="AlertTriangle"
            color="yellow"
            size="sm"
          />
        </div>

        {/* Actions Bar + Tags List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-purple-300 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all"
              />
            </div>
            {/* Add Tag Button */}
            <button
              onClick={() => {
                setShowCreateForm(true)
                setFormData({ name: '', slug: '' })
                setEditingId(null)
              }}
              disabled={!selectedCategoryId}
              title={!selectedCategoryId ? 'Select a category first' : 'Add a new tag'}
              className={cn(
                'px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm flex items-center gap-2',
                selectedCategoryId
                  ? 'bg-purple-600 hover:bg-purple-700 text-white'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              )}
            >
              <Plus size={18} />
              Add Tag
            </button>
          </div>

          {/* Create Form */}
          {showCreateForm && selectedCategoryId && (
            <div className="p-4 bg-purple-50 border-b border-purple-100">
              <h3 className="font-medium text-purple-900 mb-3">
                Create New Tag
                {selectedCategory && (
                  <span className="font-normal text-purple-600 ml-1">
                    in {selectedCategory.name}
                  </span>
                )}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Tag Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value, slug: generateSlug(e.target.value) })}
                  className="px-3 py-2 border border-purple-200 rounded-lg text-sm focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 focus:outline-none"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreate()
                    if (e.key === 'Escape') setShowCreateForm(false)
                  }}
                />
                <input
                  type="text"
                  placeholder="slug-name"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="px-3 py-2 border border-purple-200 rounded-lg text-sm focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 focus:outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreate()
                    if (e.key === 'Escape') setShowCreateForm(false)
                  }}
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
                  Create Tag
                </button>
              </div>
            </div>
          )}

          {/* Tags List */}
          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 text-purple-500 animate-spin mx-auto mb-3" />
              <p className="text-slate-500">Loading tags...</p>
            </div>
          ) : !selectedCategoryId && filteredTags.length === 0 ? (
            <div className="p-12 text-center">
              <Filter className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-slate-900 mb-1">Select a category</h3>
              <p className="text-slate-500">Choose a category from the dropdown above to view and manage its tags.</p>
            </div>
          ) : filteredTags.length === 0 ? (
            <div className="p-12 text-center">
              <Tag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-slate-900 mb-1">No tags found</h3>
              <p className="text-slate-500">
                {searchQuery
                  ? 'Try adjusting your search'
                  : selectedCategoryId
                    ? 'Create your first tag for this category'
                    : 'Select a category to view tags'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredTags.map((tag, index) => (
                <div
                  key={tag.id}
                  className={cn(
                    'p-4 hover:bg-slate-50/50 transition-colors',
                    editingId === tag.id && 'bg-blue-50'
                  )}
                >
                  {editingId === tag.id ? (
                    // Edit Mode
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="Tag Name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="px-3 py-2 border border-blue-200 rounded-lg text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleUpdate(tag)
                            if (e.key === 'Escape') setEditingId(null)
                          }}
                        />
                        <input
                          type="text"
                          placeholder="slug-name"
                          value={formData.slug}
                          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                          className="px-3 py-2 border border-blue-200 rounded-lg text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleUpdate(tag)
                            if (e.key === 'Escape') setEditingId(null)
                          }}
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
                          onClick={() => handleUpdate(tag)}
                          disabled={saving || !formData.name.trim()}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-1"
                        >
                          {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                          Save
                        </button>
                      </div>
                    </div>
                  ) : deleteConfirm === tag.id ? (
                    // Delete Confirmation
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="text-red-500 shrink-0" size={24} />
                        <div>
                          <p className="font-medium text-red-900">Delete &quot;{tag.name}&quot;?</p>
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
                          onClick={() => handleDelete(tag)}
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
                      {/* Reorder Buttons + Grip Handle */}
                      <div className="flex flex-col items-center gap-1">
                        <button
                          onClick={() => handleMove(tag, 'up')}
                          disabled={index === 0}
                          className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          title="Move up"
                        >
                          <ChevronUp size={16} />
                        </button>
                        <GripVertical className="text-slate-300" size={16} />
                        <button
                          onClick={() => handleMove(tag, 'down')}
                          disabled={index === filteredTags.length - 1}
                          className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          title="Move down"
                        >
                          <ChevronDown size={16} />
                        </button>
                      </div>

                      {/* Tag Icon */}
                      <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                        <Tag size={20} />
                      </div>

                      {/* Tag Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-slate-900">{tag.name}</h3>
                          <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full font-mono">
                            {tag.slug}
                          </span>
                        </div>
                        {/* Show parent category name when viewing all categories */}
                        {!selectedCategoryId && (
                          <span className="text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                            {categories.find(c => c.id === tag.category_id)?.name || 'Unknown category'}
                          </span>
                        )}
                      </div>

                      {/* Business Count */}
                      <div className="text-center px-4 shrink-0">
                        <p className="text-2xl font-bold text-slate-900">{tag.business_count || 0}</p>
                        <p className="text-xs text-slate-500">businesses</p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => startEdit(tag)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit tag"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(tag.id)}
                          disabled={(tag.business_count || 0) > 0}
                          className={cn(
                            'p-2 rounded-lg transition-colors',
                            (tag.business_count || 0) > 0
                              ? 'text-slate-300 cursor-not-allowed'
                              : 'text-slate-400 hover:text-red-600 hover:bg-red-50'
                          )}
                          title={
                            (tag.business_count || 0) > 0
                              ? `Cannot delete tag used by ${tag.business_count} business${tag.business_count === 1 ? '' : 'es'}`
                              : 'Delete tag'
                          }
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
