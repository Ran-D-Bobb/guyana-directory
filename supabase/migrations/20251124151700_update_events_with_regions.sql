-- Update existing events with region_id based on their location
-- This migration assigns Georgetown region to all existing events as they're all in Georgetown

DO $$
DECLARE
  georgetown_region_id UUID;
BEGIN
  -- Get Georgetown region ID
  SELECT id INTO georgetown_region_id FROM regions WHERE name = 'Georgetown' LIMIT 1;

  -- Update all events that don't have a region_id to Georgetown
  IF georgetown_region_id IS NOT NULL THEN
    UPDATE events
    SET region_id = georgetown_region_id
    WHERE region_id IS NULL;
  END IF;
END $$;
