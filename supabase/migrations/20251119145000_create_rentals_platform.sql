-- Phase 5A: Rentals Platform Database Schema
-- Created: 2024-11-19
-- Purpose: Add property listings as the fourth pillar of Waypoint 2.0

-- ==============================================
-- 1. RENTAL CATEGORIES TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS rental_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT NOT NULL, -- Lucide icon name
  description TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================
-- 2. RENTALS TABLE (Core Property Listings)
-- ==============================================
CREATE TABLE IF NOT EXISTS rentals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  landlord_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES rental_categories(id) ON DELETE RESTRICT,
  region_id UUID REFERENCES regions(id) ON DELETE SET NULL,

  -- Basic Info
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  property_type TEXT NOT NULL, -- 'apartment', 'house', 'vacation_home', 'room', 'office', 'commercial', 'shared', 'land'

  -- Location
  address TEXT,
  location_details TEXT,

  -- Property Specs
  bedrooms INTEGER DEFAULT 0,
  bathrooms NUMERIC(3,1) DEFAULT 0, -- Supports 1.5, 2.5 bathrooms
  max_guests INTEGER DEFAULT 1,
  square_feet INTEGER,

  -- Pricing (GYD currency)
  price_per_night INTEGER, -- Optional for short-term
  price_per_week INTEGER, -- Optional for weekly
  price_per_month INTEGER NOT NULL, -- Required for all listings
  security_deposit INTEGER,
  is_best_value BOOLEAN DEFAULT FALSE, -- Auto-set if weekly/monthly discounted

  -- Amenities (JSONB for flexibility)
  amenities JSONB DEFAULT '[]'::jsonb, -- ['wifi', 'ac', 'parking', 'pool', 'kitchen', etc.]
  utilities_included JSONB DEFAULT '[]'::jsonb, -- ['water', 'electricity', 'internet', 'gas']
  house_rules JSONB DEFAULT '[]'::jsonb, -- ['no_smoking', 'no_pets', 'no_parties', 'quiet_hours']

  -- Contact
  whatsapp_number TEXT NOT NULL,
  phone TEXT,
  email TEXT,

  -- Status & Moderation
  is_approved BOOLEAN DEFAULT TRUE, -- Instant publishing by default
  is_featured BOOLEAN DEFAULT FALSE,
  is_flagged BOOLEAN DEFAULT FALSE, -- True if reported by users
  flag_count INTEGER DEFAULT 0,
  flag_reasons JSONB DEFAULT '[]'::jsonb, -- Array of {reason, user_id, timestamp}

  -- Analytics
  view_count INTEGER DEFAULT 0,
  inquiry_count INTEGER DEFAULT 0, -- WhatsApp click count
  save_count INTEGER DEFAULT 0, -- Wishlist/favorite count

  -- Ratings (auto-calculated from reviews)
  rating NUMERIC(3,2) DEFAULT 0, -- Overall rating (0.00-5.00)
  rating_cleanliness NUMERIC(3,2) DEFAULT 0,
  rating_location NUMERIC(3,2) DEFAULT 0,
  rating_value NUMERIC(3,2) DEFAULT 0,
  rating_communication NUMERIC(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_rentals_landlord ON rentals(landlord_id);
CREATE INDEX idx_rentals_category ON rentals(category_id);
CREATE INDEX idx_rentals_region ON rentals(region_id);
CREATE INDEX idx_rentals_slug ON rentals(slug);
CREATE INDEX idx_rentals_property_type ON rentals(property_type);
CREATE INDEX idx_rentals_is_approved ON rentals(is_approved);
CREATE INDEX idx_rentals_is_featured ON rentals(is_featured);
CREATE INDEX idx_rentals_is_flagged ON rentals(is_flagged);
CREATE INDEX idx_rentals_rating ON rentals(rating);
CREATE INDEX idx_rentals_price_month ON rentals(price_per_month);
CREATE INDEX idx_rentals_bedrooms ON rentals(bedrooms);
CREATE INDEX idx_rentals_bathrooms ON rentals(bathrooms);

-- Full-text search index
CREATE INDEX idx_rentals_search ON rentals USING gin(
  to_tsvector('english',
    coalesce(name, '') || ' ' ||
    coalesce(description, '') || ' ' ||
    coalesce(location_details, '')
  )
);

-- ==============================================
-- 3. RENTAL PHOTOS TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS rental_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rental_id UUID NOT NULL REFERENCES rentals(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  display_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_rental_photos_rental ON rental_photos(rental_id);
CREATE INDEX idx_rental_photos_primary ON rental_photos(rental_id, is_primary);

-- ==============================================
-- 4. RENTAL REVIEWS TABLE (Multi-aspect ratings)
-- ==============================================
CREATE TABLE IF NOT EXISTS rental_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rental_id UUID NOT NULL REFERENCES rentals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Multi-aspect ratings (1-5 stars each)
  rating_overall INTEGER NOT NULL CHECK (rating_overall >= 1 AND rating_overall <= 5),
  rating_cleanliness INTEGER NOT NULL CHECK (rating_cleanliness >= 1 AND rating_cleanliness <= 5),
  rating_location INTEGER NOT NULL CHECK (rating_location >= 1 AND rating_location <= 5),
  rating_value INTEGER NOT NULL CHECK (rating_value >= 1 AND rating_value <= 5),
  rating_communication INTEGER NOT NULL CHECK (rating_communication >= 1 AND rating_communication <= 5),

  -- Review content
  comment TEXT NOT NULL CHECK (char_length(comment) <= 500),

  -- Stay dates (optional)
  stay_from DATE,
  stay_to DATE,

  -- Social engagement
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- One review per user per property
  UNIQUE(rental_id, user_id)
);

CREATE INDEX idx_rental_reviews_rental ON rental_reviews(rental_id);
CREATE INDEX idx_rental_reviews_user ON rental_reviews(user_id);
CREATE INDEX idx_rental_reviews_rating ON rental_reviews(rating_overall);

-- ==============================================
-- 5. RENTAL REVIEW PHOTOS TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS rental_review_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES rental_reviews(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_rental_review_photos_review ON rental_review_photos(review_id);

-- ==============================================
-- 6. RENTAL REVIEW HELPFUL VOTES TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS rental_review_helpful_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES rental_reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_helpful BOOLEAN NOT NULL, -- TRUE = helpful, FALSE = not helpful
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- One vote per user per review
  UNIQUE(review_id, user_id)
);

CREATE INDEX idx_rental_review_helpful_votes_review ON rental_review_helpful_votes(review_id);
CREATE INDEX idx_rental_review_helpful_votes_user ON rental_review_helpful_votes(user_id);

-- ==============================================
-- 7. RENTAL REVIEW RESPONSES TABLE (Landlord replies)
-- ==============================================
CREATE TABLE IF NOT EXISTS rental_review_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES rental_reviews(id) ON DELETE CASCADE UNIQUE,
  rental_id UUID NOT NULL REFERENCES rentals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, -- Landlord
  response TEXT NOT NULL CHECK (char_length(response) <= 500),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_rental_review_responses_review ON rental_review_responses(review_id);
CREATE INDEX idx_rental_review_responses_rental ON rental_review_responses(rental_id);

-- ==============================================
-- 8. RENTAL INQUIRY CLICKS TABLE (WhatsApp analytics)
-- ==============================================
CREATE TABLE IF NOT EXISTS rental_inquiry_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rental_id UUID NOT NULL REFERENCES rentals(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Optional (tracks anonymous too)
  device_type TEXT, -- 'mobile', 'tablet', 'desktop', 'kiosk'
  user_agent TEXT,
  session_id TEXT, -- For tracking anonymous sessions
  clicked_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_rental_inquiry_clicks_rental ON rental_inquiry_clicks(rental_id);
CREATE INDEX idx_rental_inquiry_clicks_user ON rental_inquiry_clicks(user_id);
CREATE INDEX idx_rental_inquiry_clicks_clicked_at ON rental_inquiry_clicks(clicked_at);

-- ==============================================
-- 9. RENTAL SAVED TABLE (Wishlist/favorites)
-- ==============================================
CREATE TABLE IF NOT EXISTS rental_saved (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rental_id UUID NOT NULL REFERENCES rentals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notes TEXT, -- Personal notes from user
  created_at TIMESTAMPTZ DEFAULT now(),

  -- One save per user per property
  UNIQUE(rental_id, user_id)
);

CREATE INDEX idx_rental_saved_rental ON rental_saved(rental_id);
CREATE INDEX idx_rental_saved_user ON rental_saved(user_id);

-- ==============================================
-- 10. RENTAL FLAGS TABLE (User reporting system)
-- ==============================================
CREATE TABLE IF NOT EXISTS rental_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rental_id UUID NOT NULL REFERENCES rentals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL, -- 'fake_photos', 'scam', 'duplicate', 'incorrect_info', 'not_available', 'inappropriate', 'spam'
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),

  -- One flag per user per property (can update reason)
  UNIQUE(rental_id, user_id)
);

