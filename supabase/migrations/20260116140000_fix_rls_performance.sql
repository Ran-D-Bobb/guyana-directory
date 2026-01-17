-- Fix RLS Performance Issues
-- 1. Wrap auth.<function>() calls in (select ...) to avoid re-evaluation per row
-- 2. Consolidate multiple permissive policies where applicable

-- ============================================
-- PROFILES TABLE
-- ============================================
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING ((select auth.uid()) = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK ((select auth.uid()) = id);

-- ============================================
-- BUSINESSES TABLE
-- ============================================
DROP POLICY IF EXISTS "Business owners and admins can update businesses" ON businesses;
DROP POLICY IF EXISTS "Authenticated users and admins can create businesses" ON businesses;

CREATE POLICY "Business owners and admins can update businesses" ON businesses
  FOR UPDATE USING (
    (select auth.uid()) = owner_id OR is_admin()
  );

CREATE POLICY "Authenticated users and admins can create businesses" ON businesses
  FOR INSERT WITH CHECK (
    ((select auth.uid()) = owner_id AND (select auth.uid()) IS NOT NULL) OR is_admin()
  );

-- ============================================
-- BUSINESS_PHOTOS TABLE
-- Fix auth_rls_initplan and multiple_permissive_policies
-- ============================================
DROP POLICY IF EXISTS "Business photos are viewable by everyone" ON business_photos;
DROP POLICY IF EXISTS "Business owners can manage their photos" ON business_photos;

-- Single SELECT policy (consolidates the two)
CREATE POLICY "Business photos are viewable by everyone" ON business_photos
  FOR SELECT USING (true);

-- Separate policies for INSERT, UPDATE, DELETE with optimized auth calls
CREATE POLICY "Business owners can insert their photos" ON business_photos
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = business_photos.business_id
      AND businesses.owner_id = (select auth.uid())
    )
  );

CREATE POLICY "Business owners can update their photos" ON business_photos
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = business_photos.business_id
      AND businesses.owner_id = (select auth.uid())
    )
  );

CREATE POLICY "Business owners can delete their photos" ON business_photos
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = business_photos.business_id
      AND businesses.owner_id = (select auth.uid())
    )
  );

-- ============================================
-- REVIEWS TABLE
-- ============================================
DROP POLICY IF EXISTS "Authenticated users can create reviews" ON reviews;
DROP POLICY IF EXISTS "Users can update their own reviews" ON reviews;
DROP POLICY IF EXISTS "Users can delete their own reviews" ON reviews;

CREATE POLICY "Authenticated users can create reviews" ON reviews
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own reviews" ON reviews
  FOR UPDATE USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own reviews" ON reviews
  FOR DELETE USING ((select auth.uid()) = user_id);

-- ============================================
-- WHATSAPP_CLICKS TABLE
-- ============================================
DROP POLICY IF EXISTS "Whatsapp clicks viewable by business owners" ON whatsapp_clicks;

CREATE POLICY "Whatsapp clicks viewable by business owners" ON whatsapp_clicks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = whatsapp_clicks.business_id
      AND businesses.owner_id = (select auth.uid())
    )
  );

-- ============================================
-- EVENT_CATEGORIES TABLE
-- Fix multiple_permissive_policies
-- ============================================
DROP POLICY IF EXISTS "Event categories are viewable by everyone" ON event_categories;
DROP POLICY IF EXISTS "Admins can manage event categories" ON event_categories;

-- Single SELECT policy
CREATE POLICY "Event categories are viewable by everyone" ON event_categories
  FOR SELECT USING (true);

-- Separate admin policies for modification
CREATE POLICY "Admins can insert event categories" ON event_categories
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "Admins can update event categories" ON event_categories
  FOR UPDATE USING (is_admin());

CREATE POLICY "Admins can delete event categories" ON event_categories
  FOR DELETE USING (is_admin());

