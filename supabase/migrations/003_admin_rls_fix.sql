-- ============================================================
-- Run this in Supabase SQL Editor → fixes admin seeing all users
-- ============================================================

-- 1. Drop the broken recursive policies (they cause infinite loops)
DROP POLICY IF EXISTS "Admins can read all profiles"    ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles"  ON public.profiles;
DROP POLICY IF EXISTS "Admins can read all scans"       ON public.ai_scans;
DROP POLICY IF EXISTS "Admins can read all transactions" ON public.payment_transactions;

-- 2. Allow service_role to bypass RLS entirely on all tables
CREATE POLICY "Service role full access profiles"
  ON public.profiles FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role full access scans"
  ON public.ai_scans FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role full access transactions"
  ON public.payment_transactions FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role full access subscriptions"
  ON public.subscriptions FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role full access usage_logs"
  ON public.usage_logs FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- 3. Verify — should return ALL users including non-admins
-- SELECT id, email, plan, is_admin FROM public.profiles ORDER BY created_at DESC;