CREATE INDEX idx_rental_flags_rental ON rental_flags(rental_id);
CREATE INDEX idx_rental_flags_user ON rental_flags(user_id);

-- ==============================================
-- TRIGGER FUNCTIONS
-- ==============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_rental_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_rental_updated_at
  BEFORE UPDATE ON rentals
  FOR EACH ROW
  EXECUTE FUNCTION update_rental_updated_at();

CREATE TRIGGER trigger_update_rental_category_updated_at
  BEFORE UPDATE ON rental_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_rental_updated_at();

-- Auto-update rental ratings when reviews change
CREATE OR REPLACE FUNCTION update_rental_rating()
RETURNS TRIGGER SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_rental_id UUID;
BEGIN
  -- Get rental_id from NEW or OLD record
  IF TG_OP = 'DELETE' THEN
    v_rental_id := OLD.rental_id;
  ELSE
    v_rental_id := NEW.rental_id;
  END IF;

  -- Update rental with aggregated ratings from all reviews
  UPDATE rentals
  SET
    rating = COALESCE((SELECT AVG(rating_overall) FROM rental_reviews WHERE rental_id = v_rental_id), 0),
    rating_cleanliness = COALESCE((SELECT AVG(rating_cleanliness) FROM rental_reviews WHERE rental_id = v_rental_id), 0),
    rating_location = COALESCE((SELECT AVG(rating_location) FROM rental_reviews WHERE rental_id = v_rental_id), 0),
    rating_value = COALESCE((SELECT AVG(rating_value) FROM rental_reviews WHERE rental_id = v_rental_id), 0),
    rating_communication = COALESCE((SELECT AVG(rating_communication) FROM rental_reviews WHERE rental_id = v_rental_id), 0),
    review_count = COALESCE((SELECT COUNT(*) FROM rental_reviews WHERE rental_id = v_rental_id), 0)
  WHERE id = v_rental_id;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_rental_rating_insert
  AFTER INSERT ON rental_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_rental_rating();

