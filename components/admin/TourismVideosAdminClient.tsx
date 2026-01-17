'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import {
  Plus,
  Video,
  Eye,
  EyeOff,
  Pencil,
  Check,
  Loader2,
  ArrowUp,
  ArrowDown,
  Upload,
  X,
  Link as LinkIcon,
  Trash2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface HeroVideo {
  id: string
  title: string
  video_url: string
  thumbnail_url: string | null
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

interface TourismVideosAdminClientProps {
  initialVideos: HeroVideo[]
}

const defaultVideo: Partial<HeroVideo> = {
  title: '',
  video_url: '',
  thumbnail_url: '',
  is_active: true,
}

export function TourismVideosAdminClient({ initialVideos }: TourismVideosAdminClientProps) {
  const [videos, setVideos] = useState<HeroVideo[]>(initialVideos)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingVideo, setEditingVideo] = useState<Partial<HeroVideo> | null>(null)
  const [loading, setLoading] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploadMode, setUploadMode] = useState<'url' | 'upload'>('upload')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const router = useRouter()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createClient() as any

  const handleVideoUpload = async (file: File) => {
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('video/')) {
      setUploadError('Please upload a video file')
      return
    }

    // Validate file size (100MB max for videos)
    if (file.size > 100 * 1024 * 1024) {
      setUploadError('Video must be less than 100MB')
      return
    }

    setUploading(true)
    setUploadError(null)

    try {
      // Create unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `hero-${Date.now()}.${fileExt}`

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('tourism-hero-videos')
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
        .from('tourism-hero-videos')
        .getPublicUrl(fileName)

      // Update the editing video with the new URL
      updateField('video_url', publicUrl)
    } catch (err) {
      console.error('Unexpected error:', err)
      setUploadError('An unexpected error occurred during upload')
    } finally {
      setUploading(false)
    }
  }

  const updateField = (field: keyof HeroVideo, value: string | boolean | null) => {
    setEditingVideo(prev => prev ? { ...prev, [field]: value } : null)
  }

  const openNewModal = () => {
    setEditingVideo({ ...defaultVideo })
    setUploadMode('upload')
    setUploadError(null)
    setIsModalOpen(true)
  }

  const openEditModal = (video: HeroVideo) => {
    setEditingVideo({ ...video })
    setUploadMode(video.video_url.startsWith('http') ? 'url' : 'upload')
    setUploadError(null)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingVideo(null)
    setUploadError(null)
  }

  const handleSave = async () => {
    if (!editingVideo || !editingVideo.title || !editingVideo.video_url) return

    setSaving(true)

    try {
      if (editingVideo.id) {
        // Update existing video
        const { error } = await supabase
          .from('tourism_hero_videos')
          .update({
            title: editingVideo.title,
            video_url: editingVideo.video_url,
            thumbnail_url: editingVideo.thumbnail_url || null,
            is_active: editingVideo.is_active,
          })
          .eq('id', editingVideo.id)

        if (error) throw error
      } else {
        // Create new video
        const maxOrder = videos.length > 0
          ? Math.max(...videos.map(v => v.display_order))
          : 0

        const { error } = await supabase
          .from('tourism_hero_videos')
          .insert({
            title: editingVideo.title,
            video_url: editingVideo.video_url,
            thumbnail_url: editingVideo.thumbnail_url || null,
            is_active: editingVideo.is_active ?? true,
            display_order: maxOrder + 1,
          })

        if (error) throw error
      }

      router.refresh()
      closeModal()
    } catch (err) {
      console.error('Save error:', err)
      setUploadError('Failed to save video')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this video?')) return

    setLoading(id)

    try {
      const { error } = await supabase
        .from('tourism_hero_videos')
        .delete()
        .eq('id', id)

      if (error) throw error

      setVideos(prev => prev.filter(v => v.id !== id))
      router.refresh()
    } catch (err) {
      console.error('Delete error:', err)
    } finally {
      setLoading(null)
    }
  }

  const handleToggleActive = async (video: HeroVideo) => {
    setLoading(video.id)

    try {
      const { error } = await supabase
        .from('tourism_hero_videos')
        .update({ is_active: !video.is_active })
        .eq('id', video.id)

      if (error) throw error

      setVideos(prev => prev.map(v =>
        v.id === video.id ? { ...v, is_active: !v.is_active } : v
      ))
      router.refresh()
    } catch (err) {
      console.error('Toggle error:', err)
    } finally {
      setLoading(null)
    }
  }

  const handleMoveUp = async (index: number) => {
    if (index === 0) return

    const video = videos[index]
    const prevVideo = videos[index - 1]

    setLoading(video.id)

    try {
      // Swap display orders
      await supabase
        .from('tourism_hero_videos')
        .update({ display_order: prevVideo.display_order })
        .eq('id', video.id)

      await supabase
        .from('tourism_hero_videos')
        .update({ display_order: video.display_order })
        .eq('id', prevVideo.id)

      // Update local state
      const newVideos = [...videos]
      newVideos[index] = { ...prevVideo, display_order: video.display_order }
      newVideos[index - 1] = { ...video, display_order: prevVideo.display_order }
      setVideos(newVideos)
      router.refresh()
    } catch (err) {
      console.error('Move error:', err)
    } finally {
      setLoading(null)
    }
  }

  const handleMoveDown = async (index: number) => {
    if (index === videos.length - 1) return

    const video = videos[index]
    const nextVideo = videos[index + 1]

    setLoading(video.id)

    try {
      // Swap display orders
      await supabase
        .from('tourism_hero_videos')
        .update({ display_order: nextVideo.display_order })
        .eq('id', video.id)

      await supabase
        .from('tourism_hero_videos')
        .update({ display_order: video.display_order })
        .eq('id', nextVideo.id)

      // Update local state
      const newVideos = [...videos]
      newVideos[index] = { ...nextVideo, display_order: video.display_order }
      newVideos[index + 1] = { ...video, display_order: nextVideo.display_order }
      setVideos(newVideos)
      router.refresh()
    } catch (err) {
      console.error('Move error:', err)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Hero Videos</h2>
          <p className="text-sm text-gray-600">
            Manage the videos that appear in the tourism page hero carousel
          </p>
        </div>
        <button
          onClick={openNewModal}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Video
        </button>
      </div>

      {/* Videos List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {videos.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Video className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No hero videos yet. Add your first video to get started.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {videos.map((video, index) => (
              <div
                key={video.id}
                className={cn(
                  "flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors",
                  !video.is_active && "opacity-60"
                )}
              >
                {/* Order Controls */}
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0 || loading === video.id}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleMoveDown(index)}
                    disabled={index === videos.length - 1 || loading === video.id}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>

                {/* Video Preview */}
                <div className="w-32 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
                  <video
                    src={video.video_url}
                    className="w-full h-full object-cover"
                    muted
                    preload="metadata"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <Video className="w-6 h-6 text-white" />
                  </div>
                </div>

                {/* Video Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">{video.title}</h3>
                  <p className="text-sm text-gray-500 truncate">{video.video_url}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={cn(
                      "inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full",
                      video.is_active
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-gray-100 text-gray-600"
                    )}>
                      {video.is_active ? (
                        <><Eye className="w-3 h-3" /> Active</>
                      ) : (
                        <><EyeOff className="w-3 h-3" /> Hidden</>
                      )}
                    </span>
                    <span className="text-xs text-gray-400">
                      Order: {video.display_order}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleActive(video)}
                    disabled={loading === video.id}
                    className={cn(
                      "p-2 rounded-lg transition-colors",
                      video.is_active
                        ? "text-emerald-600 hover:bg-emerald-50"
                        : "text-gray-400 hover:bg-gray-100"
                    )}
                    title={video.is_active ? "Hide" : "Show"}
                  >
                    {loading === video.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : video.is_active ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => openEditModal(video)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(video.id)}
                    disabled={loading === video.id}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    {loading === video.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit/Create Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg bg-white text-gray-900">
          <DialogHeader>
            <DialogTitle className="text-gray-900">
              {editingVideo?.id ? 'Edit Video' : 'Add New Video'}
            </DialogTitle>
          </DialogHeader>

          {editingVideo && (
            <div className="space-y-6 mt-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={editingVideo.title || ''}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder="e.g., Kaieteur Falls"
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 placeholder:text-gray-400"
                />
              </div>

              {/* Video Source Toggle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Video Source
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setUploadMode('upload')
                      setUploadError(null)
                    }}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition-colors",
                      uploadMode === 'upload'
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    )}
                  >
                    <Upload className="w-4 h-4" />
                    Upload
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setUploadMode('url')
                      setUploadError(null)
                    }}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition-colors",
                      uploadMode === 'url'
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    )}
                  >
                    <LinkIcon className="w-4 h-4" />
                    URL
                  </button>
                </div>
              </div>

              {/* Upload or URL Input */}
              {uploadMode === 'upload' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Video (max 100MB)
                  </label>
                  <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
                    {uploading ? (
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                        <p className="text-sm text-gray-600">Uploading...</p>
                      </div>
                    ) : editingVideo.video_url ? (
                      <div className="space-y-3">
                        <video
                          src={editingVideo.video_url}
                          className="w-full max-h-40 object-contain rounded-lg"
                          controls
                          muted
                        />
                        <button
                          type="button"
                          onClick={() => updateField('video_url', '')}
                          className="text-sm text-red-600 hover:text-red-700"
                        >
                          Remove video
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="video/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleVideoUpload(file)
                          }}
                        />
                        <Video className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                        <p className="text-sm text-gray-600">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          MP4, WebM, MOV up to 100MB
                        </p>
                      </label>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Video URL *
                  </label>
                  <input
                    type="url"
                    value={editingVideo.video_url || ''}
                    onChange={(e) => updateField('video_url', e.target.value)}
                    placeholder="https://example.com/video.mp4"
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 placeholder:text-gray-400"
                  />
                  {editingVideo.video_url && (
                    <div className="mt-3">
                      <video
                        src={editingVideo.video_url}
                        className="w-full max-h-40 object-contain rounded-lg bg-gray-100"
                        controls
                        muted
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Upload Error */}
              {uploadError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{uploadError}</p>
                </div>
              )}

              {/* Active Toggle */}
              <div className="flex items-center justify-between py-3 border-t border-gray-200">
                <div>
                  <p className="font-medium text-gray-900">Active</p>
                  <p className="text-sm text-gray-500">Show this video in the hero carousel</p>
                </div>
                <button
                  type="button"
                  onClick={() => updateField('is_active', !editingVideo.is_active)}
                  className={cn(
                    "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2",
                    editingVideo.is_active ? "bg-emerald-600" : "bg-gray-200"
                  )}
                >
                  <span
                    className={cn(
                      "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                      editingVideo.is_active ? "translate-x-5" : "translate-x-0"
                    )}
                  />
                </button>
              </div>

              {/* Save Button */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || !editingVideo.title || !editingVideo.video_url}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      {editingVideo.id ? 'Update' : 'Create'}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
