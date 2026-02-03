-- Device tokens for push notifications (FCM/APNs/Web Push)

CREATE TABLE device_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('android', 'ios', 'web')),
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ DEFAULT NOW(),

  -- Unique constraint per token (a token can only belong to one user)
  CONSTRAINT unique_token UNIQUE (token)
);

-- Indexes for efficient queries
CREATE INDEX idx_device_tokens_user_id ON device_tokens(user_id);
CREATE INDEX idx_device_tokens_enabled ON device_tokens(enabled) WHERE enabled = true;
CREATE INDEX idx_device_tokens_platform ON device_tokens(platform);

-- RLS policies
ALTER TABLE device_tokens ENABLE ROW LEVEL SECURITY;

-- Users can view their own tokens
CREATE POLICY "Users can view own device tokens"
  ON device_tokens FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can insert their own tokens
CREATE POLICY "Users can insert own device tokens"
  ON device_tokens FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can update their own tokens
CREATE POLICY "Users can update own device tokens"
  ON device_tokens FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Users can delete their own tokens
CREATE POLICY "Users can delete own device tokens"
  ON device_tokens FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Service role can access all tokens (for sending notifications)
CREATE POLICY "Service role can access all device tokens"
  ON device_tokens FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Notification preferences table
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,

  -- Notification types
  new_review BOOLEAN DEFAULT true,         -- When someone reviews your business
  review_reply BOOLEAN DEFAULT true,       -- When business owner replies to your review
  business_approved BOOLEAN DEFAULT true,  -- When your business listing is approved
  new_follower BOOLEAN DEFAULT true,       -- When someone follows your business
  event_reminder BOOLEAN DEFAULT true,     -- Reminder for events you're interested in
  promotions BOOLEAN DEFAULT false,        -- Marketing/promotional notifications

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for notification preferences
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own notification preferences"
  ON notification_preferences FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Function to auto-create notification preferences for new users
CREATE OR REPLACE FUNCTION create_notification_preferences()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO notification_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Trigger to create preferences when profile is created
CREATE TRIGGER on_profile_created_create_notification_prefs
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_notification_preferences();

-- Notification log table (for tracking sent notifications)
CREATE TABLE notification_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  device_token_id UUID REFERENCES device_tokens(id) ON DELETE SET NULL,
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  data JSONB,
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'failed', 'clicked')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for querying notification history
CREATE INDEX idx_notification_log_user_id ON notification_log(user_id);
CREATE INDEX idx_notification_log_created_at ON notification_log(created_at DESC);

-- RLS for notification log
ALTER TABLE notification_log ENABLE ROW LEVEL SECURITY;

-- Users can view their own notification history
CREATE POLICY "Users can view own notification log"
  ON notification_log FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Only service role can insert notification logs
CREATE POLICY "Service role can manage notification log"
  ON notification_log FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Updated at trigger for device_tokens
CREATE OR REPLACE FUNCTION update_device_token_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_device_tokens_timestamp
  BEFORE UPDATE ON device_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_device_token_timestamp();

-- Updated at trigger for notification_preferences
CREATE TRIGGER update_notification_preferences_timestamp
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_device_token_timestamp();