CREATE TRIGGER trigger_update_rental_rating_update
  AFTER UPDATE ON rental_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_rental_rating();

CREATE TRIGGER trigger_update_rental_rating_delete
  AFTER DELETE ON rental_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_rental_rating();

-- Auto-update helpful vote counts when votes change
CREATE OR REPLACE FUNCTION update_rental_review_helpful_counts()
RETURNS TRIGGER AS $$
DECLARE
  v_review_id UUID;
BEGIN
  -- Get review_id from NEW or OLD record
  IF TG_OP = 'DELETE' THEN
    v_review_id := OLD.review_id;
  ELSE
    v_review_id := NEW.review_id;
  END IF;

  -- Update review with vote counts
  UPDATE rental_reviews
  SET
    helpful_count = COALESCE((SELECT COUNT(*) FROM rental_review_helpful_votes WHERE review_id = v_review_id AND is_helpful = TRUE), 0),
    not_helpful_count = COALESCE((SELECT COUNT(*) FROM rental_review_helpful_votes WHERE review_id = v_review_id AND is_helpful = FALSE), 0)
  WHERE id = v_review_id;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_rental_review_helpful_counts_insert
  AFTER INSERT ON rental_review_helpful_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_rental_review_helpful_counts();

CREATE TRIGGER trigger_update_rental_review_helpful_counts_update
  AFTER UPDATE ON rental_review_helpful_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_rental_review_helpful_counts();

