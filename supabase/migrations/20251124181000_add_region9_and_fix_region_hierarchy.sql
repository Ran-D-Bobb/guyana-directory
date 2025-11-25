-- Add Region 9 (Upper Takutu-Upper Essequibo) - missing from initial seed
INSERT INTO regions (name, slug, type) VALUES
  ('Upper Takutu-Upper Essequibo', 'upper-takutu-upper-essequibo', 'region')
ON CONFLICT (slug) DO NOTHING;

-- Add other missing regions
INSERT INTO regions (name, slug, type) VALUES
  ('Pomeroon-Supenaam', 'pomeroon-supenaam', 'region'),
  ('Cuyuni-Mazaruni', 'cuyuni-mazaruni', 'region'),
  ('Potaro-Siparuni', 'potaro-siparuni', 'region'),
  ('Barima-Waini', 'barima-waini', 'region')
ON CONFLICT (slug) DO NOTHING;

-- Add parent_region_id column to regions table for hierarchy
-- This allows Georgetown to be linked to Demerara-Mahaica
ALTER TABLE regions ADD COLUMN IF NOT EXISTS parent_region_id UUID REFERENCES regions(id);

-- Create index for parent region lookups
CREATE INDEX IF NOT EXISTS idx_regions_parent ON regions(parent_region_id);

-- Link Georgetown to Demerara-Mahaica (Region 4)
DO $$
DECLARE
  demerara_mahaica_id UUID;
BEGIN
  SELECT id INTO demerara_mahaica_id FROM regions WHERE slug = 'demerara-mahaica' LIMIT 1;

  IF demerara_mahaica_id IS NOT NULL THEN
    UPDATE regions
    SET parent_region_id = demerara_mahaica_id
    WHERE slug = 'georgetown';
  END IF;
END $$;

-- Create a function to get all region IDs including child regions (for search)
CREATE OR REPLACE FUNCTION get_region_with_children(region_id UUID)
RETURNS TABLE (id UUID) AS $$
BEGIN
  RETURN QUERY
  SELECT r.id FROM regions r WHERE r.id = region_id
  UNION
  SELECT r.id FROM regions r WHERE r.parent_region_id = region_id;
END;
$$ LANGUAGE plpgsql;
