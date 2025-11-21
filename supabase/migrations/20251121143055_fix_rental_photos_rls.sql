-- Fix RLS policy for rental_photos to allow INSERT operations
-- The issue: USING clause doesn't work for INSERT, need WITH CHECK instead

-- Drop the old policy
DROP POLICY IF EXISTS "Landlords can manage own rental photos" ON rental_photos;

-- Create separate policies for better clarity
-- INSERT: Landlords can add photos to their own rentals
CREATE POLICY "Landlords can insert photos to own rentals"
  ON rental_photos FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM rentals
      WHERE rentals.id = rental_photos.rental_id
      AND rentals.landlord_id = auth.uid()
    )
  );

-- UPDATE: Landlords can update photos on their own rentals
CREATE POLICY "Landlords can update own rental photos"
  ON rental_photos FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM rentals
      WHERE rentals.id = rental_photos.rental_id
      AND (rentals.landlord_id = auth.uid() OR is_admin())
    )
  );

-- DELETE: Landlords can delete photos from their own rentals
CREATE POLICY "Landlords can delete own rental photos"
  ON rental_photos FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM rentals
      WHERE rentals.id = rental_photos.rental_id
      AND (rentals.landlord_id = auth.uid() OR is_admin())
    )
  );

-- Admins can manage all rental photos
CREATE POLICY "Admins can manage all rental photos"
  ON rental_photos FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());
