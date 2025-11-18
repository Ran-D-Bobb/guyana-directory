-- Events System Schema
-- Creates tables, functions, triggers, and RLS policies for the events feature

-- =============================================
-- 1. EVENT CATEGORIES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.event_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 2. EVENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
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

  -- Constraints
  CONSTRAINT valid_date_range CHECK (end_date >= start_date)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_events_business_id ON public.events(business_id);
CREATE INDEX IF NOT EXISTS idx_events_category_id ON public.events(category_id);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON public.events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_is_featured ON public.events(is_featured);
CREATE INDEX IF NOT EXISTS idx_events_slug ON public.events(slug);

-- =============================================
-- 3. FUNCTIONS FOR EVENT ANALYTICS
-- =============================================

-- Function to increment event view count
CREATE OR REPLACE FUNCTION increment_event_views(event_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.events
  SET view_count = view_count + 1
  WHERE id = event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment event WhatsApp clicks
CREATE OR REPLACE FUNCTION increment_event_whatsapp_clicks(event_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.events
  SET whatsapp_clicks = whatsapp_clicks + 1
  WHERE id = event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 4. TRIGGERS
-- =============================================

-- Trigger to update updated_at timestamp
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

-- =============================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on events table
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Enable RLS on event_categories table
ALTER TABLE public.event_categories ENABLE ROW LEVEL SECURITY;

-- EVENT CATEGORIES POLICIES
-- Anyone can view event categories
CREATE POLICY "Event categories are viewable by everyone"
ON public.event_categories
FOR SELECT
USING (true);

-- Only admins can insert event categories
CREATE POLICY "Admins can insert event categories"
ON public.event_categories
FOR INSERT
WITH CHECK (is_admin());

-- Only admins can update event categories
CREATE POLICY "Admins can update event categories"
ON public.event_categories
FOR UPDATE
USING (is_admin());

-- Only admins can delete event categories
CREATE POLICY "Admins can delete event categories"
ON public.event_categories
FOR DELETE
USING (is_admin());

-- EVENTS POLICIES
-- Anyone can view events
CREATE POLICY "Events are viewable by everyone"
ON public.events
FOR SELECT
USING (true);

-- Business owners can create events for their own business
CREATE POLICY "Business owners can create events"
ON public.events
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL AND (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE id = business_id AND owner_id = auth.uid()
    )
    OR is_admin()
  )
);

-- Business owners can update their own events, admins can update all
CREATE POLICY "Business owners can update their events"
ON public.events
FOR UPDATE
USING (
  auth.uid() IS NOT NULL AND (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE id = business_id AND owner_id = auth.uid()
    )
    OR is_admin()
  )
);

-- Business owners can delete their own events, admins can delete all
CREATE POLICY "Business owners can delete their events"
ON public.events
FOR DELETE
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
-- 6. SEED EVENT CATEGORIES
-- =============================================
INSERT INTO public.event_categories (name, slug, icon) VALUES
  ('Concert', 'concert', 'Music'),
  ('Workshop', 'workshop', 'GraduationCap'),
  ('Sale', 'sale', 'ShoppingBag'),
  ('Community', 'community', 'Users'),
  ('Festival', 'festival', 'PartyPopper'),
  ('Sports', 'sports', 'Trophy'),
  ('Business', 'business', 'Briefcase'),
  ('Food & Drink', 'food-drink', 'Utensils'),
  ('Art & Culture', 'art-culture', 'Palette'),
  ('Charity', 'charity', 'Heart')
ON CONFLICT (slug) DO NOTHING;
