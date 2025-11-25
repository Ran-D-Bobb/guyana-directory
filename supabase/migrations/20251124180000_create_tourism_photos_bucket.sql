-- Create storage bucket for tourism photos (fixes "bucket not found" error)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'tourism-photos',
  'tourism-photos',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for tourism photos
-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Public tourism photos are viewable by everyone" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload tourism photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own tourism photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own tourism photos" ON storage.objects;

-- Allow anyone to view tourism photos (public bucket)
CREATE POLICY "Public tourism photos are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'tourism-photos');

-- Allow authenticated users to upload tourism photos
CREATE POLICY "Authenticated users can upload tourism photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'tourism-photos' AND
  auth.uid() IS NOT NULL
);

-- Allow users to update their own tourism photos
CREATE POLICY "Users can update their own tourism photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'tourism-photos' AND
  (
    -- Check if user owns the experience
    (string_to_array(name, '/'))[1] IN (
      SELECT id::text FROM tourism_experiences WHERE operator_id = auth.uid()
    )
    OR is_admin()
  )
);

-- Allow users to delete their own tourism photos
CREATE POLICY "Users can delete their own tourism photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'tourism-photos' AND
  (
    -- Check if user owns the experience
    (string_to_array(name, '/'))[1] IN (
      SELECT id::text FROM tourism_experiences WHERE operator_id = auth.uid()
    )
    OR is_admin()
  )
);
