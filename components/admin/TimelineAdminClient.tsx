'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import {
  Calendar,
  Plus,
  GripVertical,
  MapPin,
  Play,
  Image as ImageIcon,
  Video,
  ExternalLink,
  Eye,
  EyeOff,
  Pencil,
  Check,
  Loader2,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Upload,
  X,
  Link as LinkIcon
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { DeleteButton } from './AdminActionButtons'
import { isYouTubeUrl, getYouTubeEmbedUrl, getYouTubeThumbnail } from '@/lib/youtube'

interface TimelineEvent {
  id: string
  title: string
  subtitle: string | null
  description: string | null
  month: string
  month_short: string
  day: string
  location: string | null
  media_type: 'image' | 'video'
  media_url: string
  thumbnail_url: string | null
  gradient_colors: string
  accent_color: string
  category: string
  highlights: string[]
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

interface TimelineAdminClientProps {
  initialEvents: TimelineEvent[]
}

const GRADIENT_OPTIONS = [
  { value: 'from-orange-500 via-pink-500 to-purple-600', label: 'Orange to Purple', accent: 'orange' },
  { value: 'from-pink-500 via-purple-500 to-indigo-500', label: 'Pink to Indigo', accent: 'pink' },
  { value: 'from-cyan-500 via-blue-500 to-indigo-600', label: 'Cyan to Indigo', accent: 'cyan' },
  { value: 'from-amber-500 via-orange-500 to-red-500', label: 'Amber to Red', accent: 'amber' },
  { value: 'from-emerald-500 via-teal-500 to-cyan-500', label: 'Emerald to Cyan', accent: 'emerald' },
  { value: 'from-yellow-400 via-amber-500 to-orange-600', label: 'Yellow to Orange', accent: 'yellow' },
  { value: 'from-red-500 via-rose-500 to-pink-500', label: 'Red to Pink', accent: 'red' },
  { value: 'from-amber-600 via-yellow-600 to-lime-500', label: 'Amber to Lime', accent: 'lime' },
  { value: 'from-violet-500 via-purple-500 to-fuchsia-500', label: 'Violet to Fuchsia', accent: 'violet' },
  { value: 'from-blue-500 via-indigo-500 to-purple-500', label: 'Blue to Purple', accent: 'blue' },
]

const MONTH_OPTIONS = [
  { short: 'JAN', full: 'January' },
  { short: 'FEB', full: 'February' },
  { short: 'MAR', full: 'March' },
  { short: 'APR', full: 'April' },
  { short: 'MAY', full: 'May' },
  { short: 'JUN', full: 'June' },
  { short: 'JUL', full: 'July' },
  { short: 'AUG', full: 'August' },
  { short: 'SEP', full: 'September' },
  { short: 'OCT', full: 'October' },
  { short: 'NOV', full: 'November' },
  { short: 'DEC', full: 'December' },
]

const CATEGORY_OPTIONS = [
  'Cultural Festival',
  'Religious Festival',
  'National Holiday',
  'Sports & Recreation',
  'Cultural Heritage',
  'Music Festival',
  'Food Festival',
  'Art & Craft',
  'Community Event',
]

const defaultEvent: Partial<TimelineEvent> = {
  title: '',
  subtitle: '',
  description: '',
  month: 'January',
  month_short: 'JAN',
  day: '1',
  location: '',
  media_type: 'image',
  media_url: '',
  thumbnail_url: '',
  gradient_colors: 'from-emerald-500 via-teal-500 to-cyan-500',
  accent_color: 'emerald',
  category: 'Cultural Festival',
  highlights: ['', '', '', ''],
  is_active: true,
}

export function TimelineAdminClient({ initialEvents }: TimelineAdminClientProps) {
  const [events, _setEvents] = useState<TimelineEvent[]>(initialEvents)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Partial<TimelineEvent> | null>(null)
  const [loading, setLoading] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploadMode, setUploadMode] = useState<'url' | 'upload'>('upload')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const router = useRouter()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createClient() as any

  const handleImageUpload = async (file: File) => {
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please upload an image file')
      return
    }

