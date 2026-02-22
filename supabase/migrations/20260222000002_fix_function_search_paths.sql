-- Fix search_path security warnings for three functions that were
-- (re)defined without SET search_path, allowing potential search_path
-- manipulation attacks.

-- 1. is_admin: redefined in 20260118100000 without search_path
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN COALESCE(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    false
  ) OR EXISTS (
    SELECT 1 FROM admin_emails
    WHERE email = auth.jwt()->>'email'
  );
END;
$$;

-- 2. handle_new_user: redefined in 20260221000000 without search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- 3. prevent_account_type_change: created in 20260221000000 without search_path
CREATE OR REPLACE FUNCTION public.prevent_account_type_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF OLD.account_type IS DISTINCT FROM NEW.account_type THEN
    IF OLD.account_type = 'personal'
       AND NEW.account_type = 'business'
       AND OLD.created_at > NOW() - INTERVAL '2 minutes' THEN
      RETURN NEW;
    END IF;

    RAISE EXCEPTION 'account_type cannot be changed after creation';
  END IF;
  RETURN NEW;
END;
$$;
