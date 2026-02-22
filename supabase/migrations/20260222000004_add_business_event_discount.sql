-- Add discount_amount column to business_events
-- This was referenced in the create form but missing from the schema
ALTER TABLE public.business_events
  ADD COLUMN IF NOT EXISTS discount_amount INTEGER;
