-- Add cycle_duration column to tourism_hero_videos
-- Allows admins to control how long each video displays before cycling
-- NULL means the video plays to completion (default behavior)
ALTER TABLE tourism_hero_videos
  ADD COLUMN IF NOT EXISTS cycle_duration INTEGER DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN tourism_hero_videos.cycle_duration IS 'Duration in seconds before cycling to next video. NULL = play to completion.';