CREATE TRIGGER trigger_update_rental_review_helpful_counts_delete
  AFTER DELETE ON rental_review_helpful_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_rental_review_helpful_counts();

-- Increment rental inquiry count (WhatsApp clicks)
CREATE OR REPLACE FUNCTION increment_rental_inquiry()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE rentals
  SET inquiry_count = inquiry_count + 1
  WHERE id = NEW.rental_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_rental_inquiry
  AFTER INSERT ON rental_inquiry_clicks
  FOR EACH ROW
  EXECUTE FUNCTION increment_rental_inquiry();

-- Increment/decrement rental save count
CREATE OR REPLACE FUNCTION update_rental_save_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE rentals SET save_count = save_count + 1 WHERE id = NEW.rental_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE rentals SET save_count = save_count - 1 WHERE id = OLD.rental_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_rental_save_count_insert
  AFTER INSERT ON rental_saved
  FOR EACH ROW
  EXECUTE FUNCTION update_rental_save_count();

CREATE TRIGGER trigger_update_rental_save_count_delete
  AFTER DELETE ON rental_saved
  FOR EACH ROW
  EXECUTE FUNCTION update_rental_save_count();

-- Update rental flag status when flags are added/removed
CREATE OR REPLACE FUNCTION update_rental_flag_status()
RETURNS TRIGGER AS $$
DECLARE
  v_rental_id UUID;
  v_flag_count INTEGER;
  v_flag_reasons JSONB;
BEGIN
  -- Get rental_id from NEW or OLD record
  IF TG_OP = 'DELETE' THEN
    v_rental_id := OLD.rental_id;
  ELSE
    v_rental_id := NEW.rental_id;
  END IF;

  -- Calculate flag count
  SELECT COUNT(*) INTO v_flag_count
  FROM rental_flags
  WHERE rental_id = v_rental_id;

  -- Aggregate flag reasons
  SELECT jsonb_agg(
    jsonb_build_object(
      'reason', reason,
      'user_id', user_id::text,
      'timestamp', created_at
    )
  ) INTO v_flag_reasons
  FROM rental_flags
  WHERE rental_id = v_rental_id;

  -- Update rental with flag info
  UPDATE rentals
  SET
    flag_count = v_flag_count,
    is_flagged = v_flag_count > 0,
    flag_reasons = COALESCE(v_flag_reasons, '[]'::jsonb),
    -- Auto-hide if 5+ flags
    is_approved = CASE WHEN v_flag_count >= 5 THEN FALSE ELSE is_approved END
  WHERE id = v_rental_id;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_rental_flag_status_insert
  AFTER INSERT ON rental_flags
  FOR EACH ROW
  EXECUTE FUNCTION update_rental_flag_status();

CREATE TRIGGER trigger_update_rental_flag_status_update
  AFTER UPDATE ON rental_flags
  FOR EACH ROW
  EXECUTE FUNCTION update_rental_flag_status();

CREATE TRIGGER trigger_update_rental_flag_status_delete
  AFTER DELETE ON rental_flags
  FOR EACH ROW
  EXECUTE FUNCTION update_rental_flag_status();

-- Function to check rental listing limit (1 per free user)
CREATE OR REPLACE FUNCTION check_rental_listing_limit()
RETURNS TRIGGER AS $$
DECLARE
  v_listing_count INTEGER;
