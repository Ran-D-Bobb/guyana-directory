-- Add region_id column to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS region_id UUID REFERENCES public.regions(id) ON DELETE SET NULL;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_events_region_id ON public.events(region_id);

-- Add comment
COMMENT ON COLUMN events.region_id IS 'Geographic region where the event is taking place';
