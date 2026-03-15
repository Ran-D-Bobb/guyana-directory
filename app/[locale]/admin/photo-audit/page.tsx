'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { getCategoryImage } from '@/lib/category-images'
import {
  Check,
  X,
  SkipForward,
  ChevronLeft,
  ChevronRight,
  ImageOff,
  Loader2,
  Filter,
  Keyboard,
  ArrowLeft,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface BusinessWithPhoto {
  id: string
  name: string
  description: string | null
  category_name: string
  category_slug: string
  region_name: string
  address: string | null
  photo_id: string
  photo_url: string
  is_primary: boolean
}

type Decision = 'keep' | 'remove' | 'skip'

interface AuditEntry {
  business: BusinessWithPhoto
  decision: Decision
}

// localStorage helpers for persisting audit progress
const STORAGE_KEY = 'waypoint-photo-audit'

function getReviewedPhotos(): Set<string> {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (data) {
      const parsed = JSON.parse(data)
      return new Set(parsed.reviewedPhotoIds || [])
    }
  } catch {}
  return new Set()
}

function markPhotoReviewed(photoId: string) {
  try {
    const reviewed = getReviewedPhotos()
    reviewed.add(photoId)
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      reviewedPhotoIds: [...reviewed],
      updatedAt: new Date().toISOString(),
    }))
  } catch {}
}

function clearReviewedPhotos() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {}
}

