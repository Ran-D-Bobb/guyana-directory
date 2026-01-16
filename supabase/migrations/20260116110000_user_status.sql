-- Add user status fields to profiles table for suspend/ban functionality
-- Part of Phase 2: User Suspend/Ban

-- Create enum for user status
CREATE TYPE user_status AS ENUM ('active', 'suspended', 'banned');

-- Add status fields to profiles table
ALTER TABLE profiles
  ADD COLUMN status user_status DEFAULT 'active' NOT NULL,
  ADD COLUMN status_reason text,
  ADD COLUMN status_expires_at timestamptz,
  ADD COLUMN status_updated_at timestamptz,
  ADD COLUMN status_updated_by uuid REFERENCES profiles(id) ON DELETE SET NULL;

-- Create index for efficient filtering by status
CREATE INDEX idx_profiles_status ON profiles(status);

-- Create index for finding expiring suspensions
CREATE INDEX idx_profiles_status_expires ON profiles(status_expires_at)
  WHERE status = 'suspended' AND status_expires_at IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN profiles.status IS 'User account status: active, suspended, or banned';
COMMENT ON COLUMN profiles.status_reason IS 'Reason provided by admin for suspension or ban';
COMMENT ON COLUMN profiles.status_expires_at IS 'Expiration timestamp for suspensions (null for permanent or banned)';
COMMENT ON COLUMN profiles.status_updated_at IS 'When the status was last changed';
COMMENT ON COLUMN profiles.status_updated_by IS 'Admin who changed the status';
