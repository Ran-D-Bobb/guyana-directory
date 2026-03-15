-- Add video support to tourism experiences
-- Allows experiences to have a hero video (MP4/WebM URL) alongside photos
ALTER TABLE tourism_experiences
  ADD COLUMN IF NOT EXISTS video_url TEXT,
  ADD COLUMN IF NOT EXISTS video_thumbnail_url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN tourism_experiences.video_url IS 'Optional hero video URL (MP4/WebM/YouTube) for kiosk and detail pages';
COMMENT ON COLUMN tourism_experiences.video_thumbnail_url IS 'Optional poster/thumbnail image for the video';
