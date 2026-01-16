'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { AdminStatCard } from '@/components/admin/AdminStatCard'
import { logAdminAction } from '@/lib/audit'
import {
  MapPin,
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
  Landmark,
  Home,
  Trees,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Region types
const regionTypes = ['city', 'town', 'village', 'region'] as const
type RegionType = typeof regionTypes[number]

const typeConfig: Record<RegionType, { label: string; icon: typeof MapPin; color: string }> = {
  city: { label: 'City', icon: Landmark, color: 'bg-purple-100 text-purple-600' },
  town: { label: 'Town', icon: Building2, color: 'bg-blue-100 text-blue-600' },
  village: { label: 'Village', icon: Home, color: 'bg-emerald-100 text-emerald-600' },
  region: { label: 'Region', icon: Trees, color: 'bg-orange-100 text-orange-600' },
}

interface Region {
  id: string
  name: string
  slug: string
  type: string
  display_order?: number  // Optional until migration is applied
  created_at: string | null
  business_count?: number
}

export default function AdminRegionsPage() {
  const [regions, setRegions] = useState<Region[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<RegionType | ''>('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    type: 'town' as RegionType,
  })

  const supabase = createClient()

  const loadRegions = useCallback(async () => {
    setLoading(true)

    // Get regions - order by name as fallback until migration is applied
    const { data: regionsData, error } = await supabase
      .from('regions')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      console.error('Error loading regions:', error)
      setLoading(false)
      return
    }

    // Get business counts per region
    const { data: businessCounts } = await supabase
      .from('businesses')
      .select('region_id')

    const countMap = businessCounts?.reduce((acc, b) => {
      if (b.region_id) {
        acc[b.region_id] = (acc[b.region_id] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>) || {}

    const regionsWithCounts = (regionsData || []).map((r, index) => ({
      ...r,
      display_order: (r as Region).display_order ?? index,
      business_count: countMap[r.id] || 0,
    }))

    // Sort by display_order
    regionsWithCounts.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))

    setRegions(regionsWithCounts)
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    loadRegions()
  }, [loadRegions])

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
    const maxOrder = Math.max(...regions.map(r => r.display_order ?? 0), -1)

    const { data, error } = await supabase
      .from('regions')
      .insert({
        name: formData.name.trim(),
        slug,
        type: formData.type,
        display_order: maxOrder + 1,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating region:', error)
      alert('Failed to create region: ' + error.message)
    } else if (data) {
      await logAdminAction({
        action: 'create',
        entity_type: 'region',
        entity_id: data.id,
        entity_name: data.name,
        after_data: data,
      })
      setShowCreateForm(false)
      setFormData({ name: '', slug: '', type: 'town' })
      loadRegions()
    }

    setSaving(false)
  }

  async function handleUpdate(region: Region) {
    if (!formData.name.trim()) return

    setSaving(true)
    const slug = formData.slug || generateSlug(formData.name)

    const { error } = await supabase
      .from('regions')
      .update({
        name: formData.name.trim(),
        slug,
        type: formData.type,
      })
      .eq('id', region.id)

    if (error) {
      console.error('Error updating region:', error)
      alert('Failed to update region: ' + error.message)
    } else {
      await logAdminAction({
        action: 'update',
        entity_type: 'region',
        entity_id: region.id,
        entity_name: formData.name.trim(),
        before_data: { name: region.name, slug: region.slug, type: region.type },
        after_data: { name: formData.name.trim(), slug, type: formData.type },
      })
      setEditingId(null)
      loadRegions()
    }

    setSaving(false)
  }

  async function handleDelete(region: Region) {
    if (region.business_count && region.business_count > 0) {
      alert(`Cannot delete region with ${region.business_count} linked businesses. Reassign them first.`)
      return
    }

    setSaving(true)

    const { error } = await supabase
      .from('regions')
      .delete()
      .eq('id', region.id)

    if (error) {
      console.error('Error deleting region:', error)
      alert('Failed to delete region: ' + error.message)
    } else {
      await logAdminAction({
        action: 'delete',
        entity_type: 'region',
        entity_id: region.id,
        entity_name: region.name,
        before_data: { id: region.id, name: region.name, slug: region.slug, type: region.type },
      })
      setDeleteConfirm(null)
      loadRegions()
    }

    setSaving(false)
  }

  async function handleMove(region: Region, direction: 'up' | 'down') {
    const filteredList = typeFilter
      ? regions.filter(r => r.type === typeFilter)
      : regions

    const currentIndex = filteredList.findIndex(r => r.id === region.id)
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1

    if (targetIndex < 0 || targetIndex >= filteredList.length) return

    const targetRegion = filteredList[targetIndex]

    // Swap display_order values
    const updates = [
      supabase
        .from('regions')
        .update({ display_order: targetRegion.display_order ?? targetIndex })
        .eq('id', region.id),
      supabase
        .from('regions')
        .update({ display_order: region.display_order ?? currentIndex })
        .eq('id', targetRegion.id),
    ]

    const results = await Promise.all(updates)
    const hasError = results.some(r => r.error)

    if (hasError) {
      console.error('Error reordering:', results)
      alert('Failed to reorder regions')
    } else {
      loadRegions()
    }
  }

  function startEdit(region: Region) {
    setEditingId(region.id)
    setFormData({
      name: region.name,
      slug: region.slug,
      type: (region.type as RegionType) || 'town',
    })
  }

  const filteredRegions = regions.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.slug.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = !typeFilter || r.type === typeFilter
    return matchesSearch && matchesType
  })

  // Stats by type
  const statsByType = regions.reduce((acc, r) => {
    acc[r.type] = (acc[r.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="min-h-screen">
      <AdminHeader
        title="Regions"
        subtitle={`Manage ${regions.length} geographic regions`}
      />

      <div className="px-4 lg:px-8 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <AdminStatCard
            label="Total Regions"
            value={regions.length}
            icon="Building2"
            color="purple"
            size="sm"
          />
          <AdminStatCard
            label="Cities"
            value={statsByType['city'] || 0}
            icon="Building2"
            color="purple"
            size="sm"
          />
          <AdminStatCard
            label="Towns"
            value={statsByType['town'] || 0}
            icon="Building2"
            color="blue"
            size="sm"
          />
          <AdminStatCard
            label="Villages"
            value={statsByType['village'] || 0}
            icon="Building2"
            color="emerald"
            size="sm"
          />
          <AdminStatCard
            label="Regions"
            value={statsByType['region'] || 0}
            icon="Building2"
            color="orange"
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
                placeholder="Search regions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-purple-300 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as RegionType | '')}
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-purple-300 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all min-w-[140px]"
            >
              <option value="">All Types</option>
              {regionTypes.map(type => (
                <option key={type} value={type}>{typeConfig[type].label}</option>
              ))}
            </select>
            <button
              onClick={() => {
                setShowCreateForm(true)
                setFormData({ name: '', slug: '', type: 'town' })
              }}
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm flex items-center gap-2"
            >
              <Plus size={18} />
              Add Region
            </button>
          </div>

          {/* Create Form */}
          {showCreateForm && (
            <div className="p-4 bg-purple-50 border-b border-purple-100">
              <h3 className="font-medium text-purple-900 mb-3">Create New Region</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Region Name"
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
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as RegionType })}
                  className="px-3 py-2 border border-purple-200 rounded-lg text-sm focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 focus:outline-none"
                >
                  {regionTypes.map(type => (
                    <option key={type} value={type}>{typeConfig[type].label}</option>
                  ))}
                </select>
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
                  Create Region
                </button>
              </div>
            </div>
          )}

          {/* Regions List */}
          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 text-purple-500 animate-spin mx-auto mb-3" />
              <p className="text-slate-500">Loading regions...</p>
            </div>
          ) : filteredRegions.length === 0 ? (
            <div className="p-12 text-center">
              <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-slate-900 mb-1">No regions found</h3>
              <p className="text-slate-500">
                {searchQuery || typeFilter ? 'Try adjusting your filters' : 'Create your first region to get started'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredRegions.map((region, index) => {
                const regionType = (region.type as RegionType) || 'town'
                const TypeIcon = typeConfig[regionType].icon

                return (
                  <div
                    key={region.id}
                    className={cn(
                      'p-4 hover:bg-slate-50/50 transition-colors',
                      editingId === region.id && 'bg-blue-50'
                    )}
                  >
                    {editingId === region.id ? (
                      // Edit Mode
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <input
                            type="text"
                            placeholder="Region Name"
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
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value as RegionType })}
                            className="px-3 py-2 border border-blue-200 rounded-lg text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                          >
                            {regionTypes.map(type => (
                              <option key={type} value={type}>{typeConfig[type].label}</option>
                            ))}
                          </select>
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
                            onClick={() => handleUpdate(region)}
                            disabled={saving || !formData.name.trim()}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-1"
                          >
                            {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                            Save
                          </button>
                        </div>
                      </div>
                    ) : deleteConfirm === region.id ? (
                      // Delete Confirmation
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className="text-red-500" size={24} />
                          <div>
                            <p className="font-medium text-red-900">Delete &quot;{region.name}&quot;?</p>
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
                            onClick={() => handleDelete(region)}
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
                        {/* Order Buttons */}
                        <div className="flex flex-col items-center gap-1">
                          <button
                            onClick={() => handleMove(region, 'up')}
                            disabled={index === 0}
                            className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          >
                            <ChevronUp size={16} />
                          </button>
                          <GripVertical className="text-slate-300" size={16} />
                          <button
                            onClick={() => handleMove(region, 'down')}
                            disabled={index === filteredRegions.length - 1}
                            className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          >
                            <ChevronDown size={16} />
                          </button>
                        </div>

                        {/* Icon */}
                        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', typeConfig[regionType].color)}>
                          <TypeIcon size={20} />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-slate-900">{region.name}</h3>
                            <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                              {region.slug}
                            </span>
                          </div>
                          <span className={cn(
                            'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
                            typeConfig[regionType].color
                          )}>
                            {typeConfig[regionType].label}
                          </span>
                        </div>

                        {/* Business Count */}
                        <div className="text-center px-4">
                          <p className="text-2xl font-bold text-slate-900">{region.business_count || 0}</p>
                          <p className="text-xs text-slate-500">businesses</p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => startEdit(region)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Pencil size={18} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(region.id)}
                            disabled={(region.business_count || 0) > 0}
                            className={cn(
                              'p-2 rounded-lg transition-colors',
                              (region.business_count || 0) > 0
                                ? 'text-slate-300 cursor-not-allowed'
                                : 'text-slate-400 hover:text-red-600 hover:bg-red-50'
                            )}
                            title={(region.business_count || 0) > 0 ? 'Cannot delete region with businesses' : 'Delete'}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
