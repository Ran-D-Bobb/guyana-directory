-- Add region_id column to events table
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS region_id UUID REFERENCES public.regions(id) ON DELETE SET NULL;

-- Create index for region_id for better query performance
CREATE INDEX IF NOT EXISTS idx_events_region_id ON public.events(region_id);

-- Add comment to document the column
COMMENT ON COLUMN public.events.region_id IS 'Links event to a geographic region in Guyana';