-- ============================================
-- EVENTS TABLE
-- Fix auth_rls_initplan and multiple_permissive_policies
-- ============================================
DROP POLICY IF EXISTS "Authenticated users can create events" ON events;
DROP POLICY IF EXISTS "Users can update their own events" ON events;
DROP POLICY IF EXISTS "Users can delete their own events" ON events;
DROP POLICY IF EXISTS "Users can update their own events, admins can update all" ON events;
DROP POLICY IF EXISTS "Users can delete their own events, admins can delete all" ON events;

CREATE POLICY "Authenticated users can create events" ON events
  FOR INSERT WITH CHECK ((select auth.uid()) IS NOT NULL AND user_id = (select auth.uid()));

-- Single UPDATE policy (consolidates duplicates)
CREATE POLICY "Users can update their own events, admins can update all" ON events
  FOR UPDATE USING ((select auth.uid()) IS NOT NULL AND (user_id = (select auth.uid()) OR is_admin()));

-- Single DELETE policy (consolidates duplicates)
CREATE POLICY "Users can delete their own events, admins can delete all" ON events
  FOR DELETE USING ((select auth.uid()) IS NOT NULL AND (user_id = (select auth.uid()) OR is_admin()));

-- ============================================
-- BUSINESS_EVENT_TYPES TABLE
-- Fix multiple_permissive_policies
-- ============================================
DROP POLICY IF EXISTS "Business event types are viewable by everyone" ON business_event_types;
DROP POLICY IF EXISTS "Admins can manage business event types" ON business_event_types;

-- Single SELECT policy
CREATE POLICY "Business event types are viewable by everyone" ON business_event_types
  FOR SELECT USING (true);

-- Separate admin policies for modification
CREATE POLICY "Admins can insert business event types" ON business_event_types
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "Admins can update business event types" ON business_event_types
  FOR UPDATE USING (is_admin());

CREATE POLICY "Admins can delete business event types" ON business_event_types
  FOR DELETE USING (is_admin());

-- ============================================
-- BUSINESS_EVENTS TABLE
-- ============================================
DROP POLICY IF EXISTS "Business owners can create events for their business" ON business_events;
DROP POLICY IF EXISTS "Business owners can update their business events" ON business_events;
DROP POLICY IF EXISTS "Business owners can delete their business events" ON business_events;

CREATE POLICY "Business owners can create events for their business" ON business_events
  FOR INSERT WITH CHECK (
    (select auth.uid()) IS NOT NULL AND (
      EXISTS (
        SELECT 1 FROM businesses
        WHERE id = business_id AND owner_id = (select auth.uid())
      )
      OR is_admin()
    )
  );

CREATE POLICY "Business owners can update their business events" ON business_events
  FOR UPDATE USING (
    (select auth.uid()) IS NOT NULL AND (
      EXISTS (
        SELECT 1 FROM businesses
        WHERE id = business_id AND owner_id = (select auth.uid())
      )
      OR is_admin()
    )
  );

CREATE POLICY "Business owners can delete their business events" ON business_events
  FOR DELETE USING (
    (select auth.uid()) IS NOT NULL AND (
      EXISTS (
        SELECT 1 FROM businesses
        WHERE id = business_id AND owner_id = (select auth.uid())
      )
      OR is_admin()
    )
  );

-- ============================================
-- EVENT_INTERESTS TABLE
-- ============================================
DROP POLICY IF EXISTS "Users can add their own interest" ON event_interests;
DROP POLICY IF EXISTS "Users can remove their own interest" ON event_interests;

CREATE POLICY "Users can add their own interest" ON event_interests
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can remove their own interest" ON event_interests
  FOR DELETE USING ((select auth.uid()) = user_id);

-- ============================================
-- TOURISM_CATEGORIES TABLE
-- Fix multiple_permissive_policies
-- ============================================
DROP POLICY IF EXISTS "Tourism categories viewable by everyone" ON tourism_categories;
DROP POLICY IF EXISTS "Tourism categories manageable by admins" ON tourism_categories;

-- Single SELECT policy
CREATE POLICY "Tourism categories viewable by everyone" ON tourism_categories
  FOR SELECT USING (true);

-- Separate admin policies for modification
CREATE POLICY "Admins can insert tourism categories" ON tourism_categories
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "Admins can update tourism categories" ON tourism_categories
  FOR UPDATE USING (is_admin());

