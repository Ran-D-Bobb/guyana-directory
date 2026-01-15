-- Migration: Add coordinates for Discover feature
-- Enables location-based discovery across all experience types

-- ============================================
-- 1. ADD COORDINATES TO RENTALS
-- ============================================
ALTER TABLE rentals
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

-- Create index for efficient distance queries
CREATE INDEX IF NOT EXISTS idx_rentals_coords
ON rentals(latitude, longitude)
WHERE latitude IS NOT NULL;

COMMENT ON COLUMN rentals.latitude IS 'Latitude coordinate for rental property location';
COMMENT ON COLUMN rentals.longitude IS 'Longitude coordinate for rental property location';

-- ============================================
-- 2. ADD COORDINATES TO EVENTS
-- ============================================
ALTER TABLE events
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

-- Create index for efficient distance queries
CREATE INDEX IF NOT EXISTS idx_events_coords
ON events(latitude, longitude)
WHERE latitude IS NOT NULL;

COMMENT ON COLUMN events.latitude IS 'Latitude coordinate for event location';
COMMENT ON COLUMN events.longitude IS 'Longitude coordinate for event location';

-- ============================================
-- 3. ADD COORDINATES TO REGIONS (Fallback)
-- ============================================
ALTER TABLE regions
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

COMMENT ON COLUMN regions.latitude IS 'Approximate center latitude for region';
COMMENT ON COLUMN regions.longitude IS 'Approximate center longitude for region';

-- ============================================
-- 4. SEED REGION COORDINATES
-- Approximate center points for Guyana regions
-- ============================================

-- Cities
UPDATE regions SET latitude = 6.8013, longitude = -58.1551 WHERE slug = 'georgetown';
UPDATE regions SET latitude = 6.2426, longitude = -57.5120 WHERE slug = 'new-amsterdam';
UPDATE regions SET latitude = 6.0019, longitude = -58.3039 WHERE slug = 'linden';

-- Towns
UPDATE regions SET latitude = 7.2622, longitude = -58.4933 WHERE slug = 'anna-regina';
UPDATE regions SET latitude = 6.4030, longitude = -58.6219 WHERE slug = 'bartica';

-- Administrative Regions
UPDATE regions SET latitude = 6.7500, longitude = -58.1000 WHERE slug = 'demerara-mahaica';
UPDATE regions SET latitude = 5.8500, longitude = -57.3500 WHERE slug = 'east-berbice-corentyne';
UPDATE regions SET latitude = 5.5000, longitude = -58.0000 WHERE slug = 'upper-demerara-berbice';
UPDATE regions SET latitude = 6.8000, longitude = -58.4000 WHERE slug = 'essequibo-islands-west-demerara';
UPDATE regions SET latitude = 6.2500, longitude = -57.6500 WHERE slug = 'mahaica-berbice';
UPDATE regions SET latitude = 3.4000, longitude = -59.0000 WHERE slug = 'upper-takutu-upper-essequibo';
UPDATE regions SET latitude = 7.0000, longitude = -58.6000 WHERE slug = 'pomeroon-supenaam';
UPDATE regions SET latitude = 6.2000, longitude = -59.5000 WHERE slug = 'cuyuni-mazaruni';
UPDATE regions SET latitude = 4.9000, longitude = -59.3000 WHERE slug = 'potaro-siparuni';
UPDATE regions SET latitude = 7.5000, longitude = -59.8000 WHERE slug = 'barima-waini';

-- ============================================
-- 5. ADD LATITUDE/LONGITUDE TO TOURISM_EXPERIENCES
-- The POINT type exists but we need lat/lng columns for consistency
-- ============================================
ALTER TABLE tourism_experiences
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

CREATE INDEX IF NOT EXISTS idx_tourism_experiences_coords
ON tourism_experiences(latitude, longitude)
WHERE latitude IS NOT NULL;

COMMENT ON COLUMN tourism_experiences.latitude IS 'Latitude coordinate for experience location';
COMMENT ON COLUMN tourism_experiences.longitude IS 'Longitude coordinate for experience location';
