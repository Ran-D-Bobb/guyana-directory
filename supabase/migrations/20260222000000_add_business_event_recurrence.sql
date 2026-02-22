-- Add recurrence support to business_events
-- Events can be one-time or recurring (daily, weekly, biweekly, monthly)

ALTER TABLE public.business_events
  ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS recurrence_pattern TEXT,
  ADD COLUMN IF NOT EXISTS recurrence_days INTEGER[],
  ADD COLUMN IF NOT EXISTS recurrence_end_date TIMESTAMPTZ;

-- Add constraint for valid recurrence patterns (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'valid_recurrence_pattern'
  ) THEN
    ALTER TABLE public.business_events
      ADD CONSTRAINT valid_recurrence_pattern
      CHECK (
        recurrence_pattern IS NULL
        OR recurrence_pattern IN ('daily', 'weekly', 'biweekly', 'monthly')
      );
  END IF;
END $$;

-- Ensure recurrence fields are consistent (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'recurrence_fields_consistent'
  ) THEN
    ALTER TABLE public.business_events
      ADD CONSTRAINT recurrence_fields_consistent
      CHECK (
        (is_recurring = FALSE AND recurrence_pattern IS NULL)
        OR (is_recurring = TRUE AND recurrence_pattern IS NOT NULL)
      );
  END IF;
END $$;

-- Index for querying recurring events
CREATE INDEX IF NOT EXISTS idx_business_events_is_recurring
  ON public.business_events(is_recurring);