CREATE POLICY "Admins can delete tourism categories" ON tourism_categories
  FOR DELETE USING (is_admin());

-- ============================================
-- TOURISM_EXPERIENCES TABLE
-- ============================================
DROP POLICY IF EXISTS "Operators can insert own experiences" ON tourism_experiences;
DROP POLICY IF EXISTS "Operators can update own experiences" ON tourism_experiences;
DROP POLICY IF EXISTS "Operators can delete own experiences" ON tourism_experiences;

CREATE POLICY "Operators can insert own experiences" ON tourism_experiences
  FOR INSERT WITH CHECK ((select auth.uid()) = operator_id OR is_admin());

CREATE POLICY "Operators can update own experiences" ON tourism_experiences
  FOR UPDATE USING ((select auth.uid()) = operator_id OR is_admin());

CREATE POLICY "Operators can delete own experiences" ON tourism_experiences
  FOR DELETE USING ((select auth.uid()) = operator_id OR is_admin());

-- ============================================
-- TOURISM_PHOTOS TABLE
-- Fix auth_rls_initplan and multiple_permissive_policies
-- ============================================
DROP POLICY IF EXISTS "Tourism photos viewable by everyone" ON tourism_photos;
DROP POLICY IF EXISTS "Operators can manage own experience photos" ON tourism_photos;

-- Single SELECT policy
CREATE POLICY "Tourism photos viewable by everyone" ON tourism_photos
  FOR SELECT USING (true);

-- Separate policies for modification
CREATE POLICY "Operators can insert own experience photos" ON tourism_photos
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM tourism_experiences
      WHERE id = tourism_photos.experience_id
      AND (operator_id = (select auth.uid()) OR is_admin())
    )
  );

CREATE POLICY "Operators can update own experience photos" ON tourism_photos
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM tourism_experiences
      WHERE id = tourism_photos.experience_id
      AND (operator_id = (select auth.uid()) OR is_admin())
    )
  );

CREATE POLICY "Operators can delete own experience photos" ON tourism_photos
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM tourism_experiences
      WHERE id = tourism_photos.experience_id
      AND (operator_id = (select auth.uid()) OR is_admin())
    )
  );

-- ============================================
-- TOURISM_REVIEWS TABLE
-- ============================================
DROP POLICY IF EXISTS "Users can insert own reviews" ON tourism_reviews;
DROP POLICY IF EXISTS "Users can update own reviews" ON tourism_reviews;
DROP POLICY IF EXISTS "Users can delete own reviews" ON tourism_reviews;

CREATE POLICY "Users can insert own reviews" ON tourism_reviews
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own reviews" ON tourism_reviews
  FOR UPDATE USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own reviews" ON tourism_reviews
  FOR DELETE USING ((select auth.uid()) = user_id OR is_admin());

-- ============================================
-- TOURISM_INQUIRY_CLICKS TABLE
-- ============================================
DROP POLICY IF EXISTS "Operators can view own experience clicks" ON tourism_inquiry_clicks;

CREATE POLICY "Operators can view own experience clicks" ON tourism_inquiry_clicks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM tourism_experiences
      WHERE id = tourism_inquiry_clicks.experience_id
      AND (operator_id = (select auth.uid()) OR is_admin())
    )
  );

-- ============================================
-- TOURIST_PROFILES TABLE
-- ============================================
DROP POLICY IF EXISTS "Users can view own tourist profile" ON tourist_profiles;
DROP POLICY IF EXISTS "Users can insert own tourist profile" ON tourist_profiles;
DROP POLICY IF EXISTS "Users can update own tourist profile" ON tourist_profiles;

CREATE POLICY "Users can view own tourist profile" ON tourist_profiles
  FOR SELECT USING ((select auth.uid()) = id OR is_admin());

CREATE POLICY "Users can insert own tourist profile" ON tourist_profiles
  FOR INSERT WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Users can update own tourist profile" ON tourist_profiles
  FOR UPDATE USING ((select auth.uid()) = id);

