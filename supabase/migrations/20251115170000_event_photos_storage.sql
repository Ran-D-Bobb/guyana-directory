-- Create storage bucket for event images
INSERT INTO storage.buckets (id, name, public)
VALUES ('event-photos', 'event-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for event photos

-- Anyone can view event photos (bucket is public)
CREATE POLICY "Event photos are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'event-photos');

-- Authenticated users can upload event photos
CREATE POLICY "Authenticated users can upload event photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'event-photos' AND
  auth.uid() IS NOT NULL
);

-- Users can update their own event photos, admins can update all
CREATE POLICY "Users can update their own event photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'event-photos' AND
  auth.uid() IS NOT NULL AND
  (
    -- Check if user owns the event
    (storage.foldername(name))[1] IN (
      SELECT id::TEXT FROM public.events WHERE user_id = auth.uid()
    )
    OR is_admin()
  )
);

-- Users can delete their own event photos, admins can delete all
CREATE POLICY "Users can delete their own event photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'event-photos' AND
  auth.uid() IS NOT NULL AND
  (
    -- Check if user owns the event
    (storage.foldername(name))[1] IN (
      SELECT id::TEXT FROM public.events WHERE user_id = auth.uid()
    )
    OR is_admin()
  )
);
