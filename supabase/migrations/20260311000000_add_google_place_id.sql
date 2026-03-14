-- Add google_place_id and source columns to businesses table for Google Places API scraper
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS google_place_id TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual';

-- Unique index on google_place_id for deduplication (only non-null values)
CREATE UNIQUE INDEX IF NOT EXISTS idx_businesses_google_place_id
  ON businesses (google_place_id) WHERE google_place_id IS NOT NULL;

-- Index on source for filtering
CREATE INDEX IF NOT EXISTS idx_businesses_source ON businesses (source);
