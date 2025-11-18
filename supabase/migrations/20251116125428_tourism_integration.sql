-- Tourism Integration Migration
-- This migration creates all necessary tables, functions, and policies for the tourism section

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TOURISM CATEGORIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.tourism_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT NOT NULL, -- Lucide icon name
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TOURISM EXPERIENCES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.tourism_experiences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,

  -- Tourism-specific fields
  tourism_category_id UUID REFERENCES tourism_categories(id) ON DELETE SET NULL,
  experience_type TEXT CHECK (experience_type IN ('tour', 'activity', 'attraction', 'accommodation', 'service')),
  duration TEXT, -- "2 hours", "Full Day", "3 days / 2 nights"
  difficulty_level TEXT CHECK (difficulty_level IN ('easy', 'moderate', 'challenging', 'extreme')),
  group_size_min INTEGER,
  group_size_max INTEGER,
  age_requirement TEXT, -- "All ages", "18+", "12+"

  -- Location
  region_id UUID REFERENCES regions(id) ON DELETE SET NULL,
  location_details TEXT, -- Specific location description
  meeting_point TEXT, -- Where tourists meet guide
  coordinates POINT, -- For future mapping integration

  -- Contact (WhatsApp-first)
  whatsapp_number TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  website TEXT,

  -- Operator info
  operator_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  operator_name TEXT, -- Company/guide name
  operator_license TEXT, -- Tourism license number

  -- Pricing
  price_from DECIMAL(10,2), -- Starting price in GYD
  price_currency TEXT DEFAULT 'GYD',
  price_notes TEXT, -- "Per person", "Per group", "Varies by season"
  includes TEXT, -- What's included in price
  excludes TEXT, -- What's not included

  -- Availability
  available_months TEXT[], -- ["January", "February"] or ["Year-round"]
  best_season TEXT, -- "Dry season (Sept-April)"
  booking_required BOOLEAN DEFAULT TRUE,
  advance_booking_days INTEGER, -- Minimum days to book in advance

  -- Status & verification
  is_verified BOOLEAN DEFAULT FALSE, -- Verified by platform
  is_featured BOOLEAN DEFAULT FALSE,
  is_tourism_authority_approved BOOLEAN DEFAULT FALSE, -- Special badge

  -- Statistics
  rating DECIMAL(2,1) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
  review_count INTEGER DEFAULT 0,
  whatsapp_clicks INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  booking_inquiry_count INTEGER DEFAULT 0, -- Track WhatsApp inquiry clicks

  -- Accessibility & safety
  accessibility_info TEXT, -- Wheelchair accessible, fitness level required
  safety_requirements TEXT, -- Equipment needed, safety briefing

  -- What to bring
  what_to_bring TEXT[], -- ["Water", "Sunscreen", "Camera"]

  -- Languages offered
  languages TEXT[], -- ["English", "Portuguese", "Spanish"]

  -- AI/Recommendation foundation
  tags TEXT[], -- ["family-friendly", "romantic", "adventure", "photography", "eco-tourism"]
  user_preference_data JSONB, -- Store click patterns, views for AI training

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TOURISM PHOTOS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.tourism_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  experience_id UUID NOT NULL REFERENCES tourism_experiences(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  photo_type TEXT CHECK (photo_type IN ('cover', 'gallery', 'activity', 'location', 'guide')),
  display_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TOURISM REVIEWS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.tourism_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  experience_id UUID NOT NULL REFERENCES tourism_experiences(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Ratings (1-5 scale)
  overall_rating INTEGER NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
  value_rating INTEGER CHECK (value_rating >= 1 AND value_rating <= 5),
  guide_rating INTEGER CHECK (guide_rating >= 1 AND guide_rating <= 5),
  safety_rating INTEGER CHECK (safety_rating >= 1 AND safety_rating <= 5),

  -- Review content
  title TEXT,
  comment TEXT,
  experience_date DATE, -- When they actually did the tour

  -- Trip type context (helps with AI recommendations)
  trip_type TEXT CHECK (trip_type IN ('solo', 'couple', 'family', 'friends', 'business')),

  -- Verification
  is_verified_booking BOOLEAN DEFAULT FALSE, -- Did they actually book through platform?

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(experience_id, user_id)
);

-- ============================================
-- TOURISM INQUIRY CLICKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.tourism_inquiry_clicks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  experience_id UUID NOT NULL REFERENCES tourism_experiences(id) ON DELETE CASCADE,
  clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  device_type TEXT, -- 'mobile', 'tablet', 'desktop', 'kiosk'
  user_agent TEXT,
  location_source TEXT, -- 'search', 'category', 'featured', 'kiosk'
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- If logged in
  session_id TEXT, -- For anonymous tracking

  -- AI training data
  user_preferences JSONB -- Capture search filters, preferences for ML
);

