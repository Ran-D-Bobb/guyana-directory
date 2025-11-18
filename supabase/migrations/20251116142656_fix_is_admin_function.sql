-- Fix is_admin() function to use email-based checking
-- This aligns database RLS policies with the application's admin checking

-- Create admin_emails table to store admin email addresses
CREATE TABLE IF NOT EXISTS public.admin_emails (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  notes TEXT
);

-- Enable RLS on admin_emails table
ALTER TABLE public.admin_emails ENABLE ROW LEVEL SECURITY;

-- Only admins can read/modify admin_emails (chicken and egg, but service role can bootstrap)
CREATE POLICY "Only admins can view admin emails" ON public.admin_emails
  FOR SELECT USING (is_admin());

CREATE POLICY "Only admins can insert admin emails" ON public.admin_emails
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "Only admins can update admin emails" ON public.admin_emails
  FOR UPDATE USING (is_admin());

CREATE POLICY "Only admins can delete admin emails" ON public.admin_emails
  FOR DELETE USING (is_admin());

-- Insert admin emails from .env.local ADMIN_EMAILS
INSERT INTO public.admin_emails (email, notes)
VALUES
  ('admin@waypoint.gy', 'Primary admin'),
  ('test@example.com', 'Test admin'),
  ('hollowsn3@gmail.com', 'Admin user')
ON CONFLICT (email) DO NOTHING;

-- Update is_admin() function to check against admin_emails table
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

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin() TO anon;
