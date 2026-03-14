CREATE OR REPLACE FUNCTION public.increment_rental_view_count(rental_id uuid)
  RETURNS void
  LANGUAGE plpgsql
  SET search_path TO 'public'
AS $$
BEGIN
  UPDATE rentals
  SET view_count = view_count + 1
  WHERE id = rental_id;
END;
$$;
