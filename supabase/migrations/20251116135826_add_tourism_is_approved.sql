-- Add is_approved field to tourism_experiences table for admin approval queue
-- New experiences created by operators will be pending approval by default

ALTER TABLE public.tourism_experiences
ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT FALSE;

-- Update existing experiences to be approved by default (grandfathered in)
UPDATE public.tourism_experiences
SET is_approved = TRUE
WHERE is_approved IS NULL;

-- Add index for efficient filtering by approval status
CREATE INDEX IF NOT EXISTS idx_tourism_experiences_is_approved
ON public.tourism_experiences(is_approved);

-- Add comment to explain the field
COMMENT ON COLUMN public.tourism_experiences.is_approved IS 'Admin approval status. New experiences created by operators default to FALSE and require admin approval before being publicly visible.';
