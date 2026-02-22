-- Function to get accurate rating distribution counts for a business
-- This avoids the mismatch between limited review fetches and total review counts
CREATE OR REPLACE FUNCTION get_rating_counts(p_business_id uuid)
RETURNS TABLE (
  count_1 bigint,
  count_2 bigint,
  count_3 bigint,
  count_4 bigint,
  count_5 bigint
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT
    COUNT(*) FILTER (WHERE rating = 1) AS count_1,
    COUNT(*) FILTER (WHERE rating = 2) AS count_2,
    COUNT(*) FILTER (WHERE rating = 3) AS count_3,
    COUNT(*) FILTER (WHERE rating = 4) AS count_4,
    COUNT(*) FILTER (WHERE rating = 5) AS count_5
  FROM reviews
  WHERE business_id = p_business_id;
$$;