-- ============================================
-- TOURIST PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.tourist_profiles (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,

  -- Preferences for AI recommendations
  interests TEXT[], -- ["nature", "adventure", "culture", "photography"]
  experience_level TEXT CHECK (experience_level IN ('beginner', 'intermediate', 'advanced')),
  travel_style TEXT CHECK (travel_style IN ('budget', 'mid-range', 'luxury')),
  typical_group_size INTEGER,
  preferred_languages TEXT[],

  -- Visit information
  arrival_date DATE,
  departure_date DATE,
  is_first_visit BOOLEAN DEFAULT TRUE,
  home_country TEXT,

  -- AI behavior tracking
  browsing_history JSONB, -- {experience_id: timestamp, category_viewed: timestamp}
  click_patterns JSONB, -- Track what they click for ML training
  recommendation_feedback JSONB, -- Did they like AI suggestions?

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TOURISM SAVED EXPERIENCES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.tourism_saved_experiences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  experience_id UUID NOT NULL REFERENCES tourism_experiences(id) ON DELETE CASCADE,
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT, -- Personal notes

  UNIQUE(user_id, experience_id)
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Tourism experiences indexes
CREATE INDEX idx_tourism_experiences_category ON tourism_experiences(tourism_category_id);
CREATE INDEX idx_tourism_experiences_region ON tourism_experiences(region_id);
CREATE INDEX idx_tourism_experiences_operator ON tourism_experiences(operator_id);
CREATE INDEX idx_tourism_experiences_verified ON tourism_experiences(is_verified);
CREATE INDEX idx_tourism_experiences_featured ON tourism_experiences(is_featured);
CREATE INDEX idx_tourism_experiences_tags ON tourism_experiences USING gin(tags);

-- Full-text search
CREATE INDEX idx_tourism_experiences_search ON tourism_experiences USING gin(
  to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, '') || ' ' || coalesce(location_details, ''))
);

-- Analytics indexes
CREATE INDEX idx_tourism_inquiry_clicks_experience ON tourism_inquiry_clicks(experience_id);
CREATE INDEX idx_tourism_inquiry_clicks_timestamp ON tourism_inquiry_clicks(clicked_at);
CREATE INDEX idx_tourism_inquiry_clicks_device ON tourism_inquiry_clicks(device_type);

-- Tourism photos index
CREATE INDEX idx_tourism_photos_experience ON tourism_photos(experience_id);

-- Tourism reviews index
CREATE INDEX idx_tourism_reviews_experience ON tourism_reviews(experience_id);
CREATE INDEX idx_tourism_reviews_user ON tourism_reviews(user_id);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update tourism experience rating
CREATE OR REPLACE FUNCTION update_tourism_experience_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE tourism_experiences
  SET
    rating = (
      SELECT COALESCE(ROUND(AVG(overall_rating)::numeric, 1), 0)
      FROM tourism_reviews
      WHERE experience_id = COALESCE(NEW.experience_id, OLD.experience_id)
    ),
    review_count = (
      SELECT COUNT(*)
      FROM tourism_reviews
      WHERE experience_id = COALESCE(NEW.experience_id, OLD.experience_id)
    )
  WHERE id = COALESCE(NEW.experience_id, OLD.experience_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update rating on review changes
CREATE TRIGGER trigger_update_tourism_experience_rating
AFTER INSERT OR UPDATE OR DELETE ON tourism_reviews
FOR EACH ROW
EXECUTE FUNCTION update_tourism_experience_rating();

-- Function to increment WhatsApp inquiry counter
CREATE OR REPLACE FUNCTION increment_tourism_inquiry()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE tourism_experiences
  SET
    whatsapp_clicks = whatsapp_clicks + 1,
    booking_inquiry_count = booking_inquiry_count + 1
  WHERE id = NEW.experience_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to increment counters on new inquiry click
CREATE TRIGGER trigger_increment_tourism_inquiry
AFTER INSERT ON tourism_inquiry_clicks
FOR EACH ROW
EXECUTE FUNCTION increment_tourism_inquiry();

-- Function to increment tourism experience view count
CREATE OR REPLACE FUNCTION increment_tourism_view_count(experience_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE tourism_experiences
  SET view_count = view_count + 1
  WHERE id = experience_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_tourism_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER trigger_tourism_experiences_updated_at
BEFORE UPDATE ON tourism_experiences
FOR EACH ROW
EXECUTE FUNCTION update_tourism_updated_at();

CREATE TRIGGER trigger_tourism_reviews_updated_at
BEFORE UPDATE ON tourism_reviews
FOR EACH ROW
EXECUTE FUNCTION update_tourism_updated_at();

CREATE TRIGGER trigger_tourist_profiles_updated_at
BEFORE UPDATE ON tourist_profiles
FOR EACH ROW
EXECUTE FUNCTION update_tourism_updated_at();

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE tourism_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tourism_experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE tourism_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE tourism_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE tourism_inquiry_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE tourist_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tourism_saved_experiences ENABLE ROW LEVEL SECURITY;

-- Tourism Categories: Everyone can read
CREATE POLICY "Tourism categories viewable by everyone" ON tourism_categories
  FOR SELECT USING (true);

CREATE POLICY "Tourism categories manageable by admins" ON tourism_categories
  FOR ALL USING (is_admin());

-- Tourism Experiences: Everyone can read, operators can update their own
CREATE POLICY "Tourism experiences viewable by everyone" ON tourism_experiences
  FOR SELECT USING (true);

CREATE POLICY "Operators can insert own experiences" ON tourism_experiences
  FOR INSERT WITH CHECK (auth.uid() = operator_id OR is_admin());

CREATE POLICY "Operators can update own experiences" ON tourism_experiences
  FOR UPDATE USING (auth.uid() = operator_id OR is_admin());

CREATE POLICY "Operators can delete own experiences" ON tourism_experiences
  FOR DELETE USING (auth.uid() = operator_id OR is_admin());

-- Tourism Photos: Everyone can read, operators can manage their own
CREATE POLICY "Tourism photos viewable by everyone" ON tourism_photos
  FOR SELECT USING (true);

CREATE POLICY "Operators can manage own experience photos" ON tourism_photos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM tourism_experiences
      WHERE id = tourism_photos.experience_id
      AND (operator_id = auth.uid() OR is_admin())
    )
  );

