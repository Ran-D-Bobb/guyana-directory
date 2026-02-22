-- Add account_type column to profiles table
-- Two permanent account types: 'personal' (browse/review) and 'business' (can create listings)
-- Chosen at signup, cannot be changed afterward

-- 1. Add account_type column with default 'personal' for all existing users
ALTER TABLE profiles
  ADD COLUMN account_type TEXT NOT NULL DEFAULT 'personal'
  CHECK (account_type IN ('personal', 'business'));

-- 2. Index for efficient filtering
CREATE INDEX idx_profiles_account_type ON profiles(account_type);

-- 3. Update profile creation trigger to read account_type from signup metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, photo, account_type)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE(
      CASE
        WHEN NEW.raw_user_meta_data->>'account_type' IN ('personal', 'business')
        THEN NEW.raw_user_meta_data->>'account_type'
        ELSE NULL
      END,
      'personal'
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Replace business INSERT RLS policy to enforce account type
DROP POLICY IF EXISTS "Authenticated users and admins can create businesses" ON businesses;

CREATE POLICY "Business accounts and admins can create businesses" ON businesses
  FOR INSERT WITH CHECK (
    (
      (select auth.uid()) = owner_id
      AND (select auth.uid()) IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = (select auth.uid())
        AND profiles.account_type = 'business'
      )
    )
    OR is_admin()
  );

-- 5. Prevent account_type changes after creation
-- Exception: allows OAuth callback to set type within 2 minutes of profile creation
CREATE OR REPLACE FUNCTION prevent_account_type_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.account_type IS DISTINCT FROM NEW.account_type THEN
    -- Allow the OAuth callback to set account_type for newly created profiles
    -- (trigger creates profile with 'personal' default, callback updates it)
    IF OLD.account_type = 'personal'
       AND NEW.account_type = 'business'
       AND OLD.created_at > NOW() - INTERVAL '2 minutes' THEN
      RETURN NEW;
    END IF;

    RAISE EXCEPTION 'account_type cannot be changed after creation';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_account_type_change_trigger
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION prevent_account_type_change();
