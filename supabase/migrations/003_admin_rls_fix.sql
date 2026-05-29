-- Run this in Supabase → SQL Editor → New query → Run

-- Drop any broken recursive admin policies first
DROP POLICY IF EXISTS "Admins can read all profiles"         ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles"       ON public.profiles;
DROP POLICY IF EXISTS "Admins can read all scans"            ON public.ai_scans;
DROP POLICY IF EXISTS "Admins can read all transactions"     ON public.payment_transactions;
DROP POLICY IF EXISTS "Service role full access profiles"    ON public.profiles;
DROP POLICY IF EXISTS "Service role full access scans"       ON public.ai_scans;
DROP POLICY IF EXISTS "Service role full access transactions" ON public.payment_transactions;
DROP POLICY IF EXISTS "Service role full access subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Service role full access usage_logs"  ON public.usage_logs;

-- Add service role bypass on every table
CREATE POLICY "service_role_profiles"      ON public.profiles            FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "service_role_scans"         ON public.ai_scans            FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "service_role_transactions"  ON public.payment_transactions FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "service_role_subscriptions" ON public.subscriptions        FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "service_role_usage_logs"    ON public.usage_logs           FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- Confirm your account is still admin
UPDATE public.profiles SET is_admin = true, is_unlimited = true WHERE email = 'vwanheda@gmail.com';