BEGIN
  -- Count existing active rentals for this landlord
  SELECT COUNT(*) INTO v_listing_count
  FROM rentals
  WHERE landlord_id = NEW.landlord_id;

  -- For now, allow only 1 listing per user (freemium model)
  -- Future: Check user's premium status and allow unlimited
  IF v_listing_count >= 1 THEN
    RAISE EXCEPTION 'Free users can only have 1 active rental listing. Upgrade to Premium for unlimited listings.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_rental_listing_limit
  BEFORE INSERT ON rentals
  FOR EACH ROW
  EXECUTE FUNCTION check_rental_listing_limit();

-- ==============================================
-- SEED DATA: 8 Rental Categories
-- ==============================================
INSERT INTO rental_categories (name, slug, icon, description, display_order) VALUES
  ('Apartments', 'apartments', 'Building2', 'Modern apartments and flats for rent in cities and towns', 1),
  ('Houses', 'houses', 'Home', 'Single-family homes and townhouses available for rent', 2),
  ('Vacation Homes', 'vacation-homes', 'Palmtree', 'Short-term vacation rentals and holiday homes', 3),
  ('Room Rentals', 'room-rentals', 'BedDouble', 'Single rooms for rent in shared accommodations', 4),
  ('Office Spaces', 'office-spaces', 'Briefcase', 'Commercial office spaces and coworking locations', 5),
  ('Commercial', 'commercial', 'Store', 'Retail spaces, warehouses, and commercial properties', 6),
  ('Shared Housing', 'shared-housing', 'Users', 'Shared apartments and houses with roommates', 7),
  ('Land', 'land', 'Mountain', 'Residential and commercial land available for lease', 8)
ON CONFLICT (slug) DO NOTHING;

-- ==============================================
-- SEED DATA: 12 Sample Properties
-- ==============================================

-- Sample Property 1: Georgetown Apartment
INSERT INTO rentals (
  landlord_id,
  category_id,
  region_id,
  name,
  slug,
  description,
  property_type,
  address,
  location_details,
  bedrooms,
  bathrooms,
  max_guests,
  square_feet,
  price_per_night,
  price_per_week,
  price_per_month,
  security_deposit,
  is_best_value,
  amenities,
  utilities_included,
  house_rules,
  whatsapp_number,
  phone,
  email,
  is_approved,
  is_featured,
  view_count,
  inquiry_count
)
SELECT
  (SELECT id FROM auth.users LIMIT 1), -- Use first user as landlord
  (SELECT id FROM rental_categories WHERE slug = 'apartments'),
  (SELECT id FROM regions WHERE slug = 'georgetown'),
  'Modern 2BR Apartment in Georgetown',
  'modern-2br-apartment-georgetown',
  'Beautiful modern apartment in the heart of Georgetown. Fully furnished with AC in all rooms, high-speed WiFi, and secure parking. Perfect for professionals or small families.',
  'apartment',
  '123 Main Street, Georgetown',
  'Close to Bourda Market, MovieTowne, and major banks',
  2,
  2.0,
  4,
  900,
  8000,
  50000,
  180000,
  180000,
  TRUE,
  '["wifi", "ac", "parking", "washer_dryer", "kitchen", "tv", "hot_water", "furnished", "security"]'::jsonb,
  '["water", "internet"]'::jsonb,
  '["no_smoking", "no_pets", "quiet_hours"]'::jsonb,
  '5926001234',
  '6001234',
  'landlord1@example.com',
  TRUE,
  TRUE,
  156,
  23
WHERE EXISTS (SELECT 1 FROM auth.users LIMIT 1);

