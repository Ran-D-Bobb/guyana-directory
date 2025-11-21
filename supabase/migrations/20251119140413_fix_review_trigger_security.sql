-- Fix: Update business rating trigger function to run with elevated privileges
-- This allows the trigger to update the businesses table even when executed by non-owners

-- Drop the existing function
DROP FUNCTION IF EXISTS update_business_rating() CASCADE;

-- Recreate the function with SECURITY DEFINER
-- SECURITY DEFINER means the function runs with the privileges of the user who CREATED it (postgres)
-- This bypasses RLS policies that would normally block users from updating businesses they don't own
CREATE OR REPLACE FUNCTION update_business_rating()
RETURNS TRIGGER
SECURITY DEFINER -- This is the key change - run as postgres user
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
$$ LANGUAGE plpgsql;

-- Recreate the triggers (they were dropped when we dropped the function)
CREATE TRIGGER trigger_update_business_rating_insert
AFTER INSERT ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_business_rating();

CREATE TRIGGER trigger_update_business_rating_update
AFTER UPDATE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_business_rating();

CREATE TRIGGER trigger_update_business_rating_delete
AFTER DELETE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_business_rating();

-- Fix all existing businesses that have reviews but incorrect ratings
UPDATE businesses
SET
  rating = (
    SELECT COALESCE(ROUND(AVG(rating)::numeric, 1), 0)
    FROM reviews
    WHERE business_id = businesses.id
  ),
  review_count = (
    SELECT COUNT(*)
    FROM reviews
    WHERE business_id = businesses.id
  )
WHERE id IN (SELECT DISTINCT business_id FROM reviews);
