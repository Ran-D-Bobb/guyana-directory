-- Photo Flagging System
-- Allows users to flag inappropriate photos for admin review

-- Add flagging columns to business_photos table
ALTER TABLE business_photos
ADD COLUMN IF NOT EXISTS flag_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_flagged boolean DEFAULT false;

-- Create photo_flags table to track who flagged which photos
CREATE TABLE IF NOT EXISTS photo_flags (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  photo_id uuid NOT NULL REFERENCES business_photos(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now() NOT NULL,
  -- Each user can only flag a photo once
  UNIQUE(photo_id, user_id)
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_photo_flags_photo_id ON photo_flags(photo_id);
CREATE INDEX IF NOT EXISTS idx_photo_flags_user_id ON photo_flags(user_id);
CREATE INDEX IF NOT EXISTS idx_photo_flags_created_at ON photo_flags(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_business_photos_is_flagged ON business_photos(is_flagged) WHERE is_flagged = true;

-- Enable RLS on photo_flags
ALTER TABLE photo_flags ENABLE ROW LEVEL SECURITY;

-- Users can flag photos (insert their own flags)
CREATE POLICY "Users can flag photos"
  ON photo_flags
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can view their own flags
CREATE POLICY "Users can view their own flags"
  ON photo_flags
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins can view all flags
CREATE POLICY "Admins can view all flags"
  ON photo_flags
  FOR SELECT
  TO authenticated
  USING (is_admin());

-- Admins can delete flags (when dismissing)
CREATE POLICY "Admins can delete flags"
  ON photo_flags
  FOR DELETE
  TO authenticated
  USING (is_admin());

-- Function to flag a photo and update the flag count
CREATE OR REPLACE FUNCTION flag_photo(p_photo_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_new_flag_count integer;
  v_existing_flag uuid;
BEGIN
  -- Get current user
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Check if user already flagged this photo
  SELECT id INTO v_existing_flag
  FROM photo_flags
  WHERE photo_id = p_photo_id AND user_id = v_user_id;

  IF v_existing_flag IS NOT NULL THEN
    RETURN json_build_object('success', false, 'error', 'Already flagged');
  END IF;

  -- Insert the flag
  INSERT INTO photo_flags (photo_id, user_id)
  VALUES (p_photo_id, v_user_id);

  -- Update the flag count and set is_flagged
  UPDATE business_photos
  SET
    flag_count = COALESCE(flag_count, 0) + 1,
    is_flagged = true
  WHERE id = p_photo_id
  RETURNING flag_count INTO v_new_flag_count;

  RETURN json_build_object('success', true, 'flag_count', v_new_flag_count);
END;
$$;

-- Function for admins to dismiss flags on a photo
CREATE OR REPLACE FUNCTION dismiss_photo_flags(p_photo_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user is admin
  IF NOT is_admin() THEN
    RETURN json_build_object('success', false, 'error', 'Not authorized');
  END IF;

  -- Delete all flags for this photo
  DELETE FROM photo_flags WHERE photo_id = p_photo_id;

  -- Reset the flag count and is_flagged status
  UPDATE business_photos
  SET
    flag_count = 0,
    is_flagged = false
  WHERE id = p_photo_id;

  RETURN json_build_object('success', true);
END;
$$;

-- Add 'flag' action to admin_action enum if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'flag' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'admin_action')) THEN
    ALTER TYPE admin_action ADD VALUE 'flag';
  END IF;
END
$$;

-- Comments for documentation
COMMENT ON TABLE photo_flags IS 'Tracks user flags on business photos for admin review';
COMMENT ON COLUMN business_photos.flag_count IS 'Number of times this photo has been flagged';
COMMENT ON COLUMN business_photos.is_flagged IS 'Whether this photo is currently flagged for review';
COMMENT ON FUNCTION flag_photo IS 'Allows authenticated users to flag a photo as inappropriate';
COMMENT ON FUNCTION dismiss_photo_flags IS 'Allows admins to dismiss all flags on a photo';
