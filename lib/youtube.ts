// YouTube URL detection and embedding utilities

/**
 * Extract YouTube video ID from various URL formats
 * Supports: youtube.com/watch?v=, youtu.be/, youtube.com/embed/, youtube.com/shorts/
 */
export function getYouTubeVideoId(url: string): string | null {
  if (!url) return null

  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?#]+)/,
    /youtube\.com\/shorts\/([^&\s?#]+)/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }

  return null
}

/**
 * Check if a URL is a YouTube video URL
 */
export function isYouTubeUrl(url: string): boolean {
  return getYouTubeVideoId(url) !== null
}

/**
 * Get YouTube embed URL with autoplay, mute, and loop settings for background video
 */
export function getYouTubeEmbedUrl(url: string, options?: {
  autoplay?: boolean
  mute?: boolean
  loop?: boolean
  controls?: boolean
}): string | null {
  const videoId = getYouTubeVideoId(url)
  if (!videoId) return null

  const { autoplay = true, mute = true, loop = true, controls = false } = options || {}

  const params = new URLSearchParams({
    autoplay: autoplay ? '1' : '0',
    mute: mute ? '1' : '0',
    loop: loop ? '1' : '0',
    playlist: videoId, // Required for loop to work
    controls: controls ? '1' : '0',
    showinfo: '0',
    rel: '0',
    modestbranding: '1',
    playsinline: '1',
  })

  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`
}

/**
 * Get YouTube thumbnail URL
 */
export function getYouTubeThumbnail(url: string, quality: 'default' | 'medium' | 'high' | 'max' = 'high'): string | null {
  const videoId = getYouTubeVideoId(url)
  if (!videoId) return null

  const qualityMap = {
    default: 'default',
    medium: 'mqdefault',
    high: 'hqdefault',
    max: 'maxresdefault',
  }

  return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}.jpg`
}
