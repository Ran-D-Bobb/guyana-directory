-- Add is_active column to businesses table for hide/show functionality
-- Default TRUE so all existing businesses remain visible
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE NOT NULL;

-- Add index for filtering active businesses
CREATE INDEX IF NOT EXISTS idx_businesses_is_active ON businesses(is_active);

-- Update the public SELECT policy to hide inactive businesses from non-admins
-- Admins can still see all businesses (active and hidden)
DROP POLICY IF EXISTS "Businesses are viewable by everyone" ON businesses;

CREATE POLICY "Businesses are viewable by everyone" ON businesses
  FOR SELECT USING (
    is_active = true OR is_admin()
  );
