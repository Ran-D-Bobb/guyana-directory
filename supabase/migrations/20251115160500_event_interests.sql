-- Create event_interests table for tracking user interest in events
CREATE TABLE IF NOT EXISTS event_interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- Add interest_count column to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS interest_count INTEGER DEFAULT 0;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_event_interests_event_id ON event_interests(event_id);
CREATE INDEX IF NOT EXISTS idx_event_interests_user_id ON event_interests(user_id);

-- Enable RLS
ALTER TABLE event_interests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for event_interests
-- Anyone can view interest counts
CREATE POLICY "Anyone can view event interests"
  ON event_interests
  FOR SELECT
  USING (true);

-- Users can add their own interest
CREATE POLICY "Users can add their own interest"
  ON event_interests
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can remove their own interest
CREATE POLICY "Users can remove their own interest"
  ON event_interests
  FOR DELETE
  USING (auth.uid() = user_id);

-- Function to update interest count when interest is added
CREATE OR REPLACE FUNCTION increment_event_interest_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE events
  SET interest_count = interest_count + 1
  WHERE id = NEW.event_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update interest count when interest is removed
CREATE OR REPLACE FUNCTION decrement_event_interest_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE events
  SET interest_count = GREATEST(interest_count - 1, 0)
  WHERE id = OLD.event_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Triggers to automatically update interest_count
CREATE TRIGGER on_event_interest_added
  AFTER INSERT ON event_interests
  FOR EACH ROW
  EXECUTE FUNCTION increment_event_interest_count();

CREATE TRIGGER on_event_interest_removed
  AFTER DELETE ON event_interests
  FOR EACH ROW
  EXECUTE FUNCTION decrement_event_interest_count();

-- Initialize interest_count for existing events
UPDATE events SET interest_count = 0 WHERE interest_count IS NULL;
