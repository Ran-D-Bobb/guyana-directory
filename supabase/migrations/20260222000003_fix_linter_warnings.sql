-- Fix Supabase linter warnings: unindexed foreign keys, auth_rls_initplan,
-- and multiple permissive policies.

-- ============================================
-- 1. UNINDEXED FOREIGN KEYS
-- ============================================

CREATE INDEX IF NOT EXISTS idx_profiles_status_updated_by
  ON profiles(status_updated_by);

CREATE INDEX IF NOT EXISTS idx_rental_review_responses_user_id
  ON rental_review_responses(user_id);

CREATE INDEX IF NOT EXISTS idx_review_responses_user_id
  ON review_responses(user_id);

CREATE INDEX IF NOT EXISTS idx_tourism_inquiry_clicks_user_id
  ON tourism_inquiry_clicks(user_id);

CREATE INDEX IF NOT EXISTS idx_tourism_saved_experiences_experience_id
  ON tourism_saved_experiences(experience_id);

-- ============================================
-- 2. FIX AUTH RLS INITPLAN on timeline_events
--    Wrap auth.jwt() in (select ...) so it's
--    evaluated once, not per-row.
--    Also consolidate the two SELECT policies
--    into one to fix multiple_permissive_policies.
-- ============================================

-- Drop all existing timeline_events policies
DROP POLICY IF EXISTS "Public can view active timeline events" ON timeline_events;
DROP POLICY IF EXISTS "Admins can view all timeline events" ON timeline_events;
DROP POLICY IF EXISTS "Admins can insert timeline events" ON timeline_events;
DROP POLICY IF EXISTS "Admins can update timeline events" ON timeline_events;
DROP POLICY IF EXISTS "Admins can delete timeline events" ON timeline_events;

-- Single SELECT policy: active events for everyone, all events for admins
CREATE POLICY "Anyone can view timeline events"
  ON timeline_events
  FOR SELECT
  USING (
    is_active = true
    OR EXISTS (
      SELECT 1 FROM admin_emails
      WHERE email = (select auth.jwt()->>'email')
    )
  );

CREATE POLICY "Admins can insert timeline events"
  ON timeline_events
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_emails
      WHERE email = (select auth.jwt()->>'email')
    )
  );

CREATE POLICY "Admins can update timeline events"
  ON timeline_events
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admin_emails
      WHERE email = (select auth.jwt()->>'email')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_emails
      WHERE email = (select auth.jwt()->>'email')
    )
  );

CREATE POLICY "Admins can delete timeline events"
  ON timeline_events
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM admin_emails
      WHERE email = (select auth.jwt()->>'email')
    )
  );

-- ============================================
-- 3. FIX AUTH RLS INITPLAN on business_tags
--    Wrap auth.uid() in (select ...).
-- ============================================

DROP POLICY IF EXISTS "Business owners can add their tags" ON business_tags;
DROP POLICY IF EXISTS "Business owners can remove their tags" ON business_tags;

CREATE POLICY "Business owners can add their tags" ON business_tags
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = business_tags.business_id
      AND businesses.owner_id = (select auth.uid())
    ) OR is_admin()
  );

CREATE POLICY "Business owners can remove their tags" ON business_tags
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = business_tags.business_id
      AND businesses.owner_id = (select auth.uid())
    ) OR is_admin()
  );

-- ============================================
-- 4. FIX MULTIPLE PERMISSIVE POLICIES on
--    tourism_hero_videos: merge two SELECT
--    policies into one.
-- ============================================

DROP POLICY IF EXISTS "Public can view active tourism hero videos" ON tourism_hero_videos;
DROP POLICY IF EXISTS "Admins can view all tourism hero videos" ON tourism_hero_videos;

CREATE POLICY "Anyone can view tourism hero videos"
  ON tourism_hero_videos
  FOR SELECT
  USING (
    is_active = true
    OR is_admin()
  );
