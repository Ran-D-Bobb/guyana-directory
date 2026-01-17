-- Fix function search_path security warnings
-- All functions need SET search_path = public to prevent search_path manipulation attacks

-- ============================================
-- CORE BUSINESS FUNCTIONS
-- ============================================

CREATE OR REPLACE FUNCTION update_business_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE businesses
  SET
    rating = (
      SELECT COALESCE(ROUND(AVG(rating)::numeric, 1), 0)
      FROM reviews
      WHERE business_id = COALESCE(NEW.business_id, OLD.business_id)
    ),
    review_count = (
      SELECT COUNT(*)
      FROM reviews
      WHERE business_id = COALESCE(NEW.business_id, OLD.business_id)
    )
  WHERE id = COALESCE(NEW.business_id, OLD.business_id);

  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION increment_whatsapp_clicks(business_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE businesses
  SET whatsapp_clicks = whatsapp_clicks + 1
  WHERE id = business_id;
END;
$$;

CREATE OR REPLACE FUNCTION increment_view_count(business_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE businesses
  SET view_count = view_count + 1
  WHERE id = business_id;
END;
$$;

-- ============================================
-- AUTH & ADMIN FUNCTIONS
-- ============================================

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_email TEXT;
BEGIN
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = auth.uid();

  IF user_email IS NULL THEN
    RETURN false;
  END IF;

  RETURN EXISTS (
    SELECT 1
    FROM admin_emails
    WHERE email = user_email
  );
END;
$$;

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO profiles (id, email, name, photo)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

-- ============================================
-- EVENTS FUNCTIONS
-- ============================================

CREATE OR REPLACE FUNCTION update_events_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION increment_event_views(event_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE events
  SET view_count = view_count + 1
  WHERE id = event_id;
END;
$$;

CREATE OR REPLACE FUNCTION increment_event_whatsapp_clicks(event_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE events
  SET whatsapp_clicks = whatsapp_clicks + 1
  WHERE id = event_id;
END;
$$;

CREATE OR REPLACE FUNCTION update_business_events_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION increment_business_event_views(business_event_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE business_events
  SET view_count = view_count + 1
  WHERE id = business_event_id;
END;
$$;

CREATE OR REPLACE FUNCTION increment_event_interest_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  UPDATE events
  SET interest_count = interest_count + 1
  WHERE id = NEW.event_id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION decrement_event_interest_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  UPDATE events
  SET interest_count = GREATEST(interest_count - 1, 0)
  WHERE id = OLD.event_id;
  RETURN OLD;
END;
$$;

-- ============================================
-- TOURISM FUNCTIONS
-- ============================================

CREATE OR REPLACE FUNCTION update_tourism_experience_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
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
$$;

CREATE OR REPLACE FUNCTION increment_tourism_inquiry()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  UPDATE tourism_experiences
  SET
    whatsapp_clicks = whatsapp_clicks + 1,
    booking_inquiry_count = booking_inquiry_count + 1
  WHERE id = NEW.experience_id;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION increment_tourism_view_count(experience_id UUID)
RETURNS void
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  UPDATE tourism_experiences
  SET view_count = view_count + 1
  WHERE id = experience_id;
END;
$$;

CREATE OR REPLACE FUNCTION update_tourism_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ============================================
-- REVIEW FUNCTIONS
-- ============================================

CREATE OR REPLACE FUNCTION update_review_helpful_counts()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.is_helpful THEN
      UPDATE reviews SET helpful_count = helpful_count + 1 WHERE id = NEW.review_id;
    ELSE
      UPDATE reviews SET not_helpful_count = not_helpful_count + 1 WHERE id = NEW.review_id;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.is_helpful != NEW.is_helpful THEN
      IF NEW.is_helpful THEN
        UPDATE reviews SET helpful_count = helpful_count + 1, not_helpful_count = not_helpful_count - 1 WHERE id = NEW.review_id;
      ELSE
        UPDATE reviews SET helpful_count = helpful_count - 1, not_helpful_count = not_helpful_count + 1 WHERE id = NEW.review_id;
      END IF;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.is_helpful THEN
      UPDATE reviews SET helpful_count = helpful_count - 1 WHERE id = OLD.review_id;
    ELSE
      UPDATE reviews SET not_helpful_count = not_helpful_count - 1 WHERE id = OLD.review_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- ============================================
-- RENTAL FUNCTIONS
-- ============================================

CREATE OR REPLACE FUNCTION update_rental_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION update_rental_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_rental_id UUID;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_rental_id := OLD.rental_id;
  ELSE
    v_rental_id := NEW.rental_id;
  END IF;

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
$$;

CREATE OR REPLACE FUNCTION update_rental_review_helpful_counts()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_review_id UUID;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_review_id := OLD.review_id;
  ELSE
    v_review_id := NEW.review_id;
  END IF;

  UPDATE rental_reviews
  SET
    helpful_count = COALESCE((SELECT COUNT(*) FROM rental_review_helpful_votes WHERE review_id = v_review_id AND is_helpful = TRUE), 0),
    not_helpful_count = COALESCE((SELECT COUNT(*) FROM rental_review_helpful_votes WHERE review_id = v_review_id AND is_helpful = FALSE), 0)
  WHERE id = v_review_id;

  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION increment_rental_inquiry()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  UPDATE rentals
  SET inquiry_count = inquiry_count + 1
  WHERE id = NEW.rental_id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION update_rental_save_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
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
$$;

CREATE OR REPLACE FUNCTION update_rental_flag_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_rental_id UUID;
  v_flag_count INTEGER;
  v_flag_reasons JSONB;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_rental_id := OLD.rental_id;
  ELSE
    v_rental_id := NEW.rental_id;
  END IF;

  SELECT COUNT(*) INTO v_flag_count
  FROM rental_flags
  WHERE rental_id = v_rental_id;

  SELECT jsonb_agg(
    jsonb_build_object(
      'reason', reason,
      'user_id', user_id::text,
      'timestamp', created_at
    )
  ) INTO v_flag_reasons
  FROM rental_flags
  WHERE rental_id = v_rental_id;

  UPDATE rentals
  SET
    flag_count = v_flag_count,
    is_flagged = v_flag_count > 0,
    flag_reasons = COALESCE(v_flag_reasons, '[]'::jsonb),
    is_approved = CASE WHEN v_flag_count >= 5 THEN FALSE ELSE is_approved END
  WHERE id = v_rental_id;

  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION check_rental_listing_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_listing_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_listing_count
  FROM rentals
  WHERE landlord_id = NEW.landlord_id;

  IF v_listing_count >= 1 THEN
    RAISE EXCEPTION 'Free users can only have 1 active rental listing. Upgrade to Premium for unlimited listings.';
  END IF;

  RETURN NEW;
END;
$$;

-- ============================================
-- REVIEWER BADGE FUNCTIONS
-- ============================================

CREATE OR REPLACE FUNCTION get_reviewer_badge(p_review_count integer)
RETURNS reviewer_badge
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
BEGIN
    IF p_review_count IS NULL OR p_review_count = 0 THEN
        RETURN NULL;
    ELSIF p_review_count BETWEEN 1 AND 2 THEN
        RETURN 'newcomer';
    ELSIF p_review_count BETWEEN 3 AND 5 THEN
        RETURN 'contributor';
    ELSIF p_review_count BETWEEN 6 AND 9 THEN
        RETURN 'local_expert';
    ELSE
        RETURN 'top_reviewer';
    END IF;
END;
$$;

CREATE OR REPLACE FUNCTION get_reviews_to_next_badge(p_review_count integer)
RETURNS json
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
DECLARE
    current_badge text;
    next_badge text;
    reviews_needed integer;
BEGIN
    IF p_review_count IS NULL OR p_review_count = 0 THEN
        RETURN json_build_object('current_badge', null, 'next_badge', 'newcomer', 'reviews_needed', 1);
    ELSIF p_review_count BETWEEN 1 AND 2 THEN
        RETURN json_build_object('current_badge', 'newcomer', 'next_badge', 'contributor', 'reviews_needed', 3 - p_review_count);
    ELSIF p_review_count BETWEEN 3 AND 5 THEN
        RETURN json_build_object('current_badge', 'contributor', 'next_badge', 'local_expert', 'reviews_needed', 6 - p_review_count);
    ELSIF p_review_count BETWEEN 6 AND 9 THEN
        RETURN json_build_object('current_badge', 'local_expert', 'next_badge', 'top_reviewer', 'reviews_needed', 10 - p_review_count);
    ELSE
        RETURN json_build_object('current_badge', 'top_reviewer', 'next_badge', null, 'reviews_needed', 0);
    END IF;
END;
$$;

CREATE OR REPLACE FUNCTION update_profile_review_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE profiles
        SET review_count = COALESCE(review_count, 0) + 1
        WHERE id = NEW.user_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE profiles
        SET review_count = GREATEST(COALESCE(review_count, 0) - 1, 0)
        WHERE id = OLD.user_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$;

-- ============================================
-- CATEGORY FUNCTIONS
-- ============================================

CREATE OR REPLACE FUNCTION get_new_businesses_this_week(p_category_id uuid)
RETURNS integer
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT count(*)::integer
  FROM businesses
  WHERE category_id = p_category_id
    AND created_at >= now() - interval '7 days';
$$;

CREATE OR REPLACE FUNCTION get_followed_categories_with_counts(p_user_id uuid)
RETURNS TABLE (
  category_id uuid,
  category_name text,
  category_slug text,
  category_icon text,
  new_this_week integer,
  followed_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    c.id as category_id,
    c.name as category_name,
    c.slug as category_slug,
    c.icon as category_icon,
    get_new_businesses_this_week(c.id) as new_this_week,
    fc.created_at as followed_at
  FROM followed_categories fc
  JOIN categories c ON c.id = fc.category_id
  WHERE fc.user_id = p_user_id
  ORDER BY fc.created_at desc;
$$;

-- ============================================
-- REGION FUNCTIONS
-- ============================================

CREATE OR REPLACE FUNCTION get_region_with_children(region_id UUID)
RETURNS TABLE (id UUID)
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT r.id FROM regions r WHERE r.id = region_id
  UNION
  SELECT r.id FROM regions r WHERE r.parent_region_id = region_id;
END;
$$;

CREATE OR REPLACE FUNCTION reorder_category(
  category_id UUID,
  new_order INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  old_order INTEGER;
BEGIN
  SELECT display_order INTO old_order FROM categories WHERE id = category_id;

  IF old_order IS NULL THEN
    RAISE EXCEPTION 'Category not found';
  END IF;

  IF old_order = new_order THEN
    RETURN;
  END IF;

  IF new_order < old_order THEN
    UPDATE categories
    SET display_order = display_order + 1
    WHERE display_order >= new_order AND display_order < old_order AND id != category_id;
  ELSE
    UPDATE categories
    SET display_order = display_order - 1
    WHERE display_order > old_order AND display_order <= new_order AND id != category_id;
  END IF;

  UPDATE categories SET display_order = new_order WHERE id = category_id;
END;
$$;

CREATE OR REPLACE FUNCTION reorder_region(
  region_id UUID,
  new_order INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  old_order INTEGER;
BEGIN
  SELECT display_order INTO old_order FROM regions WHERE id = region_id;

  IF old_order IS NULL THEN
    RAISE EXCEPTION 'Region not found';
  END IF;

  IF old_order = new_order THEN
    RETURN;
  END IF;

  IF new_order < old_order THEN
    UPDATE regions
    SET display_order = display_order + 1
    WHERE display_order >= new_order AND display_order < old_order AND id != region_id;
  ELSE
    UPDATE regions
    SET display_order = display_order - 1
    WHERE display_order > old_order AND display_order <= new_order AND id != region_id;
  END IF;

  UPDATE regions SET display_order = new_order WHERE id = region_id;
END;
$$;

-- ============================================
-- PHOTO FLAG FUNCTIONS
-- ============================================

CREATE OR REPLACE FUNCTION flag_photo(p_photo_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_new_flag_count integer;
  v_existing_flag uuid;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  SELECT id INTO v_existing_flag
  FROM photo_flags
  WHERE photo_id = p_photo_id AND user_id = v_user_id;

  IF v_existing_flag IS NOT NULL THEN
    RETURN json_build_object('success', false, 'error', 'Already flagged');
  END IF;

  INSERT INTO photo_flags (photo_id, user_id)
  VALUES (p_photo_id, v_user_id);

  UPDATE business_photos
  SET
    flag_count = COALESCE(flag_count, 0) + 1,
    is_flagged = true
  WHERE id = p_photo_id
  RETURNING flag_count INTO v_new_flag_count;

  RETURN json_build_object('success', true, 'flag_count', v_new_flag_count);
END;
$$;

CREATE OR REPLACE FUNCTION dismiss_photo_flags(p_photo_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT is_admin() THEN
    RETURN json_build_object('success', false, 'error', 'Not authorized');
  END IF;

  DELETE FROM photo_flags WHERE photo_id = p_photo_id;

  UPDATE business_photos
  SET
    flag_count = 0,
    is_flagged = false
  WHERE id = p_photo_id;

  RETURN json_build_object('success', true);
END;
$$;
