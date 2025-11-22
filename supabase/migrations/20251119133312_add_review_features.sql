-- Add helpful votes table
CREATE TABLE IF NOT EXISTS review_helpful_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  is_helpful BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(review_id, user_id)
);

-- Add helpful counts to reviews table
ALTER TABLE reviews
ADD COLUMN IF NOT EXISTS helpful_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS not_helpful_count INTEGER DEFAULT 0;

-- Add business responses table
CREATE TABLE IF NOT EXISTS review_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE UNIQUE,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  response TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Function to update helpful counts
CREATE OR REPLACE FUNCTION update_review_helpful_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.is_helpful THEN
      UPDATE reviews SET helpful_count = helpful_count + 1 WHERE id = NEW.review_id;
    ELSE
      UPDATE reviews SET not_helpful_count = not_helpful_count + 1 WHERE id = NEW.review_id;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.is_helpful != NEW.is_helpful THEN
      IF NEW.is_helpful THEN
        UPDATE reviews SET helpful_count = helpful_count + 1, not_helpful_count = not_helpful_count - 1 WHERE id = NEW.review_id;
      ELSE
        UPDATE reviews SET helpful_count = helpful_count - 1, not_helpful_count = not_helpful_count + 1 WHERE id = NEW.review_id;
      END IF;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.is_helpful THEN
      UPDATE reviews SET helpful_count = helpful_count - 1 WHERE id = OLD.review_id;
    ELSE
      UPDATE reviews SET not_helpful_count = not_helpful_count - 1 WHERE id = OLD.review_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for helpful votes
DROP TRIGGER IF EXISTS trigger_update_review_helpful_counts ON review_helpful_votes;
CREATE TRIGGER trigger_update_review_helpful_counts
  AFTER INSERT OR UPDATE OR DELETE ON review_helpful_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_review_helpful_counts();

-- RLS Policies for review_helpful_votes
ALTER TABLE review_helpful_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view helpful votes"
  ON review_helpful_votes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can vote on reviews"
  ON review_helpful_votes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own votes"
  ON review_helpful_votes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own votes"
  ON review_helpful_votes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for review_responses
ALTER TABLE review_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view review responses"
  ON review_responses FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create responses for their businesses"
  ON review_responses FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = business_id
      AND businesses.owner_id = auth.uid()
    )
  );

CREATE POLICY "Business owners can update their own responses"
  ON review_responses FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Business owners can delete their own responses"
  ON review_responses FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_review_helpful_votes_review_id ON review_helpful_votes(review_id);
CREATE INDEX IF NOT EXISTS idx_review_helpful_votes_user_id ON review_helpful_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_review_responses_review_id ON review_responses(review_id);
CREATE INDEX IF NOT EXISTS idx_review_responses_business_id ON review_responses(business_id);