    // Validate file size (10MB max for timeline images)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Image must be less than 10MB')
      return
    }

    setUploading(true)
    setUploadError(null)

    try {
      // Create unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `timeline-${Date.now()}.${fileExt}`

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('timeline-photos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        setUploadError(`Upload failed: ${uploadError.message}`)
        return
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('timeline-photos')
        .getPublicUrl(fileName)

      // Update the editing event with the new URL
      updateField('media_url', publicUrl)
    } catch (err) {
      console.error('Unexpected error:', err)
      setUploadError('An unexpected error occurred during upload')
    } finally {
      setUploading(false)
    }
  }

  const handleVideoUpload = async (file: File) => {
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('video/')) {
      setUploadError('Please upload a video file')
      return
    }

    // Validate file size (50MB max for videos)
    if (file.size > 50 * 1024 * 1024) {
      setUploadError('Video must be less than 50MB')
      return
    }

    setUploading(true)
    setUploadError(null)

    try {
      // Create unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `timeline-video-${Date.now()}.${fileExt}`

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('timeline-photos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        setUploadError(`Upload failed: ${uploadError.message}`)
        return
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('timeline-photos')
        .getPublicUrl(fileName)

      // Update the editing event with the new URL
      updateField('media_url', publicUrl)
    } catch (err) {
      console.error('Unexpected error:', err)
      setUploadError('An unexpected error occurred during upload')
    } finally {
      setUploading(false)
    }
  }

  const handleThumbnailUpload = async (file: File) => {
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please upload an image file for thumbnail')
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Thumbnail must be less than 5MB')
      return
    }

    setUploading(true)
    setUploadError(null)

    try {
      // Create unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `thumbnail-${Date.now()}.${fileExt}`

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('timeline-photos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        setUploadError(`Upload failed: ${uploadError.message}`)
        return
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('timeline-photos')
        .getPublicUrl(fileName)

      // Update the editing event with the new URL
      updateField('thumbnail_url', publicUrl)
    } catch (err) {
      console.error('Unexpected error:', err)
      setUploadError('An unexpected error occurred during upload')
    } finally {
      setUploading(false)
    }
  }

  const handleOpenCreate = () => {
    setEditingEvent({ ...defaultEvent, display_order: events.length + 1 })
    setIsModalOpen(true)
  }

  const handleOpenEdit = (event: TimelineEvent) => {
    // Ensure highlights has 4 items
    const highlights = [...(event.highlights || [])]
    while (highlights.length < 4) highlights.push('')
    setEditingEvent({ ...event, highlights })
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingEvent(null)
    setUploadMode('upload')
    setUploadError(null)
  }

  const handleSave = async () => {
    if (!editingEvent) return

    setSaving(true)
    try {
      // Filter out empty highlights
      const highlights = (editingEvent.highlights || []).filter(h => h.trim() !== '')

      const eventData = {
        title: editingEvent.title,
        subtitle: editingEvent.subtitle || null,
        description: editingEvent.description || null,
        month: editingEvent.month,
        month_short: editingEvent.month_short,
        day: editingEvent.day,
        location: editingEvent.location || null,
        media_type: editingEvent.media_type,
        media_url: editingEvent.media_url,
        thumbnail_url: editingEvent.thumbnail_url || null,
        gradient_colors: editingEvent.gradient_colors,
        accent_color: editingEvent.accent_color,
        category: editingEvent.category,
        highlights,
        display_order: editingEvent.display_order,
        is_active: editingEvent.is_active,
      }

      if (editingEvent.id) {
        // Update existing
        const { error } = await supabase
          .from('timeline_events')
          .update(eventData)
          .eq('id', editingEvent.id)

        if (error) throw error
      } else {
        // Create new
        const { error } = await supabase
          .from('timeline_events')
          .insert(eventData)

        if (error) throw error
      }

      handleCloseModal()
      router.refresh()
    } catch (error) {
      console.error('Error saving timeline event:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async (event: TimelineEvent) => {
    setLoading(`active-${event.id}`)
    try {
      const { error } = await supabase
        .from('timeline_events')
        .update({ is_active: !event.is_active })
        .eq('id', event.id)

      if (error) throw error
      router.refresh()
    } catch (error) {
      console.error('Error toggling active status:', error)
    } finally {
      setLoading(null)
    }
  }

  const handleMoveUp = async (event: TimelineEvent, index: number) => {
    if (index === 0) return
    setLoading(`move-${event.id}`)
    try {
      const prevEvent = events[index - 1]
      await Promise.all([
        supabase.from('timeline_events').update({ display_order: event.display_order - 1 }).eq('id', event.id),
        supabase.from('timeline_events').update({ display_order: prevEvent.display_order + 1 }).eq('id', prevEvent.id),
      ])
      router.refresh()
    } catch (error) {
      console.error('Error reordering:', error)
    } finally {
      setLoading(null)
    }
  }

  const handleMoveDown = async (event: TimelineEvent, index: number) => {
    if (index === events.length - 1) return
    setLoading(`move-${event.id}`)
    try {
      const nextEvent = events[index + 1]
      await Promise.all([
        supabase.from('timeline_events').update({ display_order: event.display_order + 1 }).eq('id', event.id),
        supabase.from('timeline_events').update({ display_order: nextEvent.display_order - 1 }).eq('id', nextEvent.id),
      ])
      router.refresh()
    } catch (error) {
      console.error('Error reordering:', error)
    } finally {
      setLoading(null)
    }
  }

  const handleDelete = async (eventId: string) => {
    const { error } = await supabase
      .from('timeline_events')
      .delete()
      .eq('id', eventId)

    if (error) throw error
    router.refresh()
  }

  const updateField = (field: string, value: string | boolean | string[]) => {
    if (!editingEvent) return
    setEditingEvent(prev => prev ? { ...prev, [field]: value } : null)
  }

  const updateHighlight = (index: number, value: string) => {
    if (!editingEvent) return
    const highlights = [...(editingEvent.highlights || [])]
    highlights[index] = value
    setEditingEvent(prev => prev ? { ...prev, highlights } : null)
  }

  const handleMonthChange = (monthFull: string) => {
    const month = MONTH_OPTIONS.find(m => m.full === monthFull)
    if (month) {
      updateField('month', month.full)
      updateField('month_short', month.short)
    }
  }

  const handleGradientChange = (gradientValue: string) => {
    const gradient = GRADIENT_OPTIONS.find(g => g.value === gradientValue)
    if (gradient) {
      updateField('gradient_colors', gradient.value)
      updateField('accent_color', gradient.accent)
    }
  }

  return (
    <>
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Calendar className="text-purple-600" size={20} />
            Timeline Events
            <span className="text-sm font-normal text-slate-500">({events.length})</span>
          </h2>
          <div className="flex items-center gap-2">
            <Link
              href="/events/timeline"
              target="_blank"
              className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl text-sm transition-colors"
            >
              <ExternalLink size={16} />
              <span className="hidden sm:inline">Preview Timeline</span>
            </Link>
            <button
              onClick={handleOpenCreate}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition-colors shadow-lg shadow-emerald-600/25"
            >
              <Plus size={16} />
              Add Event
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {events.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {events.map((event, index) => (
                <div
                  key={event.id}
                  className={cn(
                    'p-4 hover:bg-slate-50/50 transition-colors',
                    !event.is_active && 'opacity-60 bg-slate-50'
                  )}
                >
                  <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                    {/* Reorder Controls */}
                    <div className="flex lg:flex-col items-center gap-1">
                      <button
                        onClick={() => handleMoveUp(event, index)}
                        disabled={index === 0 || loading?.startsWith('move-')}
                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ArrowUp size={16} />
                      </button>
                      <GripVertical size={16} className="text-slate-300" />
                      <button
                        onClick={() => handleMoveDown(event, index)}
                        disabled={index === events.length - 1 || loading?.startsWith('move-')}
                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ArrowDown size={16} />
                      </button>
                    </div>

                    {/* Media Preview */}
                    <div className="relative flex-shrink-0 w-24 h-24 lg:w-28 lg:h-28 rounded-xl overflow-hidden bg-slate-100">
                      {event.media_type === 'video' ? (
                        <>
                          {event.thumbnail_url ? (
                            <Image
                              src={event.thumbnail_url}
                              alt={event.title}
                              fill
                              className="object-cover"
                            />
                          ) : isYouTubeUrl(event.media_url) ? (
                            <img
                              src={getYouTubeThumbnail(event.media_url) || ''}
                              alt={event.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-200">
                              <Video size={32} className="text-slate-400" />
                            </div>
                          )}
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <Play size={24} className="text-white" fill="white" />
                          </div>
                        </>
                      ) : (
                        <Image
                          src={event.media_url}
                          alt={event.title}
                          fill
                          className="object-cover"
                        />
                      )}
                      {/* Gradient overlay preview */}
                      <div className={cn('absolute inset-0 opacity-40 mix-blend-multiply', `bg-gradient-to-t ${event.gradient_colors}`)} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-start gap-2 mb-2">
                        <span className="text-lg font-semibold text-slate-900">
                          {event.title}
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-purple-100 text-purple-700">
                            {event.month_short} {event.day}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-slate-100 text-slate-600">
                            {event.media_type === 'video' ? <Video size={12} /> : <ImageIcon size={12} />}
                            {event.media_type}
                          </span>
                          {!event.is_active && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-700">
                              <EyeOff size={12} />
                              Hidden
                            </span>
                          )}
                        </div>
                      </div>

                      {event.subtitle && (
                        <p className="text-sm text-slate-600 mb-1">{event.subtitle}</p>
                      )}

                      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 mb-2">
                        <span className="inline-flex items-center gap-1.5">
                          <Sparkles size={14} className="text-slate-400" />
                          {event.category}
                        </span>
                        {event.location && (
                          <span className="inline-flex items-center gap-1.5">
                            <MapPin size={14} className="text-slate-400" />
                            {event.location}
                          </span>
                        )}
                      </div>

                      {event.highlights && event.highlights.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {event.highlights.slice(0, 4).map((highlight, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 text-xs text-slate-500 bg-slate-100 rounded-full"
                            >
                              {highlight}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleOpenEdit(event)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors"
                      >
                        <Pencil size={14} />
                        Edit
                      </button>

                      <button
                        onClick={() => handleToggleActive(event)}
                        disabled={loading === `active-${event.id}`}
                        className={cn(
                          'inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors',
                          event.is_active
                            ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                        )}
                      >
                        {loading === `active-${event.id}` ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : event.is_active ? (
                          <EyeOff size={14} />
                        ) : (
                          <Eye size={14} />
                        )}
                        {event.is_active ? 'Hide' : 'Show'}
                      </button>

                      <DeleteButton
                        onConfirm={() => handleDelete(event.id)}
                        itemName={event.title}
                        itemType="timeline event"
                        size="sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-slate-900 mb-1">No timeline events</h3>
              <p className="text-slate-500 mb-4">Create your first annual event for the timeline</p>
              <button
                onClick={handleOpenCreate}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition-colors"
              >
                <Plus size={16} />
                Add Event
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Edit/Create Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl text-slate-900">
              {editingEvent?.id ? 'Edit Timeline Event' : 'Add New Timeline Event'}
            </DialogTitle>
          </DialogHeader>

          {editingEvent && (
            <div className="space-y-6 mt-4">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    value={editingEvent.title || ''}
                    onChange={(e) => updateField('title', e.target.value)}
                    placeholder="e.g., Mashramani"
                    className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder:text-slate-400"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Subtitle
                  </label>
                  <input
                    type="text"
                    value={editingEvent.subtitle || ''}
                    onChange={(e) => updateField('subtitle', e.target.value)}
                    placeholder="e.g., Republic Day Celebrations"
                    className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder:text-slate-400"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={editingEvent.description || ''}
                    onChange={(e) => updateField('description', e.target.value)}
                    rows={3}
                    placeholder="Describe the event..."
                    className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Date & Location */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Month *
                  </label>
                  <select
                    value={editingEvent.month || 'January'}
                    onChange={(e) => handleMonthChange(e.target.value)}
                    className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    {MONTH_OPTIONS.map(month => (
                      <option key={month.short} value={month.full}>{month.full}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Day(s) *
                  </label>
                  <input
                    type="text"
                    value={editingEvent.day || ''}
                    onChange={(e) => updateField('day', e.target.value)}
                    placeholder="e.g., 23 or 1-30"
                    className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={editingEvent.location || ''}
                    onChange={(e) => updateField('location', e.target.value)}
                    placeholder="e.g., Georgetown"
                    className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Media */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Media Type *
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="media_type"
                        value="image"
                        checked={editingEvent.media_type === 'image'}
                        onChange={() => {
                          updateField('media_type', 'image')
                          updateField('media_url', '')
                        }}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <ImageIcon size={16} className="text-slate-500" />
                      <span className="text-sm">Image</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="media_type"
                        value="video"
                        checked={editingEvent.media_type === 'video'}
                        onChange={() => {
                          updateField('media_type', 'video')
                          updateField('media_url', '')
                        }}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <Video size={16} className="text-slate-500" />
                      <span className="text-sm">Video</span>
                    </label>
                  </div>
                </div>

                {/* Upload Mode Toggle */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setUploadMode('upload')}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors',
                      uploadMode === 'upload'
                        ? 'bg-emerald-100 text-emerald-700 font-medium'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    )}
                  >
                    <Upload size={16} />
                    Upload File
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadMode('url')}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors',
                      uploadMode === 'url'
                        ? 'bg-emerald-100 text-emerald-700 font-medium'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    )}
                  >
                    <LinkIcon size={16} />
                    Use URL
                  </button>
                </div>

                {/* Upload Error */}
                {uploadError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{uploadError}</p>
                  </div>
                )}

                {uploadMode === 'upload' ? (
                  /* File Upload */
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      {editingEvent.media_type === 'video' ? 'Upload Video *' : 'Upload Image *'}
                    </label>
                    {editingEvent.media_url ? (
                      <div className="relative">
                        <div className="relative w-full h-48 rounded-xl overflow-hidden bg-slate-100">
                          {editingEvent.media_type === 'video' ? (
                            isYouTubeUrl(editingEvent.media_url) ? (
                              <iframe
                                src={getYouTubeEmbedUrl(editingEvent.media_url, { controls: true }) || ''}
                                className="w-full h-full"
                                style={{ border: 0 }}
                                allow="autoplay; encrypted-media"
                                allowFullScreen
                              />
                            ) : (
                              <video
                                src={editingEvent.media_url}
                                className="w-full h-full object-cover"
                                controls
                              />
                            )
                          ) : (
                            <Image
                              src={editingEvent.media_url}
                              alt="Preview"
                              fill
                              className="object-cover"
                            />
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => updateField('media_url', '')}
                          className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <label
                        className={cn(
                          'flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl cursor-pointer transition-colors',
                          uploading
                            ? 'bg-slate-100 border-slate-300 cursor-not-allowed'
                            : 'bg-slate-50 border-slate-300 hover:bg-slate-100 hover:border-emerald-400'
                        )}
                      >
                        <input
                          type="file"
                          accept={editingEvent.media_type === 'video' ? 'video/*' : 'image/*'}
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              if (editingEvent.media_type === 'video') {
                                handleVideoUpload(file)
                              } else {
                                handleImageUpload(file)
                              }
                            }
                          }}
                          disabled={uploading}
                          className="hidden"
                        />
                        {uploading ? (
                          <div className="flex flex-col items-center gap-2">
                            <Loader2 size={32} className="text-emerald-600 animate-spin" />
                            <span className="text-sm text-slate-600">Uploading...</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                              <Upload size={24} className="text-emerald-600" />
                            </div>
                            <span className="text-sm font-medium text-slate-700">
                              Click to upload {editingEvent.media_type === 'video' ? 'video' : 'image'}
                            </span>
                            <span className="text-xs text-slate-500">
                              {editingEvent.media_type === 'video'
                                ? 'MP4, WebM up to 50MB'
                                : 'JPG, PNG, WebP up to 10MB'}
                            </span>
                          </div>
                        )}
                      </label>
                    )}
                  </div>
                ) : (
                  /* URL Input */
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      {editingEvent.media_type === 'video' ? 'Video URL *' : 'Image URL *'}
                    </label>
                    <input
                      type="url"
                      value={editingEvent.media_url || ''}
                      onChange={(e) => updateField('media_url', e.target.value)}
                      placeholder={editingEvent.media_type === 'video' ? 'https://example.com/video.mp4' : 'https://example.com/image.jpg'}
                      className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder:text-slate-400"
                    />
                  </div>
                )}

                {editingEvent.media_type === 'video' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Thumbnail {uploadMode === 'upload' ? '(Upload)' : '(URL)'} - optional
                    </label>
                    {uploadMode === 'upload' ? (
                      editingEvent.thumbnail_url ? (
                        <div className="relative w-32 h-32">
                          <Image
                            src={editingEvent.thumbnail_url}
                            alt="Thumbnail"
                            fill
                            className="object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => updateField('thumbnail_url', '')}
                            className="absolute -top-2 -right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed rounded-lg cursor-pointer bg-slate-50 border-slate-300 hover:bg-slate-100 hover:border-emerald-400 transition-colors">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) {
                                handleThumbnailUpload(file)
                              }
                            }}
                            disabled={uploading}
                            className="hidden"
                          />
                          <Upload size={20} className="text-slate-400 mb-1" />
                          <span className="text-xs text-slate-500">Thumbnail</span>
                        </label>
                      )
                    ) : (
                      <input
                        type="url"
                        value={editingEvent.thumbnail_url || ''}
                        onChange={(e) => updateField('thumbnail_url', e.target.value)}
                        placeholder="https://example.com/thumbnail.jpg"
                        className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder:text-slate-400"
                      />
                    )}
                  </div>
                )}

                {/* Media Preview for URL mode */}
                {uploadMode === 'url' && editingEvent.media_url && (
                  <div className="relative w-full h-48 rounded-xl overflow-hidden bg-slate-100">
                    {editingEvent.media_type === 'video' ? (
                      isYouTubeUrl(editingEvent.media_url) ? (
                        <iframe
                          src={getYouTubeEmbedUrl(editingEvent.media_url, { controls: true }) || ''}
                          className="w-full h-full"
                          style={{ border: 0 }}
                          allow="autoplay; encrypted-media"
                          allowFullScreen
                        />
                      ) : (
                        <video
                          src={editingEvent.media_url}
                          className="w-full h-full object-cover"
                          controls
                        />
                      )
                    ) : (
                      <Image
                        src={editingEvent.media_url}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                )}
              </div>

              {/* Styling */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={editingEvent.category || 'Cultural Festival'}
                    onChange={(e) => updateField('category', e.target.value)}
                    className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    {CATEGORY_OPTIONS.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Card Gradient
                  </label>
                  <select
                    value={editingEvent.gradient_colors || GRADIENT_OPTIONS[0].value}
                    onChange={(e) => handleGradientChange(e.target.value)}
                    className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    {GRADIENT_OPTIONS.map(gradient => (
                      <option key={gradient.value} value={gradient.value}>{gradient.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Gradient Preview */}
              <div className={cn('h-8 rounded-lg', `bg-gradient-to-r ${editingEvent.gradient_colors}`)} />

              {/* Highlights */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Highlights (up to 4)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[0, 1, 2, 3].map(index => (
                    <input
                      key={index}
                      type="text"
                      value={editingEvent.highlights?.[index] || ''}
                      onChange={(e) => updateHighlight(index, e.target.value)}
                      placeholder={`Highlight ${index + 1}`}
                      className="px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm placeholder:text-slate-400"
                    />
                  ))}
                </div>
              </div>

              {/* Active Status */}
              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingEvent.is_active !== false}
                    onChange={(e) => updateField('is_active', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
                <span className="text-sm font-medium text-slate-700">
                  Show in timeline
                </span>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !editingEvent.title || !editingEvent.media_url}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check size={16} />
                      {editingEvent.id ? 'Save Changes' : 'Create Event'}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
