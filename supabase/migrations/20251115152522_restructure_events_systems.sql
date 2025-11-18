-- Restructure Events Systems
-- Drop old events system and create two separate systems:
-- 1. General Events (community events for all users)
-- 2. Business Events (promotional offers for business owners)

-- =============================================
-- DROP OLD TABLES
-- =============================================
DROP TABLE IF EXISTS public.events CASCADE;
DROP TABLE IF EXISTS public.event_categories CASCADE;

-- Drop old functions
DROP FUNCTION IF EXISTS increment_event_views(UUID);
DROP FUNCTION IF EXISTS increment_event_whatsapp_clicks(UUID);

-- =============================================
-- GENERAL EVENTS SYSTEM
-- =============================================

-- Event categories for general events
CREATE TABLE IF NOT EXISTS public.event_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- General community events table
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id UUID REFERENCES public.businesses(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  location TEXT,
  image_url TEXT,
  event_type TEXT,
  category_id UUID REFERENCES public.event_categories(id) ON DELETE SET NULL,
  is_featured BOOLEAN DEFAULT FALSE,
  view_count INTEGER DEFAULT 0,
  whatsapp_clicks INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_date_range CHECK (end_date >= start_date)
);

-- Indexes for general events
CREATE INDEX IF NOT EXISTS idx_events_user_id ON public.events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_business_id ON public.events(business_id);
CREATE INDEX IF NOT EXISTS idx_events_category_id ON public.events(category_id);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON public.events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_is_featured ON public.events(is_featured);
CREATE INDEX IF NOT EXISTS idx_events_slug ON public.events(slug);

-- =============================================
-- BUSINESS EVENTS SYSTEM
-- =============================================

-- Business event types
CREATE TABLE IF NOT EXISTS public.business_event_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Business promotional events/offers
CREATE TABLE IF NOT EXISTS public.business_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  event_type_id UUID REFERENCES public.business_event_types(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT TRUE,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_business_event_date_range CHECK (end_date >= start_date)
);

-- Indexes for business events
CREATE INDEX IF NOT EXISTS idx_business_events_business_id ON public.business_events(business_id);
CREATE INDEX IF NOT EXISTS idx_business_events_event_type_id ON public.business_events(event_type_id);
CREATE INDEX IF NOT EXISTS idx_business_events_start_date ON public.business_events(start_date);
CREATE INDEX IF NOT EXISTS idx_business_events_is_active ON public.business_events(is_active);
CREATE INDEX IF NOT EXISTS idx_business_events_slug ON public.business_events(slug);

-- =============================================
-- FUNCTIONS FOR ANALYTICS
-- =============================================

-- General events functions
CREATE OR REPLACE FUNCTION increment_event_views(event_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.events
  SET view_count = view_count + 1
  WHERE id = event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_event_whatsapp_clicks(event_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.events
  SET whatsapp_clicks = whatsapp_clicks + 1
  WHERE id = event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Business events functions
CREATE OR REPLACE FUNCTION increment_business_event_views(business_event_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.business_events
  SET view_count = view_count + 1
  WHERE id = business_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- TRIGGERS
-- =============================================

-- Update timestamp for general events
CREATE OR REPLACE FUNCTION update_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER events_updated_at
BEFORE UPDATE ON public.events
FOR EACH ROW
EXECUTE FUNCTION update_events_updated_at();

-- Update timestamp for business events
CREATE OR REPLACE FUNCTION update_business_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER business_events_updated_at
BEFORE UPDATE ON public.business_events
FOR EACH ROW
EXECUTE FUNCTION update_business_events_updated_at();

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_event_types ENABLE ROW LEVEL SECURITY;

-- EVENT CATEGORIES POLICIES
CREATE POLICY "Event categories are viewable by everyone"
ON public.event_categories FOR SELECT USING (true);

CREATE POLICY "Admins can manage event categories"
ON public.event_categories FOR ALL USING (is_admin());

-- GENERAL EVENTS POLICIES
CREATE POLICY "Events are viewable by everyone"
ON public.events FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create events"
ON public.events FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "Users can update their own events, admins can update all"
ON public.events FOR UPDATE
USING (auth.uid() IS NOT NULL AND (user_id = auth.uid() OR is_admin()));

CREATE POLICY "Users can delete their own events, admins can delete all"
ON public.events FOR DELETE
USING (auth.uid() IS NOT NULL AND (user_id = auth.uid() OR is_admin()));

-- BUSINESS EVENT TYPES POLICIES
CREATE POLICY "Business event types are viewable by everyone"
ON public.business_event_types FOR SELECT USING (true);

CREATE POLICY "Admins can manage business event types"
ON public.business_event_types FOR ALL USING (is_admin());

-- BUSINESS EVENTS POLICIES
CREATE POLICY "Business events are viewable by everyone"
ON public.business_events FOR SELECT USING (true);

CREATE POLICY "Business owners can create events for their business"
ON public.business_events FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL AND (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE id = business_id AND owner_id = auth.uid()
    )
    OR is_admin()
  )
);

CREATE POLICY "Business owners can update their business events"
ON public.business_events FOR UPDATE
USING (
  auth.uid() IS NOT NULL AND (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE id = business_id AND owner_id = auth.uid()
    )
    OR is_admin()
  )
);

CREATE POLICY "Business owners can delete their business events"
ON public.business_events FOR DELETE
USING (
  auth.uid() IS NOT NULL AND (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE id = business_id AND owner_id = auth.uid()
    )
    OR is_admin()
  )
);

-- =============================================
-- SEED DATA
-- =============================================

-- Seed event categories
INSERT INTO public.event_categories (name, slug, icon) VALUES
  ('Concert', 'concert', 'Music'),
  ('Workshop', 'workshop', 'GraduationCap'),
  ('Community', 'community', 'Users'),
  ('Festival', 'festival', 'PartyPopper'),
  ('Sports', 'sports', 'Trophy'),
  ('Business Networking', 'business-networking', 'Briefcase'),
  ('Food & Drink', 'food-drink', 'Utensils'),
  ('Art & Culture', 'art-culture', 'Palette'),
  ('Charity', 'charity', 'Heart'),
  ('Other', 'other', 'Calendar')
ON CONFLICT (slug) DO NOTHING;

-- Seed business event types
INSERT INTO public.business_event_types (name, slug, icon) VALUES
  ('Sale', 'sale', 'Tag'),
  ('Discount', 'discount', 'Percent'),
  ('Happy Hour', 'happy-hour', 'Clock'),
  ('Buy One Get One', 'bogo', 'ShoppingCart'),
  ('Free Item', 'free-item', 'Gift'),
  ('Special Menu', 'special-menu', 'Utensils'),
  ('Limited Time Offer', 'limited-time', 'Zap'),
  ('Grand Opening', 'grand-opening', 'PartyPopper'),
  ('Seasonal Special', 'seasonal', 'Sparkles'),
  ('Other Promotion', 'other', 'Megaphone')
ON CONFLICT (slug) DO NOTHING;