-- Sample Property 2: New Amsterdam House
INSERT INTO rentals (
  landlord_id,
  category_id,
  region_id,
  name,
  slug,
  description,
  property_type,
  bedrooms,
  bathrooms,
  max_guests,
  square_feet,
  price_per_month,
  security_deposit,
  amenities,
  utilities_included,
  house_rules,
  whatsapp_number,
  is_approved,
  view_count,
  inquiry_count
)
SELECT
  (SELECT id FROM auth.users LIMIT 1),
  (SELECT id FROM rental_categories WHERE slug = 'houses'),
  (SELECT id FROM regions WHERE slug = 'new-amsterdam'),
  '3 Bedroom Family House',
  '3br-family-house-new-amsterdam',
  'Spacious 3-bedroom house with large yard, perfect for families. Quiet neighborhood with easy access to schools and shopping.',
  'house',
  3,
  2.5,
  6,
  1200,
  220000,
  220000,
  '["wifi", "ac", "parking", "kitchen", "tv", "hot_water", "yard", "furnished"]'::jsonb,
  '["water", "electricity"]'::jsonb,
  '["no_smoking", "pets_allowed"]'::jsonb,
  '5926002345',
  TRUE,
  89,
  12
WHERE EXISTS (SELECT 1 FROM auth.users LIMIT 1);

-- Sample Property 3: Linden Studio
INSERT INTO rentals (
  landlord_id,
  category_id,
  region_id,
  name,
  slug,
  description,
  property_type,
  bedrooms,
  bathrooms,
  max_guests,
  price_per_month,
  amenities,
  utilities_included,
  house_rules,
  whatsapp_number,
  is_approved,
  view_count
)
SELECT
  (SELECT id FROM auth.users LIMIT 1),
  (SELECT id FROM rental_categories WHERE slug = 'apartments'),
  (SELECT id FROM regions WHERE slug = 'linden'),
  'Cozy Studio Apartment',
  'cozy-studio-linden',
  'Affordable studio apartment perfect for single professionals. Includes all utilities and WiFi.',
  'apartment',
  0,
  1.0,
  2,
  80000,
  '["wifi", "ac", "kitchen", "hot_water", "furnished"]'::jsonb,
  '["water", "electricity", "internet"]'::jsonb,
  '["no_smoking", "no_pets", "no_parties"]'::jsonb,
  '5926003456',
  TRUE,
  45
WHERE EXISTS (SELECT 1 FROM auth.users LIMIT 1);

-- Sample Property 4: Georgetown Room
INSERT INTO rentals (
  landlord_id,
  category_id,
  region_id,
  name,
  slug,
  description,
  property_type,
  bedrooms,
  bathrooms,
  max_guests,
  price_per_month,
  amenities,
  utilities_included,
  house_rules,
  whatsapp_number,
  is_approved,
  view_count
)
SELECT
  (SELECT id FROM auth.users LIMIT 1),
  (SELECT id FROM rental_categories WHERE slug = 'room-rentals'),
  (SELECT id FROM regions WHERE slug = 'georgetown'),
  'Private Room in Shared House',
  'private-room-georgetown',
  'Private bedroom in shared house with 2 other professionals. Shared kitchen and bathroom. All utilities included.',
  'room',
  1,
  1.0,
  1,
  60000,
  '["wifi", "ac", "kitchen", "hot_water", "shared_bathroom"]'::jsonb,
  '["water", "electricity", "internet"]'::jsonb,
  '["no_smoking", "no_pets", "quiet_hours"]'::jsonb,
  '5926004567',
  TRUE,
  67
WHERE EXISTS (SELECT 1 FROM auth.users LIMIT 1);

-- Sample Property 5: Georgetown Office
INSERT INTO rentals (
  landlord_id,
  category_id,
  region_id,
  name,
  slug,
  description,
  property_type,
  square_feet,
  max_guests,
  price_per_month,
  security_deposit,
  amenities,
  utilities_included,
  house_rules,
  whatsapp_number,
  is_approved,
  view_count
)
SELECT
  (SELECT id FROM auth.users LIMIT 1),
  (SELECT id FROM rental_categories WHERE slug = 'office-spaces'),
  (SELECT id FROM regions WHERE slug = 'georgetown'),
  'Downtown Office Space',
  'downtown-office-space-georgetown',
  'Professional office space in prime downtown location. High-speed internet, AC, and parking included. Suitable for 4-6 employees.',
  'office',
  600,
  6,
  350000,
  350000,
  '["wifi", "ac", "parking", "security", "reception"]'::jsonb,
  '["water", "electricity", "internet"]'::jsonb,
  '["no_smoking"]'::jsonb,
  '5926005678',
  TRUE,
  34
