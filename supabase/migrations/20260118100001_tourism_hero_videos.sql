-- Tourism Hero Videos Table
-- Stores videos displayed in the tourism page hero section

CREATE TABLE IF NOT EXISTS tourism_hero_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Video info
  title TEXT NOT NULL,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,

  -- Ordering and visibility
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for ordering
CREATE INDEX IF NOT EXISTS idx_tourism_hero_videos_order ON tourism_hero_videos(display_order, is_active);

-- Auto-update updated_at trigger
DROP TRIGGER IF EXISTS set_tourism_hero_videos_updated_at ON tourism_hero_videos;
CREATE TRIGGER set_tourism_hero_videos_updated_at
  BEFORE UPDATE ON tourism_hero_videos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE tourism_hero_videos ENABLE ROW LEVEL SECURITY;

-- Public can view active videos
CREATE POLICY "Public can view active tourism hero videos"
  ON tourism_hero_videos
  FOR SELECT
  USING (is_active = true);

-- Admins can view all videos
CREATE POLICY "Admins can view all tourism hero videos"
  ON tourism_hero_videos
  FOR SELECT
  USING (is_admin());

-- Admins can insert videos
CREATE POLICY "Admins can insert tourism hero videos"
  ON tourism_hero_videos
  FOR INSERT
  WITH CHECK (is_admin());

-- Admins can update videos
CREATE POLICY "Admins can update tourism hero videos"
  ON tourism_hero_videos
  FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

-- Admins can delete videos
CREATE POLICY "Admins can delete tourism hero videos"
  ON tourism_hero_videos
  FOR DELETE
  USING (is_admin());

-- Create storage bucket for tourism hero videos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'tourism-hero-videos',
  'tourism-hero-videos',
  true,
  104857600, -- 100MB limit for videos
  ARRAY['video/mp4', 'video/webm', 'video/quicktime', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 104857600,
  allowed_mime_types = ARRAY['video/mp4', 'video/webm', 'video/quicktime', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

-- Storage policies for tourism hero videos

-- Allow anyone to view tourism hero videos (public bucket)
CREATE POLICY "Anyone can view tourism hero videos"
ON storage.objects FOR SELECT
USING (bucket_id = 'tourism-hero-videos');

-- Allow admins to upload tourism hero videos
CREATE POLICY "Admins can upload tourism hero videos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'tourism-hero-videos' AND is_admin()
);

-- Allow admins to update tourism hero videos
CREATE POLICY "Admins can update tourism hero videos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'tourism-hero-videos' AND is_admin()
);

-- Allow admins to delete tourism hero videos
CREATE POLICY "Admins can delete tourism hero videos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'tourism-hero-videos' AND is_admin()
);

-- Seed with default videos (only if table is empty)
INSERT INTO tourism_hero_videos (title, video_url, display_order)
SELECT * FROM (VALUES
  ('Natural Paradise', 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 1),
  ('Dream Adventure', 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', 2),
  ('Epic Journey', 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', 3),
  ('Steel Adventure', 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', 4),
  ('Great Escapes', 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', 5)
) AS seed_data(title, video_url, display_order)
WHERE NOT EXISTS (SELECT 1 FROM tourism_hero_videos LIMIT 1);