-- ============================================
-- TOURISM_SAVED_EXPERIENCES TABLE
-- ============================================
DROP POLICY IF EXISTS "Users can view own saved experiences" ON tourism_saved_experiences;
DROP POLICY IF EXISTS "Users can save experiences" ON tourism_saved_experiences;
DROP POLICY IF EXISTS "Users can unsave experiences" ON tourism_saved_experiences;

CREATE POLICY "Users can view own saved experiences" ON tourism_saved_experiences
  FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can save experiences" ON tourism_saved_experiences
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can unsave experiences" ON tourism_saved_experiences
  FOR DELETE USING ((select auth.uid()) = user_id);

-- ============================================
-- REVIEW_HELPFUL_VOTES TABLE
-- ============================================
DROP POLICY IF EXISTS "Authenticated users can vote on reviews" ON review_helpful_votes;
DROP POLICY IF EXISTS "Users can update their own votes" ON review_helpful_votes;
DROP POLICY IF EXISTS "Users can delete their own votes" ON review_helpful_votes;

CREATE POLICY "Authenticated users can vote on reviews" ON review_helpful_votes
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own votes" ON review_helpful_votes
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own votes" ON review_helpful_votes
  FOR DELETE TO authenticated
  USING ((select auth.uid()) = user_id);

-- ============================================
-- REVIEW_RESPONSES TABLE
-- ============================================
DROP POLICY IF EXISTS "Authenticated users can create responses for their businesses" ON review_responses;
DROP POLICY IF EXISTS "Business owners can update their own responses" ON review_responses;
DROP POLICY IF EXISTS "Business owners can delete their own responses" ON review_responses;

CREATE POLICY "Authenticated users can create responses for their businesses" ON review_responses
  FOR INSERT TO authenticated
  WITH CHECK (
    (select auth.uid()) = user_id AND
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = business_id
      AND businesses.owner_id = (select auth.uid())
    )
  );

CREATE POLICY "Business owners can update their own responses" ON review_responses
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Business owners can delete their own responses" ON review_responses
  FOR DELETE TO authenticated
  USING ((select auth.uid()) = user_id);

-- ============================================
-- RENTAL_CATEGORIES TABLE
-- Fix multiple_permissive_policies
-- ============================================
DROP POLICY IF EXISTS "Anyone can view rental categories" ON rental_categories;
DROP POLICY IF EXISTS "Admins can manage rental categories" ON rental_categories;

-- Single SELECT policy
CREATE POLICY "Anyone can view rental categories" ON rental_categories
  FOR SELECT USING (true);

-- Separate admin policies for modification
CREATE POLICY "Admins can insert rental categories" ON rental_categories
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "Admins can update rental categories" ON rental_categories
  FOR UPDATE USING (is_admin());

CREATE POLICY "Admins can delete rental categories" ON rental_categories
  FOR DELETE USING (is_admin());

-- ============================================
-- RENTALS TABLE
-- ============================================
DROP POLICY IF EXISTS "Anyone can view approved rentals" ON rentals;
DROP POLICY IF EXISTS "Landlords can create rentals" ON rentals;
DROP POLICY IF EXISTS "Landlords can update own rentals" ON rentals;
DROP POLICY IF EXISTS "Landlords can delete own rentals" ON rentals;

CREATE POLICY "Anyone can view approved rentals" ON rentals
  FOR SELECT USING (is_approved = true OR landlord_id = (select auth.uid()) OR is_admin());

CREATE POLICY "Landlords can create rentals" ON rentals
  FOR INSERT WITH CHECK ((select auth.uid()) = landlord_id);

CREATE POLICY "Landlords can update own rentals" ON rentals
  FOR UPDATE USING ((select auth.uid()) = landlord_id OR is_admin());

CREATE POLICY "Landlords can delete own rentals" ON rentals
  FOR DELETE USING ((select auth.uid()) = landlord_id OR is_admin());

