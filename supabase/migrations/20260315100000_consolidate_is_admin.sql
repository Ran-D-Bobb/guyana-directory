-- Consolidate is_admin() to use only auth.users table lookup (never JWT claims)
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

-- Ensure admin_emails table has RLS enabled and restricted access
ALTER TABLE IF EXISTS public.admin_emails ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.admin_emails FROM authenticated, anon;
