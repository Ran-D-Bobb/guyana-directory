-- Fix: all_events view was using SECURITY DEFINER (default), which bypasses RLS
-- of the querying user. Set security_invoker = true so RLS policies on the
-- underlying tables (events, business_events, businesses, etc.) are enforced
-- based on the current user's permissions.
ALTER VIEW public.all_events SET (security_invoker = true);
