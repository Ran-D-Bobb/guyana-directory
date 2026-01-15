-- Phase 9C: Reviewer Badges & Reputation System
-- Add review_count to profiles and create badge calculation function

-- Add review_count column to profiles if not exists
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS review_count integer DEFAULT 0;

-- Create index for faster badge lookups
CREATE INDEX IF NOT EXISTS idx_profiles_review_count ON profiles(review_count);

-- Create enum type for badge tiers
DO $$ BEGIN
    CREATE TYPE reviewer_badge AS ENUM ('newcomer', 'contributor', 'local_expert', 'top_reviewer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Function to calculate badge based on review count
-- Returns null for 0 reviews, otherwise appropriate badge tier
CREATE OR REPLACE FUNCTION get_reviewer_badge(p_review_count integer)
RETURNS reviewer_badge AS $$
BEGIN
    IF p_review_count IS NULL OR p_review_count = 0 THEN
        RETURN NULL;
    ELSIF p_review_count BETWEEN 1 AND 2 THEN
        RETURN 'newcomer';
    ELSIF p_review_count BETWEEN 3 AND 5 THEN
        RETURN 'contributor';
    ELSIF p_review_count BETWEEN 6 AND 9 THEN
        RETURN 'local_expert';
    ELSE -- 10+
        RETURN 'top_reviewer';
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to get reviews needed for next badge tier
CREATE OR REPLACE FUNCTION get_reviews_to_next_badge(p_review_count integer)
RETURNS json AS $$
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
    ELSE -- 10+
        RETURN json_build_object('current_badge', 'top_reviewer', 'next_badge', null, 'reviews_needed', 0);
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to update profile review count
CREATE OR REPLACE FUNCTION update_profile_review_count()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS trigger_update_profile_review_count ON reviews;

-- Create trigger to update profile review_count on review insert/delete
CREATE TRIGGER trigger_update_profile_review_count
    AFTER INSERT OR DELETE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_profile_review_count();

-- Initialize review_count for existing profiles based on their actual reviews
UPDATE profiles p
SET review_count = (
    SELECT COUNT(*)
    FROM reviews r
    WHERE r.user_id = p.id
);

-- Add comment for documentation
COMMENT ON COLUMN profiles.review_count IS 'Number of business reviews written by this user. Used for reviewer badge calculation.';
