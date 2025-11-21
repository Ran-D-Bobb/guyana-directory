-- Create storage bucket for rental photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'rental-photos',
  'rental-photos',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for rental photos bucket

-- Allow anyone to view rental photos (public bucket)
CREATE POLICY "Anyone can view rental photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'rental-photos');

-- Landlords can upload photos to their own rental listings
CREATE POLICY "Landlords can upload rental photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'rental-photos'
  AND (
    -- Check if user owns the rental (extract rental_id from path)
    -- Path format: {rental_id}/{filename}
    EXISTS (
      SELECT 1 FROM rentals
      WHERE rentals.landlord_id = auth.uid()
      AND rentals.id::text = (string_to_array(name, '/'))[1]
    )
    OR is_admin()
  )
);

-- Landlords can update photos for their own rentals
CREATE POLICY "Landlords can update own rental photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'rental-photos'
  AND (
    EXISTS (
      SELECT 1 FROM rentals
      WHERE rentals.landlord_id = auth.uid()
      AND rentals.id::text = (string_to_array(name, '/'))[1]
    )
    OR is_admin()
  )
);

-- Landlords can delete photos from their own rentals
CREATE POLICY "Landlords can delete own rental photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'rental-photos'
  AND (
    EXISTS (
      SELECT 1 FROM rentals
      WHERE rentals.landlord_id = auth.uid()
      AND rentals.id::text = (string_to_array(name, '/'))[1]
    )
    OR is_admin()
  )
);

-- Storage policies for rental review photos (separate bucket)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'rental-review-photos',
  'rental-review-photos',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Anyone can view review photos
CREATE POLICY "Anyone can view rental review photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'rental-review-photos');

-- Review authors can upload review photos
CREATE POLICY "Review authors can upload review photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'rental-review-photos'
  AND auth.uid() IS NOT NULL
);

-- Review authors can delete their own review photos
CREATE POLICY "Review authors can delete own review photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'rental-review-photos'
  AND auth.uid() IS NOT NULL
  AND (
    -- Check if user owns the review (extract review_id from path)
    EXISTS (
      SELECT 1 FROM rental_reviews
      WHERE rental_reviews.user_id = auth.uid()
      AND rental_reviews.id::text = split_part(name, '/', 1)
    )
    OR is_admin()
  )
);
