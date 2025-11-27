-- Fix missing SELECT policy for rental_photos
-- The original SELECT policy was lost when the 20251121143055 migration dropped policies
-- This ensures anyone can view photos for approved rentals

-- Drop the policy if it exists (to avoid errors on re-run)
DROP POLICY IF EXISTS "Anyone can view rental photos for approved rentals" ON rental_photos;

-- Re-create the SELECT policy - anyone can view photos for approved rentals
CREATE POLICY "Anyone can view rental photos for approved rentals"
  ON rental_photos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM rentals
      WHERE rentals.id = rental_photos.rental_id
      AND (rentals.is_approved = true OR rentals.landlord_id = auth.uid() OR is_admin())
    )
  );
