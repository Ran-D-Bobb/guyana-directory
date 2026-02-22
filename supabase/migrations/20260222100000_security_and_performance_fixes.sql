-- Migration: Security and Performance Fixes
-- Fixes: is_admin() JWT bypass, test admin email, event-photos bucket, analytics N+1, search indexes

-- 2A. Fix is_admin() — use auth.users table instead of JWT claims
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_email TEXT;
BEGIN
  SELECT email INTO user_email FROM auth.users WHERE id = auth.uid();
  IF user_email IS NULL THEN RETURN false; END IF;
  RETURN EXISTS (SELECT 1 FROM admin_emails WHERE email = user_email);
END;
$$;

-- 2B. Remove test@example.com from admin_emails
DELETE FROM public.admin_emails WHERE email = 'test@example.com';

-- 2C. Fix prevent_account_type_change — use auth.users.created_at
CREATE OR REPLACE FUNCTION public.prevent_account_type_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF OLD.account_type IS DISTINCT FROM NEW.account_type THEN
    IF OLD.account_type = 'personal'
       AND NEW.account_type = 'business'
       AND (SELECT created_at FROM auth.users WHERE id = NEW.id) > NOW() - INTERVAL '2 minutes' THEN
      RETURN NEW;
    END IF;
    RAISE EXCEPTION 'account_type cannot be changed after creation';
  END IF;
  RETURN NEW;
END;
$$;

-- 2D. Fix event-photos bucket — add mime types and size limit
UPDATE storage.buckets
SET file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
WHERE id = 'event-photos';

-- 2E. Create DB functions for analytics aggregation (replaces N+1 loops)

-- Replace getCategoryPerformance N+1 loop
CREATE OR REPLACE FUNCTION public.get_category_performance(p_limit INT DEFAULT 10)
RETURNS TABLE(
  category_id UUID, category_name TEXT, category_slug TEXT,
  business_count BIGINT, total_views BIGINT, total_reviews BIGINT, avg_rating NUMERIC
)
LANGUAGE sql STABLE SET search_path = public
AS $$
  SELECT c.id, c.name, c.slug,
    COUNT(b.id), COALESCE(SUM(b.view_count), 0),
    COALESCE(SUM(b.review_count), 0),
    CASE WHEN COUNT(b.id) FILTER (WHERE b.rating IS NOT NULL) > 0
      THEN AVG(b.rating) FILTER (WHERE b.rating IS NOT NULL) ELSE NULL END
  FROM categories c LEFT JOIN businesses b ON b.category_id = c.id
  GROUP BY c.id, c.name, c.slug
  ORDER BY COALESCE(SUM(b.view_count), 0) DESC
  LIMIT p_limit;
$$;

-- Replace getRegionPerformance N+1 loop
CREATE OR REPLACE FUNCTION public.get_region_performance(p_limit INT DEFAULT 10)
RETURNS TABLE(
  region_id UUID, region_name TEXT, region_slug TEXT, region_type TEXT,
  business_count BIGINT, total_views BIGINT, total_reviews BIGINT
)
LANGUAGE sql STABLE SET search_path = public
AS $$
  SELECT r.id, r.name, r.slug, r.type,
    COUNT(b.id), COALESCE(SUM(b.view_count), 0), COALESCE(SUM(b.review_count), 0)
  FROM regions r LEFT JOIN businesses b ON b.region_id = r.id
  GROUP BY r.id, r.name, r.slug, r.type
  ORDER BY COALESCE(SUM(b.view_count), 0) DESC
  LIMIT p_limit;
$$;

-- 2F. Create full-text search indexes for all content types

-- Events
CREATE INDEX IF NOT EXISTS idx_events_search ON events USING gin(
  to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, ''))
);

-- Tourism experiences
CREATE INDEX IF NOT EXISTS idx_tourism_search ON tourism_experiences USING gin(
  to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, ''))
);

-- Rentals
CREATE INDEX IF NOT EXISTS idx_rentals_search ON rentals USING gin(
  to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, ''))
);