-- Tourism Reviews: Everyone can read, users can manage their own
CREATE POLICY "Tourism reviews viewable by everyone" ON tourism_reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own reviews" ON tourism_reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews" ON tourism_reviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews" ON tourism_reviews
  FOR DELETE USING (auth.uid() = user_id OR is_admin());

-- Tourism Inquiry Clicks: Only insertable, readable by experience owner
CREATE POLICY "Anyone can track inquiry clicks" ON tourism_inquiry_clicks
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Operators can view own experience clicks" ON tourism_inquiry_clicks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM tourism_experiences
      WHERE id = tourism_inquiry_clicks.experience_id
      AND (operator_id = auth.uid() OR is_admin())
    )
  );

-- Tourist Profiles: Users can manage their own
CREATE POLICY "Users can view own tourist profile" ON tourist_profiles
  FOR SELECT USING (auth.uid() = id OR is_admin());

CREATE POLICY "Users can insert own tourist profile" ON tourist_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own tourist profile" ON tourist_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Tourism Saved Experiences: Users can manage their own
CREATE POLICY "Users can view own saved experiences" ON tourism_saved_experiences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can save experiences" ON tourism_saved_experiences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave experiences" ON tourism_saved_experiences
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- SEED DATA: TOURISM CATEGORIES
-- ============================================

INSERT INTO tourism_categories (name, slug, icon, description, display_order) VALUES
  ('Nature & Wildlife', 'nature-wildlife', 'Trees', 'Explore Guyana''s pristine rainforests, stunning waterfalls, and diverse wildlife', 1),
  ('Adventure Activities', 'adventure', 'Activity', 'Thrilling outdoor experiences including hiking, kayaking, and expedition tours', 2),
  ('Cultural Experiences', 'culture', 'Users', 'Immerse yourself in local traditions, indigenous villages, and cultural heritage', 3),
  ('Eco-Lodges & Stays', 'eco-lodges', 'Home', 'Sustainable accommodations in nature, from rainforest lodges to village stays', 4),
  ('Tours & Guides', 'tours-guides', 'Map', 'Professional guided tours ranging from city walks to multi-day expeditions', 5),
  ('Water Activities', 'water-activities', 'Waves', 'River cruises, turtle watching, fishing, and water-based adventures', 6),
  ('Food & Culinary', 'food-culinary', 'Utensils', 'Taste local cuisine, cooking classes, and food tours', 7),
  ('Historical & Heritage', 'history-heritage', 'Landmark', 'Discover Georgetown''s colonial architecture, museums, and historical sites', 8),
  ('Photography Tours', 'photography', 'Camera', 'Specialized photo expeditions to capture Guyana''s natural beauty', 9),
  ('Bird Watching', 'bird-watching', 'Bird', 'World-class birding tours in one of Earth''s most biodiverse regions', 10),
  ('Multi-Day Expeditions', 'expeditions', 'Compass', 'Extended adventure packages exploring multiple regions of Guyana', 11),
  ('Airport & Transfer Services', 'transfers', 'Car', 'Convenient transportation services for tourists', 12)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- STORAGE BUCKET FOR TOURISM PHOTOS
-- ============================================

-- Create storage bucket for tourism photos (run in Supabase dashboard)
-- INSERT INTO storage.buckets (id, name, public, avif_autodetection, allowed_mime_types)
-- VALUES (
--   'tourism-photos',
--   'tourism-photos',
--   true,
--   false,
--   ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
-- );

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON TABLE tourism_experiences IS 'Core table for tourism experiences, tours, and activities';
COMMENT ON TABLE tourism_categories IS 'Categories for organizing tourism experiences';
COMMENT ON TABLE tourism_photos IS 'Photo storage for tourism experiences';
COMMENT ON TABLE tourism_reviews IS 'Reviews for tourism experiences with multi-aspect ratings';
COMMENT ON TABLE tourism_inquiry_clicks IS 'Analytics tracking for WhatsApp booking inquiries';
COMMENT ON TABLE tourist_profiles IS 'Extended profile data for tourists to enable personalization';
COMMENT ON TABLE tourism_saved_experiences IS 'Wishlist/saved experiences for users';