-- ============================================
-- RENTAL_PHOTOS TABLE
-- Fix auth_rls_initplan and multiple_permissive_policies
-- ============================================
DROP POLICY IF EXISTS "Anyone can view rental photos for approved rentals" ON rental_photos;
DROP POLICY IF EXISTS "Landlords can insert photos to own rentals" ON rental_photos;
DROP POLICY IF EXISTS "Landlords can update own rental photos" ON rental_photos;
DROP POLICY IF EXISTS "Landlords can delete own rental photos" ON rental_photos;
DROP POLICY IF EXISTS "Admins can manage all rental photos" ON rental_photos;

-- Single SELECT policy
CREATE POLICY "Anyone can view rental photos for approved rentals" ON rental_photos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM rentals
      WHERE rentals.id = rental_photos.rental_id
      AND (rentals.is_approved = true OR rentals.landlord_id = (select auth.uid()) OR is_admin())
    )
  );

-- Insert policy
CREATE POLICY "Landlords can insert photos to own rentals" ON rental_photos
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM rentals
      WHERE rentals.id = rental_photos.rental_id
      AND (rentals.landlord_id = (select auth.uid()) OR is_admin())
    )
  );

-- Update policy
CREATE POLICY "Landlords can update own rental photos" ON rental_photos
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM rentals
      WHERE rentals.id = rental_photos.rental_id
      AND (rentals.landlord_id = (select auth.uid()) OR is_admin())
    )
  );

-- Delete policy
CREATE POLICY "Landlords can delete own rental photos" ON rental_photos
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM rentals
      WHERE rentals.id = rental_photos.rental_id
      AND (rentals.landlord_id = (select auth.uid()) OR is_admin())
    )
  );

-- ============================================
-- RENTAL_REVIEWS TABLE
-- ============================================
DROP POLICY IF EXISTS "Authenticated users can create reviews" ON rental_reviews;
DROP POLICY IF EXISTS "Users can update own reviews" ON rental_reviews;
DROP POLICY IF EXISTS "Users can delete own reviews" ON rental_reviews;

CREATE POLICY "Authenticated users can create reviews" ON rental_reviews
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own reviews" ON rental_reviews
  FOR UPDATE USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own reviews" ON rental_reviews
  FOR DELETE USING ((select auth.uid()) = user_id OR is_admin());

-- ============================================
-- RENTAL_REVIEW_PHOTOS TABLE
-- Fix multiple_permissive_policies
-- ============================================
DROP POLICY IF EXISTS "Anyone can view rental review photos" ON rental_review_photos;
DROP POLICY IF EXISTS "Review authors can manage review photos" ON rental_review_photos;

-- Single SELECT policy
CREATE POLICY "Anyone can view rental review photos" ON rental_review_photos
  FOR SELECT USING (true);

-- Separate policies for modification
CREATE POLICY "Review authors can insert review photos" ON rental_review_photos
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM rental_reviews
      WHERE rental_reviews.id = rental_review_photos.review_id
      AND rental_reviews.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Review authors can update review photos" ON rental_review_photos
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM rental_reviews
      WHERE rental_reviews.id = rental_review_photos.review_id
      AND rental_reviews.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Review authors can delete review photos" ON rental_review_photos
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM rental_reviews
      WHERE rental_reviews.id = rental_review_photos.review_id
      AND rental_reviews.user_id = (select auth.uid())
    )
  );

-- ============================================
-- RENTAL_REVIEW_HELPFUL_VOTES TABLE
-- ============================================
DROP POLICY IF EXISTS "Authenticated users can vote on reviews" ON rental_review_helpful_votes;
DROP POLICY IF EXISTS "Users can update own votes" ON rental_review_helpful_votes;
DROP POLICY IF EXISTS "Users can delete own votes" ON rental_review_helpful_votes;

CREATE POLICY "Authenticated users can vote on reviews" ON rental_review_helpful_votes
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own votes" ON rental_review_helpful_votes
  FOR UPDATE USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own votes" ON rental_review_helpful_votes
  FOR DELETE USING ((select auth.uid()) = user_id);

-- ============================================
-- RENTAL_REVIEW_RESPONSES TABLE
-- ============================================
DROP POLICY IF EXISTS "Landlords can respond to reviews on own rentals" ON rental_review_responses;
DROP POLICY IF EXISTS "Landlords can update own responses" ON rental_review_responses;
DROP POLICY IF EXISTS "Landlords can delete own responses" ON rental_review_responses;

