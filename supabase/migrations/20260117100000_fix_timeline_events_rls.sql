-- Timeline Events Table - Create if not exists and fix RLS policies
-- This migration is idempotent - safe to run multiple times

-- Create the table if it doesn't exist
CREATE TABLE IF NOT EXISTS timeline_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Core event info
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,

  -- Date display (not actual dates since these are annual/recurring)
  month TEXT NOT NULL,           -- Full month name e.g., "February"
  month_short TEXT NOT NULL,     -- 3-letter abbrev e.g., "FEB"
  day TEXT NOT NULL,             -- Day(s) e.g., "23" or "1-30"

  -- Location
  location TEXT,

  -- Media (supports image or video)
  media_type TEXT NOT NULL DEFAULT 'image' CHECK (media_type IN ('image', 'video')),
  media_url TEXT NOT NULL,
  thumbnail_url TEXT,            -- For videos, optional preview image

  -- Styling
  gradient_colors TEXT NOT NULL DEFAULT 'from-emerald-500 via-teal-500 to-cyan-500',
  accent_color TEXT NOT NULL DEFAULT 'emerald',

  -- Event metadata
  category TEXT NOT NULL DEFAULT 'Cultural Festival',
  highlights TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Ordering and visibility
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for ordering (if not exists)
CREATE INDEX IF NOT EXISTS idx_timeline_events_order ON timeline_events(display_order, is_active);

-- Auto-update updated_at trigger
DROP TRIGGER IF EXISTS set_timeline_events_updated_at ON timeline_events;
CREATE TRIGGER set_timeline_events_updated_at
  BEFORE UPDATE ON timeline_events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "Anyone can view active timeline events" ON timeline_events;
DROP POLICY IF EXISTS "Admins can manage timeline events" ON timeline_events;
DROP POLICY IF EXISTS "Public can view active timeline events" ON timeline_events;
DROP POLICY IF EXISTS "Admins can view all timeline events" ON timeline_events;
DROP POLICY IF EXISTS "Admins can insert timeline events" ON timeline_events;
DROP POLICY IF EXISTS "Admins can update timeline events" ON timeline_events;
DROP POLICY IF EXISTS "Admins can delete timeline events" ON timeline_events;

-- Create new policies with proper separation

-- 1. Public SELECT: Anyone can view ACTIVE timeline events
CREATE POLICY "Public can view active timeline events"
  ON timeline_events
  FOR SELECT
  USING (is_active = true);

-- 2. Admin SELECT: Admins can view ALL timeline events (including inactive)
CREATE POLICY "Admins can view all timeline events"
  ON timeline_events
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_emails
      WHERE email = auth.jwt()->>'email'
    )
  );

-- 3. Admin INSERT: Admins can create timeline events
CREATE POLICY "Admins can insert timeline events"
  ON timeline_events
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_emails
      WHERE email = auth.jwt()->>'email'
    )
  );

-- 4. Admin UPDATE: Admins can update timeline events
CREATE POLICY "Admins can update timeline events"
  ON timeline_events
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admin_emails
      WHERE email = auth.jwt()->>'email'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_emails
      WHERE email = auth.jwt()->>'email'
    )
  );

-- 5. Admin DELETE: Admins can delete timeline events
CREATE POLICY "Admins can delete timeline events"
  ON timeline_events
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM admin_emails
      WHERE email = auth.jwt()->>'email'
    )
  );

