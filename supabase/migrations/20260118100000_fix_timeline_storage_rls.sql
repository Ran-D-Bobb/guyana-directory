-- Fix Timeline Storage RLS Policies
-- The issue: storage policies use admin_emails table but is_admin() only checks app_metadata
-- Solution: Update is_admin() to check BOTH methods, then use is_admin() for storage policies

-- Update is_admin() function to check BOTH app_metadata role AND admin_emails table
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if user has admin role via app_metadata OR is in admin_emails table
  RETURN COALESCE(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    false
  ) OR EXISTS (
    SELECT 1 FROM admin_emails
    WHERE email = auth.jwt()->>'email'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure timeline-photos bucket exists with proper settings
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'timeline-photos',
  'timeline-photos',
  true,
  52428800, -- 50MB limit for videos
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime'];

-- Drop ALL existing timeline storage policies to start fresh
DROP POLICY IF EXISTS "Anyone can view timeline photos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload timeline photos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update timeline photos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete timeline photos" ON storage.objects;
DROP POLICY IF EXISTS "Public can view timeline photos" ON storage.objects;

-- Create storage policies using is_admin() function for consistency

-- Allow anyone to view timeline photos (public bucket)
CREATE POLICY "Anyone can view timeline photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'timeline-photos');

-- Allow admins to upload timeline photos
CREATE POLICY "Admins can upload timeline photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'timeline-photos' AND is_admin()
);

-- Allow admins to update timeline photos
CREATE POLICY "Admins can update timeline photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'timeline-photos' AND is_admin()
);

-- Allow admins to delete timeline photos
CREATE POLICY "Admins can delete timeline photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'timeline-photos' AND is_admin()
);