CREATE POLICY "Landlords can respond to reviews on own rentals" ON rental_review_responses
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM rentals
      WHERE rentals.id = rental_review_responses.rental_id
      AND rentals.landlord_id = (select auth.uid())
    )
  );

CREATE POLICY "Landlords can update own responses" ON rental_review_responses
  FOR UPDATE USING ((select auth.uid()) = user_id OR is_admin());

CREATE POLICY "Landlords can delete own responses" ON rental_review_responses
  FOR DELETE USING ((select auth.uid()) = user_id OR is_admin());

-- ============================================
-- RENTAL_INQUIRY_CLICKS TABLE
-- ============================================
DROP POLICY IF EXISTS "Users can view own inquiry clicks" ON rental_inquiry_clicks;

CREATE POLICY "Users can view own inquiry clicks" ON rental_inquiry_clicks
  FOR SELECT USING ((select auth.uid()) = user_id OR is_admin());

-- ============================================
-- RENTAL_SAVED TABLE
-- ============================================
DROP POLICY IF EXISTS "Users can view own saved rentals" ON rental_saved;
DROP POLICY IF EXISTS "Users can save rentals" ON rental_saved;
DROP POLICY IF EXISTS "Users can update own saved rentals" ON rental_saved;
DROP POLICY IF EXISTS "Users can unsave rentals" ON rental_saved;

CREATE POLICY "Users can view own saved rentals" ON rental_saved
  FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can save rentals" ON rental_saved
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own saved rentals" ON rental_saved
  FOR UPDATE USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can unsave rentals" ON rental_saved
  FOR DELETE USING ((select auth.uid()) = user_id);

-- ============================================
-- RENTAL_FLAGS TABLE
-- ============================================
DROP POLICY IF EXISTS "Users can flag rentals" ON rental_flags;
DROP POLICY IF EXISTS "Users can update own flags" ON rental_flags;
DROP POLICY IF EXISTS "Users can delete own flags" ON rental_flags;

CREATE POLICY "Users can flag rentals" ON rental_flags
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own flags" ON rental_flags
  FOR UPDATE USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own flags" ON rental_flags
  FOR DELETE USING ((select auth.uid()) = user_id OR is_admin());

-- ============================================
-- SAVED_BUSINESSES TABLE
-- ============================================
DROP POLICY IF EXISTS "Users can view their own saved businesses" ON saved_businesses;
DROP POLICY IF EXISTS "Users can save businesses" ON saved_businesses;
DROP POLICY IF EXISTS "Users can unsave businesses" ON saved_businesses;

CREATE POLICY "Users can view their own saved businesses" ON saved_businesses
  FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can save businesses" ON saved_businesses
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can unsave businesses" ON saved_businesses
  FOR DELETE USING ((select auth.uid()) = user_id);

-- ============================================
-- FOLLOWED_CATEGORIES TABLE
-- ============================================
DROP POLICY IF EXISTS "Users can view own followed categories" ON followed_categories;
DROP POLICY IF EXISTS "Users can follow categories" ON followed_categories;
DROP POLICY IF EXISTS "Users can unfollow categories" ON followed_categories;

CREATE POLICY "Users can view own followed categories" ON followed_categories
  FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can follow categories" ON followed_categories
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can unfollow categories" ON followed_categories
  FOR DELETE USING ((select auth.uid()) = user_id);

-- ============================================
-- PHOTO_FLAGS TABLE
-- Fix multiple_permissive_policies
-- ============================================
DROP POLICY IF EXISTS "Users can flag photos" ON photo_flags;
DROP POLICY IF EXISTS "Users can view their own flags" ON photo_flags;
DROP POLICY IF EXISTS "Admins can view all flags" ON photo_flags;

CREATE POLICY "Users can flag photos" ON photo_flags
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

-- Single SELECT policy combining user's own flags and admin access
CREATE POLICY "Users can view own flags, admins can view all" ON photo_flags
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id OR is_admin());