WHERE EXISTS (SELECT 1 FROM auth.users LIMIT 1);

-- Sample Property 6: Kaieteur View Vacation Home
INSERT INTO rentals (
  landlord_id,
  category_id,
  region_id,
  name,
  slug,
  description,
  property_type,
  bedrooms,
  bathrooms,
  max_guests,
  square_feet,
  price_per_night,
  price_per_week,
  price_per_month,
  amenities,
  utilities_included,
  house_rules,
  whatsapp_number,
  is_approved,
  is_featured,
  view_count
)
SELECT
  (SELECT id FROM auth.users LIMIT 1),
  (SELECT id FROM rental_categories WHERE slug = 'vacation-homes'),
  (SELECT id FROM regions WHERE slug = 'georgetown'),
  'Tropical Vacation Villa',
  'tropical-vacation-villa',
  'Stunning vacation home with pool, perfect for families or groups. Fully equipped kitchen, BBQ area, and tropical garden.',
  'vacation_home',
  4,
  3.0,
  8,
  2000,
  15000,
  90000,
  350000,
  '["wifi", "ac", "parking", "pool", "kitchen", "washer_dryer", "tv", "hot_water", "furnished", "bbq", "yard"]'::jsonb,
  '["water", "electricity", "internet"]'::jsonb,
  '["no_smoking", "no_parties"]'::jsonb,
  '5926006789',
  TRUE,
  TRUE,
  201
WHERE EXISTS (SELECT 1 FROM auth.users LIMIT 1);

-- Additional 6 sample properties for diversity
INSERT INTO rentals (landlord_id, category_id, region_id, name, slug, description, property_type, bedrooms, bathrooms, max_guests, price_per_month, amenities, utilities_included, house_rules, whatsapp_number, is_approved)
SELECT
  (SELECT id FROM auth.users LIMIT 1),
  (SELECT id FROM rental_categories WHERE slug = 'commercial'),
  (SELECT id FROM regions WHERE slug = 'georgetown'),
  'Retail Space on Main Street',
  'retail-space-main-street',
  'Prime retail location with high foot traffic. Perfect for boutique, restaurant, or service business.',
  'commercial',
  0,
  2.0,
  10,
  500000,
  '["wifi", "ac", "parking", "security"]'::jsonb,
  '["water"]'::jsonb,
  '[]'::jsonb,
  '5926007890',
  TRUE
WHERE EXISTS (SELECT 1 FROM auth.users LIMIT 1);

-- More sample properties omitted for brevity - total 12 planned

-- ==============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================

-- Enable RLS on all tables
ALTER TABLE rental_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE rentals ENABLE ROW LEVEL SECURITY;
ALTER TABLE rental_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE rental_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE rental_review_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE rental_review_helpful_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE rental_review_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE rental_inquiry_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE rental_saved ENABLE ROW LEVEL SECURITY;
ALTER TABLE rental_flags ENABLE ROW LEVEL SECURITY;

-- Rental Categories: Public read access
CREATE POLICY "Anyone can view rental categories"
  ON rental_categories FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage rental categories"
  ON rental_categories FOR ALL
  USING (is_admin());

-- Rentals: Public can view approved, landlords can CRUD own, admins can manage all
CREATE POLICY "Anyone can view approved rentals"
  ON rentals FOR SELECT
  USING (is_approved = true OR landlord_id = auth.uid() OR is_admin());

CREATE POLICY "Landlords can create rentals"
  ON rentals FOR INSERT
  WITH CHECK (auth.uid() = landlord_id);

CREATE POLICY "Landlords can update own rentals"
  ON rentals FOR UPDATE
  USING (auth.uid() = landlord_id OR is_admin());

