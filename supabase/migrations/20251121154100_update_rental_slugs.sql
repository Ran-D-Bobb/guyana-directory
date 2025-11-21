-- Update existing rental slugs to use shorter format
-- This fixes any rentals created with timestamp-based slugs

-- Function to generate clean slug from name
CREATE OR REPLACE FUNCTION generate_clean_rental_slug(rental_name TEXT)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  random_suffix TEXT;
  new_slug TEXT;
  slug_exists BOOLEAN;
BEGIN
  -- Create base slug from name
  base_slug := lower(rental_name);
  base_slug := regexp_replace(base_slug, '[^a-z0-9]+', '-', 'g');
  base_slug := regexp_replace(base_slug, '^-|-$', '', 'g');

  -- Generate random suffix
  random_suffix := substr(md5(random()::text), 1, 6);
  new_slug := base_slug || '-' || random_suffix;

  -- Check if slug exists and regenerate if needed
  SELECT EXISTS(SELECT 1 FROM rentals WHERE slug = new_slug) INTO slug_exists;

  WHILE slug_exists LOOP
    random_suffix := substr(md5(random()::text), 1, 6);
    new_slug := base_slug || '-' || random_suffix;
    SELECT EXISTS(SELECT 1 FROM rentals WHERE slug = new_slug) INTO slug_exists;
  END LOOP;

  RETURN new_slug;
END;
$$ LANGUAGE plpgsql;

-- Update all rentals that have timestamp-based slugs (contain 13 digit numbers)
UPDATE rentals
SET slug = generate_clean_rental_slug(name)
WHERE slug ~ '-[0-9]{13,}$';

-- Drop the helper function
DROP FUNCTION generate_clean_rental_slug(TEXT);
