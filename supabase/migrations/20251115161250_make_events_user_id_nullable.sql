-- Make user_id nullable in events table to allow admin/public events

-- Alter the events table to make user_id nullable
ALTER TABLE events ALTER COLUMN user_id DROP NOT NULL;

-- Update RLS policies to handle NULL user_id
-- Drop the old policy
DROP POLICY IF EXISTS "Users can update their own events" ON events;

-- Recreate with NULL handling
CREATE POLICY "Users can update their own events"
  ON events
  FOR UPDATE
  USING (auth.uid() = user_id OR is_admin());

-- Drop the old delete policy
DROP POLICY IF EXISTS "Users can delete their own events" ON events;

-- Recreate with NULL handling
CREATE POLICY "Users can delete their own events"
  ON events
  FOR DELETE
  USING (auth.uid() = user_id OR is_admin());

-- Add comment explaining NULL user_id
COMMENT ON COLUMN events.user_id IS 'User who created the event. NULL for admin-created public events.';