export default function PhotoAuditPage() {
  const [businesses, setBusinesses] = useState<BusinessWithPhoto[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState(false)
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([])
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [totalWithReviewed, setTotalWithReviewed] = useState(0)

  const supabase = createClient()

  // Load categories
  useEffect(() => {
    async function loadCategories() {
      const { data } = await supabase
        .from('categories')
        .select('id, name, slug')
        .order('name')
      if (data) setCategories(data)
    }
    loadCategories()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Load businesses with photos
  useEffect(() => {
    async function loadBusinesses() {
      setLoading(true)
      setCurrentIndex(0)
      setAuditLog([])
      setImageError(false)

      // Fetch businesses that have photos AND are active
      let query = supabase
        .from('businesses')
        .select(`
          id, name, description, address, is_active,
          categories(name, slug),
          regions(name),
          business_photos(id, image_url, is_primary)
        `)
        .eq('is_active', true)
        .order('name')

      if (selectedCategory) {
        query = query.eq('category_id', selectedCategory)
      }

      const reviewed = getReviewedPhotos()
      const allBiz: BusinessWithPhoto[] = []
      let totalCount = 0
      let offset = 0
      const batchSize = 500

      while (true) {
        const { data } = await query.range(offset, offset + batchSize - 1)
        if (!data || data.length === 0) break

        for (const biz of data) {
          const photos = (biz.business_photos as Array<{ id: string; image_url: string; is_primary: boolean }>) || []
          if (photos.length === 0) continue

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const cat = biz.categories as any
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const reg = biz.regions as any

          const primaryPhoto = photos.find(p => p.is_primary) || photos[0]
          if (primaryPhoto) {
            totalCount++
            // Skip already-reviewed photos
            if (reviewed.has(primaryPhoto.id)) continue

            allBiz.push({
              id: biz.id,
              name: biz.name,
              description: biz.description,
              category_name: cat?.name || 'Uncategorized',
              category_slug: cat?.slug || 'other-services',
              region_name: reg?.name || 'Unknown',
              address: biz.address,
              photo_id: primaryPhoto.id,
              photo_url: primaryPhoto.image_url,
              is_primary: primaryPhoto.is_primary,
            })
          }
        }

        if (data.length < batchSize) break
        offset += batchSize
      }

      setTotalWithReviewed(totalCount)
      setBusinesses(allBiz)
      setLoading(false)
    }

    loadBusinesses()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory])

  const current = businesses[currentIndex] || null
  const defaultImage = current ? getCategoryImage(current.category_slug) : ''
  const isComplete = currentIndex >= businesses.length && businesses.length > 0

  const goNext = useCallback(() => {
    setImageError(false)
    setCurrentIndex(prev => Math.min(prev + 1, businesses.length))
  }, [businesses.length])

  const goPrev = useCallback(() => {
    setImageError(false)
    setCurrentIndex(prev => Math.max(prev - 1, 0))
  }, [])

  const handleKeep = useCallback(() => {
    if (!current || acting) return
    markPhotoReviewed(current.photo_id)
    setAuditLog(prev => [...prev, { business: current, decision: 'keep' }])
    goNext()
  }, [current, acting, goNext])

  const handleRemove = useCallback(async () => {
    if (!current || acting) return
    setActing(true)

    try {
      const res = await fetch('/api/admin/photo-audit', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photoId: current.photo_id,
          businessName: current.name,
          imageUrl: current.photo_url,
        }),
      })

      const result = await res.json()

      if (res.ok && result.success) {
        markPhotoReviewed(current.photo_id)
        setAuditLog(prev => [...prev, { business: current, decision: 'remove' }])
        // Remove this entry from the list so we don't revisit
        setBusinesses(prev => prev.filter((_, i) => i !== currentIndex))
        setImageError(false)
      } else {
        alert(`Failed to remove photo: ${result.error || 'Unknown error'}`)
      }
    } catch (err) {
      alert(`Failed to remove photo: ${err}`)
    }

    setActing(false)
  }, [current, acting, currentIndex])

  const handleSkip = useCallback(() => {
    if (!current || acting) return
    // Don't mark as reviewed — skip means "come back to this later"
    setAuditLog(prev => [...prev, { business: current, decision: 'skip' }])
    goNext()
  }, [current, acting, goNext])

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return
      if (isComplete || !current) return

      switch (e.key) {
        case 'ArrowRight':
        case 'k':
          e.preventDefault()
          handleKeep()
          break
        case 'ArrowLeft':
        case 'r':
          e.preventDefault()
          handleRemove()
          break
        case 'ArrowDown':
        case 's':
          e.preventDefault()
          handleSkip()
          break
        case '?':
          setShowShortcuts(prev => !prev)
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [current, isComplete, handleKeep, handleRemove, handleSkip])

  const removedCount = auditLog.filter(e => e.decision === 'remove').length
  const keptCount = auditLog.filter(e => e.decision === 'keep').length
  const skippedCount = auditLog.filter(e => e.decision === 'skip').length

  return (
    <div className="min-h-screen p-4 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/businesses"
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Photo Audit</h1>
            <p className="text-sm text-muted-foreground">
              Review business photos — remove mismatched images
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowShortcuts(!showShortcuts)}
          className="flex items-center gap-2 px-3 py-2 text-sm rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
        >
          <Keyboard size={16} />
          <span className="hidden sm:inline">Shortcuts</span>
        </button>
      </div>

      {/* Keyboard shortcuts panel */}
      {showShortcuts && (
        <div className="mb-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
          <h3 className="font-semibold mb-3">Keyboard Shortcuts</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-white dark:bg-slate-700 rounded border text-xs font-mono">→</kbd>
              <span>or</span>
              <kbd className="px-2 py-1 bg-white dark:bg-slate-700 rounded border text-xs font-mono">K</kbd>
              <span>Keep photo</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-white dark:bg-slate-700 rounded border text-xs font-mono">←</kbd>
              <span>or</span>
              <kbd className="px-2 py-1 bg-white dark:bg-slate-700 rounded border text-xs font-mono">R</kbd>
              <span>Remove photo</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-white dark:bg-slate-700 rounded border text-xs font-mono">↓</kbd>
              <span>or</span>
              <kbd className="px-2 py-1 bg-white dark:bg-slate-700 rounded border text-xs font-mono">S</kbd>
              <span>Skip</span>
            </div>
          </div>
        </div>
      )}

      {/* Filter bar */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-muted-foreground" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        {/* Progress stats */}
        {businesses.length > 0 && (
          <div className="flex items-center gap-4 ml-auto text-sm text-muted-foreground">
            {totalWithReviewed > businesses.length && (
              <span className="text-emerald-600">
                {totalWithReviewed - businesses.length} previously reviewed
              </span>
            )}
            <span className="font-medium text-foreground">
              {Math.min(currentIndex + 1, businesses.length)} / {businesses.length} remaining
            </span>
            {keptCount > 0 && (
              <span className="text-emerald-600">{keptCount} kept</span>
            )}
            {removedCount > 0 && (
              <span className="text-red-500">{removedCount} removed</span>
            )}
            {skippedCount > 0 && (
              <span className="text-slate-400">{skippedCount} skipped</span>
            )}
          </div>
        )}
      </div>

      {/* Progress bar */}
      {businesses.length > 0 && (
        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mb-8 overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-300"
            style={{ width: `${(currentIndex / businesses.length) * 100}%` }}
          />
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 size={40} className="animate-spin text-emerald-500 mb-4" />
          <p className="text-muted-foreground">Loading businesses with photos...</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && businesses.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <ImageOff size={48} className="text-slate-300 mb-4" />
          <h2 className="text-xl font-semibold mb-2">No photos to review</h2>
          <p className="text-muted-foreground">
            {selectedCategory
              ? 'No businesses with photos in this category.'
              : 'No businesses with photos found.'}
          </p>
        </div>
      )}

      {/* Complete state */}
      {isComplete && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-6">
            <Check size={40} className="text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Audit Complete</h2>
          <p className="text-muted-foreground mb-6">
            Reviewed {auditLog.length} businesses
          </p>
          <div className="flex items-center gap-6 text-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">{keptCount}</div>
              <div className="text-sm text-muted-foreground">Kept</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">{removedCount}</div>
              <div className="text-sm text-muted-foreground">Removed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-400">{skippedCount}</div>
              <div className="text-sm text-muted-foreground">Skipped</div>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-8">
            <button
              onClick={() => {
                clearReviewedPhotos()
                window.location.reload()
              }}
              className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium"
            >
              Start Over (reset all progress)
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors font-medium"
            >
              Review skipped only
            </button>
          </div>
        </div>
      )}

      {/* Main audit card */}
      {!loading && current && !isComplete && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category default image (left = Remove side) */}
          <div className="space-y-3">
            <div className="text-sm font-medium text-muted-foreground">
              Category Default ({current.category_name})
            </div>
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-600">
              <Image
                src={defaultImage}
                alt={`Default for ${current.category_name}`}
                fill
                className="object-cover opacity-80"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="px-3 py-1.5 bg-black/60 text-white text-sm rounded-lg backdrop-blur-sm">
                  Fallback if removed
                </span>
              </div>
            </div>
          </div>

          {/* Business photo (right = Keep side) */}
          <div className="space-y-3">
            <div className="text-sm font-medium text-muted-foreground">Current Photo</div>
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700">
              {!imageError ? (
                <Image
                  src={current.photo_url}
                  alt={current.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  onError={() => setImageError(true)}
                  unoptimized={current.photo_url.includes('googleusercontent') || current.photo_url.includes('googleapis')}
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                  <ImageOff size={48} className="mb-2" />
                  <span className="text-sm">Image failed to load</span>
                </div>
              )}
            </div>
          </div>

          {/* Business info */}
          <div className="lg:col-span-2">
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-1">{current.name}</h2>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
                    <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-md font-medium">
                      {current.category_name}
                    </span>
                    <span>{current.region_name}</span>
                    {current.address && (
                      <span className="truncate max-w-[300px]">{current.address}</span>
                    )}
                  </div>
                  {current.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {current.description}
                    </p>
                  )}
                </div>
                <Link
                  href={`/admin/businesses/${current.id}/edit`}
                  className="text-sm text-emerald-600 hover:text-emerald-700 hover:underline whitespace-nowrap"
                >
                  Edit business
                </Link>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="lg:col-span-2 flex items-center justify-center gap-4 py-4">
            {/* Previous */}
            <button
              onClick={goPrev}
              disabled={currentIndex === 0}
              className="flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={24} />
            </button>

            {/* Remove (left side — matches fallback image) */}
            <button
              onClick={handleRemove}
              disabled={acting}
              className={cn(
                'flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold text-lg transition-all',
                'bg-red-50 text-red-600 hover:bg-red-100 border-2 border-red-200',
                'dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/50 dark:border-red-800',
                acting && 'opacity-50 cursor-not-allowed'
              )}
            >
              {acting ? (
                <Loader2 size={22} className="animate-spin" />
              ) : (
                <X size={22} strokeWidth={2.5} />
              )}
              Remove
              <kbd className="ml-1 px-1.5 py-0.5 text-xs bg-red-100 dark:bg-red-900/30 rounded">←</kbd>
            </button>

            {/* Skip */}
            <button
              onClick={handleSkip}
              disabled={acting}
              className="flex items-center gap-2 px-6 py-4 rounded-2xl font-medium text-lg bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 transition-colors"
            >
              <SkipForward size={20} />
              Skip
              <kbd className="ml-1 px-1.5 py-0.5 text-xs bg-slate-200 dark:bg-slate-700 rounded">↓</kbd>
            </button>

            {/* Keep (right side — matches current photo) */}
            <button
              onClick={handleKeep}
              disabled={acting}
              className={cn(
                'flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold text-lg transition-all',
                'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-2 border-emerald-200',
                'dark:bg-emerald-950/30 dark:text-emerald-400 dark:hover:bg-emerald-950/50 dark:border-emerald-800',
              )}
            >
              <Check size={22} strokeWidth={2.5} />
              Keep
              <kbd className="ml-1 px-1.5 py-0.5 text-xs bg-emerald-100 dark:bg-emerald-900/30 rounded">→</kbd>
            </button>

            {/* Next */}
            <button
              onClick={goNext}
              disabled={currentIndex >= businesses.length - 1}
              className="flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
