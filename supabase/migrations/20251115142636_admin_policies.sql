-- Function to check if current user is an admin
-- This checks against a custom claim that will be set via Supabase Auth
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if user has admin role in their JWT claims
  -- In production, set this via Supabase Auth custom claims
  RETURN COALESCE(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    false
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing policies for businesses
DROP POLICY IF EXISTS "Business owners can update their own business" ON businesses;
DROP POLICY IF EXISTS "Authenticated users can create businesses" ON businesses;

-- Recreate policies with admin support

-- Allow business owners to update their business OR admins to update any business
CREATE POLICY "Business owners and admins can update businesses" ON businesses
  FOR UPDATE USING (
    auth.uid() = owner_id OR is_admin()
  );

-- Allow authenticated users to create businesses with themselves as owner OR admins to create with any/no owner
CREATE POLICY "Authenticated users and admins can create businesses" ON businesses
  FOR INSERT WITH CHECK (
    (auth.uid() = owner_id AND auth.uid() IS NOT NULL) OR is_admin()
  );

-- Allow admins to delete businesses
CREATE POLICY "Admins can delete businesses" ON businesses
  FOR DELETE USING (is_admin());

-- Update storage policies to allow admins

-- Drop existing storage policies for business-photos bucket
DROP POLICY IF EXISTS "Business owners can upload photos" ON storage.objects;
DROP POLICY IF EXISTS "Business owners can update their photos" ON storage.objects;
DROP POLICY IF EXISTS "Business owners can delete their photos" ON storage.objects;

-- Recreate storage policies with admin support

-- Allow business owners and admins to upload photos
CREATE POLICY "Business owners and admins can upload photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'business-photos' AND (
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM businesses WHERE owner_id = auth.uid()
    ) OR is_admin()
  )
);

-- Allow business owners and admins to update photos
CREATE POLICY "Business owners and admins can update photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'business-photos' AND (
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM businesses WHERE owner_id = auth.uid()
    ) OR is_admin()
  )
);

-- Allow business owners and admins to delete photos
CREATE POLICY "Business owners and admins can delete photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'business-photos' AND (
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM businesses WHERE owner_id = auth.uid()
    ) OR is_admin()
  )
);
