-- Add image_url column to business_events for event images
ALTER TABLE public.business_events ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Create a unified events view that combines community events and business events
-- This allows the public /events page to show both types in a single query
CREATE OR REPLACE VIEW public.all_events AS

-- Community events (from events table)
SELECT
  e.id,
  'community'::text AS source_type,
  e.business_id,
  e.title,
  e.slug,
  e.description,
  e.start_date,
  e.end_date,
  e.image_url,
  e.location,
  e.event_type AS event_type_name,
  ec.name AS category_name,
  ec.icon AS category_icon,
  e.category_id,
  e.region_id,
  COALESCE(e.is_featured, false) AS is_featured,
  COALESCE(e.view_count, 0) AS view_count,
  COALESCE(e.interest_count, 0) AS interest_count,
  e.user_id,
  e.created_at,
  b.name AS business_name,
  b.slug AS business_slug,
  NULL::text AS event_type_icon
FROM public.events e
LEFT JOIN public.event_categories ec ON e.category_id = ec.id
LEFT JOIN public.businesses b ON e.business_id = b.id

UNION ALL

-- Business promotional events (from business_events table)
SELECT
  be.id,
  'business'::text AS source_type,
  be.business_id,
  be.title,
  be.slug,
  be.description,
  be.start_date,
  be.end_date,
  be.image_url,
  b.address AS location,
  bet.name AS event_type_name,
  NULL::text AS category_name,
  NULL::text AS category_icon,
  NULL::uuid AS category_id,
  b.region_id,
  false AS is_featured,
  COALESCE(be.view_count, 0) AS view_count,
  0 AS interest_count,
  NULL::uuid AS user_id,
  be.created_at,
  b.name AS business_name,
  b.slug AS business_slug,
  bet.icon AS event_type_icon
FROM public.business_events be
JOIN public.businesses b ON be.business_id = b.id
LEFT JOIN public.business_event_types bet ON be.event_type_id = bet.id
WHERE be.is_active = true;
