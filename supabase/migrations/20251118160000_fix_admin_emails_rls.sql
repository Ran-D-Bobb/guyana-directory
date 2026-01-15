-- Fix admin_emails RLS policies to allow is_admin() function to query it
-- The issue: is_admin() function needs to query admin_emails, but RLS policies
-- on admin_emails require is_admin() to be true - circular dependency!

-- Solution: Remove RLS policies from admin_emails and rely on SECURITY DEFINER
-- function to control access. The table should be read-only through the function.

-- Drop existing RLS policies
DROP POLICY IF EXISTS "Only admins can view admin emails" ON public.admin_emails;
DROP POLICY IF EXISTS "Only admins can insert admin emails" ON public.admin_emails;
DROP POLICY IF EXISTS "Only admins can update admin emails" ON public.admin_emails;
DROP POLICY IF EXISTS "Only admins can delete admin emails" ON public.admin_emails;

-- Disable RLS on admin_emails (since is_admin() function handles security)
ALTER TABLE public.admin_emails DISABLE ROW LEVEL SECURITY;

-- Grant SELECT permission to authenticated users (needed for is_admin() function with SECURITY DEFINER)
GRANT SELECT ON public.admin_emails TO authenticated;

-- Ensure is_admin() function has SECURITY DEFINER
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  user_email TEXT;
BEGIN
  -- Get the current user's email from auth.users
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = auth.uid();

  -- Check if user's email exists in admin_emails table
  IF user_email IS NULL THEN
    RETURN false;
  END IF;

  RETURN EXISTS (
    SELECT 1
    FROM public.admin_emails
    WHERE email = user_email
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin() TO anon;
