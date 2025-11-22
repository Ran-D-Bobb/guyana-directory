-- Approve all seeded tourism experiences for kiosk display
-- This ensures all experiences are visible in the kiosk mode

UPDATE public.tourism_experiences
SET is_approved = TRUE
WHERE is_approved IS NULL OR is_approved = FALSE;
