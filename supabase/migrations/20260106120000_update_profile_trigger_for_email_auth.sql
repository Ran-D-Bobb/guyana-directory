-- Update the profile creation function to better handle email/password signups
-- Email/password users may not have avatar_url but will have name/full_name from signup form
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, photo)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',  -- From OAuth (Google) or email signup
      NEW.raw_user_meta_data->>'name',        -- Backup from email signup form
      split_part(NEW.email, '@', 1)           -- Fallback: use email prefix as name
    ),
    NEW.raw_user_meta_data->>'avatar_url'     -- Will be NULL for email signups
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: The trigger on_auth_user_created already exists and will use this updated function
