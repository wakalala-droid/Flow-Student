-- ============================================================
-- FLOW-STUDENT Admin Panel Schema
-- Run this in Supabase SQL Editor AFTER 001_schema.sql
-- ============================================================

-- Add is_admin column to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Add unlimited flag
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_unlimited BOOLEAN DEFAULT false;

-- Make yourself admin — replace with YOUR email
UPDATE public.profiles 
SET is_admin = true, 
    is_unlimited = true,
    plan = 'team',
    words_limit = 999999999,
    scans_limit = 999999999
WHERE email = 'vwanheda@gmail.com';

-- Admin usage bypass function (replaces old one)
CREATE OR REPLACE FUNCTION public.increment_usage(
  p_user_id UUID,
  p_words INTEGER,
  p_tool TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_profile RECORD;
BEGIN
  SELECT * INTO v_profile FROM public.profiles WHERE id = p_user_id;

  -- Unlimited users always allowed
  IF v_profile.is_unlimited OR v_profile.is_admin THEN
    INSERT INTO public.usage_logs (user_id, tool, words_processed)
    VALUES (p_user_id, p_tool, p_words);
    RETURN jsonb_build_object('allowed', true, 'words_used', v_profile.words_used, 'words_limit', v_profile.words_limit);
  END IF;

  -- Regular users check limit
  IF (v_profile.words_used + p_words) > v_profile.words_limit THEN
    RETURN jsonb_build_object('allowed', false, 'words_used', v_profile.words_used, 'words_limit', v_profile.words_limit);
  END IF;

  UPDATE public.profiles
  SET words_used = words_used + p_words, updated_at = NOW()
  WHERE id = p_user_id;

  INSERT INTO public.usage_logs (user_id, tool, words_processed)
  VALUES (p_user_id, p_tool, p_words);

  RETURN jsonb_build_object('allowed', true, 'words_used', v_profile.words_used + p_words, 'words_limit', v_profile.words_limit);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin stats view
CREATE OR REPLACE VIEW public.admin_stats AS
SELECT
  COUNT(*)                                          AS total_users,
  COUNT(*) FILTER (WHERE plan = 'free')             AS free_users,
  COUNT(*) FILTER (WHERE plan = 'student')          AS student_users,
  COUNT(*) FILTER (WHERE plan = 'pro')              AS pro_users,
  COUNT(*) FILTER (WHERE plan = 'team')             AS team_users,
  SUM(words_used)                                   AS total_words_processed,
  COUNT(*) FILTER (WHERE is_admin = true)           AS admin_count
FROM public.profiles;

-- Admin can read all profiles
CREATE POLICY "Admins can read all profiles"
  ON public.profiles FOR SELECT
  USING (
    auth.uid() IN (SELECT id FROM public.profiles WHERE is_admin = true)
  );

-- Admin can update all profiles  
CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (
    auth.uid() IN (SELECT id FROM public.profiles WHERE is_admin = true)
  );

-- Admin can read all scans
CREATE POLICY "Admins can read all scans"
  ON public.ai_scans FOR SELECT
  USING (
    auth.uid() IN (SELECT id FROM public.profiles WHERE is_admin = true)
  );

-- Admin can read all transactions
CREATE POLICY "Admins can read all transactions"
  ON public.payment_transactions FOR SELECT
  USING (
    auth.uid() IN (SELECT id FROM public.profiles WHERE is_admin = true)
  );
