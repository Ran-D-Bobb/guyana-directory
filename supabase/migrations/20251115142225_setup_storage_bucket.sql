-- Create storage bucket for business photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'business-photos',
  'business-photos',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for business photos

-- Allow anyone to view photos (public bucket)
CREATE POLICY "Public photos are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'business-photos');

-- Allow business owners to upload photos
CREATE POLICY "Business owners can upload photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'business-photos' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM businesses WHERE owner_id = auth.uid()
  )
);

-- Allow business owners to update their photos
CREATE POLICY "Business owners can update their photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'business-photos' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM businesses WHERE owner_id = auth.uid()
  )
);

-- Allow business owners to delete their photos
CREATE POLICY "Business owners can delete their photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'business-photos' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM businesses WHERE owner_id = auth.uid()
  )
);
