-- Temporarily simplify storage policy to debug authentication issue
-- This will help us understand if auth.uid() is working

-- Drop the existing policy
DROP POLICY IF EXISTS "Landlords can upload rental photos" ON storage.objects;

-- Create a simpler policy that just checks authentication
CREATE POLICY "Landlords can upload rental photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'rental-photos'
  AND auth.uid() IS NOT NULL
);

-- We'll add back the rental ownership check once we confirm auth works