-- Seed data only if table is empty
INSERT INTO timeline_events (title, subtitle, description, month, month_short, day, location, media_type, media_url, gradient_colors, accent_color, category, highlights, display_order)
SELECT * FROM (VALUES
(
  'Mashramani',
  'Republic Day Celebrations',
  'The ultimate expression of Guyanese culture! Vibrant costumes, pulsating music, and the famous float parade transform the streets into a kaleidoscope of color and rhythm.',
  'February',
  'FEB',
  '23',
  'Georgetown & Nationwide',
  'image',
  'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1600&q=90',
  'from-orange-500 via-pink-500 to-purple-600',
  'orange',
  'Cultural Festival',
  ARRAY['Float Parade', 'Costume Bands', 'Steel Pan', 'Calypso'],
  1
),
(
  'Phagwah (Holi)',
  'Festival of Colors',
  'Experience the joyous Hindu spring festival where streets erupt in clouds of vibrant colored powder. Music, dancing, and the triumph of good over evil.',
  'March',
  'MAR',
  '25',
  'Nationwide',
  'image',
  'https://images.unsplash.com/photo-1576983844349-f95c28c0cd51?w=1600&q=90',
  'from-pink-500 via-purple-500 to-indigo-500',
  'pink',
  'Religious Festival',
  ARRAY['Color Throwing', 'Chowtal Singing', 'Traditional Sweets', 'Spring Celebration'],
  2
),
(
  'Rupununi Rodeo',
  'Wild West of Guyana',
  'In the vast savannahs of the Rupununi, skilled vaqueros showcase horsemanship at this legendary rodeo. Cowboys, cattle, and the spirit of the frontier.',
  'March',
  'MAR',
  '15-16',
  'Lethem, Region 9',
  'image',
  'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=1600&q=90',
  'from-amber-600 via-yellow-600 to-lime-500',
  'lime',
  'Sports & Recreation',
  ARRAY['Bull Riding', 'Horse Racing', 'Lasso Competitions', 'Ranch Culture'],
  3
),
(
  'Easter Regatta',
  'Bartica Sailing Festival',
  'The riverside town of Bartica comes alive with boat races, water sports, and festivities. A beloved Guyanese tradition drawing thousands to the waterfront.',
  'April',
  'APR',
  '20',
  'Bartica, Region 7',
  'image',
  'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1600&q=90',
  'from-cyan-500 via-blue-500 to-indigo-600',
  'cyan',
  'Sports & Recreation',
  ARRAY['Boat Racing', 'Swimming Competitions', 'Live Music', 'River Festival'],
  4
),
(
  'Arrival Day',
  'Celebrating Heritage',
  'Commemorating the arrival of indentured workers from India, this day honors the contributions of the Indian diaspora to Guyana''s rich multicultural tapestry.',
  'May',
  'MAY',
  '5',
  'Nationwide',
  'image',
  'https://images.unsplash.com/photo-1606567595334-d39972c85dfd?w=1600&q=90',
  'from-amber-500 via-orange-500 to-red-500',
  'amber',
  'National Holiday',
  ARRAY['Cultural Programs', 'Traditional Food', 'Heritage Sites', 'Community Gatherings'],
  5
),
(
  'Amerindian Heritage Month',
  'Indigenous Celebrations',
  'A month-long celebration of Guyana''s nine indigenous nations. Traditional crafts, ancestral foods, storytelling, and sacred ceremonies connect past with present.',
  'September',
  'SEP',
  '1-30',
  'Indigenous Communities',
  'image',
  'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&q=90',
  'from-emerald-500 via-teal-500 to-cyan-500',
  'emerald',
  'Cultural Heritage',
  ARRAY['Heritage Village', 'Traditional Crafts', 'Cassava Bread Making', 'Indigenous Games'],
  6
),
(
  'Diwali',
  'Festival of Lights',
  'As darkness falls, thousands of diyas (oil lamps) illuminate homes and streets. The Hindu festival of lights creates a magical atmosphere across the country.',
  'November',
  'NOV',
  '12',
  'Nationwide',
  'image',
  'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=1600&q=90',
  'from-yellow-400 via-amber-500 to-orange-600',
  'yellow',
  'Religious Festival',
  ARRAY['Diya Lighting', 'Fireworks', 'Sweets & Delicacies', 'Lakshmi Puja'],
  7
),
(
  'Christmas Season',
  'Tropical Holiday Magic',
  'Guyanese Christmas is unique! Garlic pork, pepperpot, and black cake. Masquerade bands dance through streets while families gather for traditional celebrations.',
  'December',
  'DEC',
  '25',
  'Nationwide',
  'image',
  'https://images.unsplash.com/photo-1482517967863-00e15c9b44be?w=1600&q=90',
  'from-red-500 via-rose-500 to-pink-500',
  'red',
  'National Holiday',
  ARRAY['Masquerade Dancing', 'Pepperpot', 'Carol Singing', 'Family Gatherings'],
  8
)
) AS seed_data(title, subtitle, description, month, month_short, day, location, media_type, media_url, gradient_colors, accent_color, category, highlights, display_order)
WHERE NOT EXISTS (SELECT 1 FROM timeline_events LIMIT 1);

-- Create storage bucket for timeline photos if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('timeline-photos', 'timeline-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for timeline photos (drop if exist first)
DROP POLICY IF EXISTS "Anyone can view timeline photos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload timeline photos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update timeline photos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete timeline photos" ON storage.objects;

-- Allow public read access to timeline photos
CREATE POLICY "Anyone can view timeline photos"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'timeline-photos');

-- Allow admins to upload timeline photos
CREATE POLICY "Admins can upload timeline photos"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'timeline-photos'
    AND EXISTS (
      SELECT 1 FROM admin_emails
      WHERE email = auth.jwt()->>'email'
    )
  );

-- Allow admins to update timeline photos
CREATE POLICY "Admins can update timeline photos"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'timeline-photos'
    AND EXISTS (
      SELECT 1 FROM admin_emails
      WHERE email = auth.jwt()->>'email'
    )
  );

-- Allow admins to delete timeline photos
CREATE POLICY "Admins can delete timeline photos"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'timeline-photos'
    AND EXISTS (
      SELECT 1 FROM admin_emails
      WHERE email = auth.jwt()->>'email'
    )
  );