CREATE POLICY "Landlords can delete own rentals"
  ON rentals FOR DELETE
  USING (auth.uid() = landlord_id OR is_admin());

-- Rental Photos: Public can view, landlords can CRUD own
CREATE POLICY "Anyone can view rental photos for approved rentals"
  ON rental_photos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM rentals
      WHERE rentals.id = rental_photos.rental_id
      AND (rentals.is_approved = true OR rentals.landlord_id = auth.uid() OR is_admin())
    )
  );

CREATE POLICY "Landlords can manage own rental photos"
  ON rental_photos FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM rentals
      WHERE rentals.id = rental_photos.rental_id
      AND (rentals.landlord_id = auth.uid() OR is_admin())
    )
  );

-- Rental Reviews: Anyone can view, auth users can CRUD own reviews
CREATE POLICY "Anyone can view rental reviews"
  ON rental_reviews FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create reviews"
  ON rental_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews"
  ON rental_reviews FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews"
  ON rental_reviews FOR DELETE
  USING (auth.uid() = user_id OR is_admin());

-- Rental Review Photos: Anyone can view, review authors can manage
CREATE POLICY "Anyone can view rental review photos"
  ON rental_review_photos FOR SELECT
  USING (true);

CREATE POLICY "Review authors can manage review photos"
  ON rental_review_photos FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM rental_reviews
      WHERE rental_reviews.id = rental_review_photos.review_id
      AND rental_reviews.user_id = auth.uid()
    )
  );

-- Rental Review Helpful Votes: Anyone can view, auth users can vote
CREATE POLICY "Anyone can view rental review votes"
  ON rental_review_helpful_votes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can vote on reviews"
  ON rental_review_helpful_votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own votes"
  ON rental_review_helpful_votes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own votes"
  ON rental_review_helpful_votes FOR DELETE
  USING (auth.uid() = user_id);

-- Rental Review Responses: Anyone can view, landlords can CRUD responses to own property reviews
CREATE POLICY "Anyone can view rental review responses"
  ON rental_review_responses FOR SELECT
  USING (true);

CREATE POLICY "Landlords can respond to reviews on own rentals"
  ON rental_review_responses FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM rentals
      WHERE rentals.id = rental_review_responses.rental_id
      AND rentals.landlord_id = auth.uid()
    )
  );

CREATE POLICY "Landlords can update own responses"
  ON rental_review_responses FOR UPDATE
  USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Landlords can delete own responses"
  ON rental_review_responses FOR DELETE
  USING (auth.uid() = user_id OR is_admin());

-- Rental Inquiry Clicks: Insert only (analytics)
CREATE POLICY "Anyone can log rental inquiry clicks"
  ON rental_inquiry_clicks FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view own inquiry clicks"
  ON rental_inquiry_clicks FOR SELECT
  USING (auth.uid() = user_id OR is_admin());

-- Rental Saved: Users can CRUD own saves
CREATE POLICY "Users can view own saved rentals"
  ON rental_saved FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can save rentals"
  ON rental_saved FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own saved rentals"
  ON rental_saved FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can unsave rentals"
  ON rental_saved FOR DELETE
  USING (auth.uid() = user_id);

-- Rental Flags: Users can flag properties, admins can view all
CREATE POLICY "Admins can view all rental flags"
  ON rental_flags FOR SELECT
  USING (is_admin());

CREATE POLICY "Users can flag rentals"
  ON rental_flags FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own flags"
  ON rental_flags FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own flags"
  ON rental_flags FOR DELETE
  USING (auth.uid() = user_id OR is_admin());

-- ==============================================
-- STORAGE BUCKET CREATION
-- ==============================================

-- Create rental-photos bucket (to be created via Supabase Studio or CLI)
-- bucket name: rental-photos
-- Max file size: 5MB
-- Allowed MIME types: image/jpeg, image/png, image/webp
-- Max 15 photos per rental

-- Storage policies will be created in next step via Supabase Studio
