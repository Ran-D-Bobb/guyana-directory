-- Create admin_audit_logs table for tracking all admin actions
-- This provides accountability and transparency for the 3-person admin team

-- Create enum for admin actions
CREATE TYPE admin_action AS ENUM (
  'create',
  'update',
  'delete',
  'verify',
  'unverify',
  'feature',
  'unfeature',
  'approve',
  'unapprove',
  'suspend',
  'ban',
  'reactivate',
  'dismiss_flag'
);

-- Create enum for entity types
CREATE TYPE admin_entity_type AS ENUM (
  'business',
  'review',
  'event',
  'tourism',
  'rental',
  'user',
  'photo',
  'category',
  'region',
  'timeline'
);

-- Create the audit logs table
CREATE TABLE admin_audit_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id uuid NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,
  action admin_action NOT NULL,
  entity_type admin_entity_type NOT NULL,
  entity_id uuid NOT NULL,
  entity_name text NOT NULL, -- Stored for display after entity deletion
  before_data jsonb DEFAULT NULL,
  after_data jsonb DEFAULT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create indexes for efficient querying
CREATE INDEX idx_audit_logs_admin_id ON admin_audit_logs(admin_id);
CREATE INDEX idx_audit_logs_action ON admin_audit_logs(action);
CREATE INDEX idx_audit_logs_entity_type ON admin_audit_logs(entity_type);
CREATE INDEX idx_audit_logs_created_at ON admin_audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_entity_id ON admin_audit_logs(entity_id);

-- Full-text search index for entity_name
CREATE INDEX idx_audit_logs_entity_name ON admin_audit_logs USING gin(to_tsvector('english', entity_name));

-- RLS Policies
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs"
  ON admin_audit_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.email = ANY(string_to_array(current_setting('app.admin_emails', true), ','))
    )
    OR
    is_admin(auth.uid())
  );

-- Only admins can insert audit logs
CREATE POLICY "Admins can insert audit logs"
  ON admin_audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.email = ANY(string_to_array(current_setting('app.admin_emails', true), ','))
    )
    OR
    is_admin(auth.uid())
  );

-- Comment on table for documentation
COMMENT ON TABLE admin_audit_logs IS 'Tracks all admin actions for accountability and audit purposes';
COMMENT ON COLUMN admin_audit_logs.entity_name IS 'Cached entity name for display after deletion';
COMMENT ON COLUMN admin_audit_logs.before_data IS 'State of entity before the action (null for create)';
COMMENT ON COLUMN admin_audit_logs.after_data IS 'State of entity after the action (null for delete)';
