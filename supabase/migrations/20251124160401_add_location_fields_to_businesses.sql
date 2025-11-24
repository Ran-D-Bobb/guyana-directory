-- Add location fields to businesses table
ALTER TABLE businesses
ADD COLUMN latitude DECIMAL(10, 8),
ADD COLUMN longitude DECIMAL(11, 8),
ADD COLUMN formatted_address TEXT;

-- Add index for geospatial queries (optional but recommended for future features)
CREATE INDEX idx_businesses_location ON businesses(latitude, longitude);

-- Add comment for clarity
COMMENT ON COLUMN businesses.latitude IS 'Latitude coordinate for business location';
COMMENT ON COLUMN businesses.longitude IS 'Longitude coordinate for business location';
COMMENT ON COLUMN businesses.formatted_address IS 'Full formatted address from geocoding service';
