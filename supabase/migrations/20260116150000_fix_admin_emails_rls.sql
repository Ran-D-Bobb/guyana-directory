-- Re-enable RLS on admin_emails table
-- The is_admin() function uses SECURITY DEFINER which runs as postgres (superuser),
-- bypassing RLS. So we can safely enable RLS to satisfy security requirements
-- while the function continues to work.

-- Enable RLS
ALTER TABLE public.admin_emails ENABLE ROW LEVEL SECURITY;

-- Create a restrictive policy - no direct access for regular users
-- The is_admin() SECURITY DEFINER function bypasses RLS, so it will still work
-- Only service_role can directly access this table
CREATE POLICY "No direct access to admin_emails" ON public.admin_emails
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- Revoke direct SELECT from authenticated users (is_admin() doesn't need it with SECURITY DEFINER)
REVOKE SELECT ON public.admin_emails FROM authenticated;

-- Service role and postgres superuser can still manage the table directly
