-- Create saved_businesses table for user favorites
CREATE TABLE IF NOT EXISTS saved_businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, business_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_saved_businesses_user_id ON saved_businesses(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_businesses_business_id ON saved_businesses(business_id);

-- Enable RLS
ALTER TABLE saved_businesses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for saved_businesses
-- Users can view their own saved businesses
CREATE POLICY "Users can view their own saved businesses"
  ON saved_businesses
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can add businesses to their favorites
CREATE POLICY "Users can save businesses"
  ON saved_businesses
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can remove businesses from their favorites
CREATE POLICY "Users can unsave businesses"
  ON saved_businesses
  FOR DELETE
  USING (auth.uid() = user_id);
