-- ============================================================
-- FLOW-STUDENT Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- PROFILES (extends Supabase auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  country TEXT DEFAULT 'ZM',
  phone TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'student', 'pro', 'team')),
  words_used INTEGER DEFAULT 0,
  words_limit INTEGER DEFAULT 5000,
  scans_used INTEGER DEFAULT 0,
  scans_limit INTEGER DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- SUBSCRIPTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  plan TEXT NOT NULL CHECK (plan IN ('student', 'pro', 'team')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'pending')),
  payment_method TEXT DEFAULT 'mobile_money',
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'ZMW',
  billing_cycle TEXT DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
  current_period_start TIMESTAMPTZ DEFAULT NOW(),
  current_period_end TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days',
  flutterwave_tx_ref TEXT,
  flutterwave_tx_id TEXT,
  mobile_number TEXT,
  network TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- DOCUMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL DEFAULT 'Untitled Document',
  content TEXT,
  word_count INTEGER DEFAULT 0,
  tool_used TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'processed', 'exported')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- AI SCANS (all tool results)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.ai_scans (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
  tool TEXT NOT NULL CHECK (tool IN ('humanizer','detector','plagiarism','paraphraser','grammar','factcheck','seo','tone','citation')),
  input_text TEXT NOT NULL,
  output_text TEXT,
  result JSONB DEFAULT '{}',
  word_count INTEGER DEFAULT 0,
  tokens_used INTEGER DEFAULT 0,
  model_used TEXT DEFAULT 'llama-3.3-70b-versatile',
  processing_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PAYMENT TRANSACTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  tx_ref TEXT UNIQUE NOT NULL,
  flutterwave_id TEXT,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'ZMW',
  mobile_number TEXT NOT NULL,
  network TEXT NOT NULL CHECK (network IN ('MTN', 'AIRTEL', 'ZAMTEL')),
  plan TEXT NOT NULL,
  billing_cycle TEXT DEFAULT 'monthly',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'cancelled')),
  flutterwave_response JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- USAGE LOGS (daily tracking)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.usage_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  tool TEXT NOT NULL,
  words_processed INTEGER DEFAULT 0,
  tokens_used INTEGER DEFAULT 0,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Subscriptions policies
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role can manage subscriptions" ON public.subscriptions FOR ALL USING (auth.role() = 'service_role');

-- Documents policies
CREATE POLICY "Users can CRUD own documents" ON public.documents FOR ALL USING (auth.uid() = user_id);

-- AI Scans policies
CREATE POLICY "Users can view own scans" ON public.ai_scans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own scans" ON public.ai_scans FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Payment transactions policies
CREATE POLICY "Users can view own transactions" ON public.payment_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role can manage transactions" ON public.payment_transactions FOR ALL USING (auth.role() = 'service_role');

-- Usage logs policies
CREATE POLICY "Users can view own usage" ON public.usage_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own usage" ON public.usage_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_ai_scans_user_id ON public.ai_scans(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_scans_tool ON public.ai_scans(tool);
CREATE INDEX IF NOT EXISTS idx_ai_scans_created_at ON public.ai_scans(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON public.documents(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_tx_ref ON public.payment_transactions(tx_ref);
CREATE INDEX IF NOT EXISTS idx_usage_logs_user_date ON public.usage_logs(user_id, date);

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- Increment word usage and check limits
CREATE OR REPLACE FUNCTION public.increment_usage(
  p_user_id UUID,
  p_words INTEGER,
  p_tool TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_profile RECORD;
  v_allowed BOOLEAN;
BEGIN
  SELECT * INTO v_profile FROM public.profiles WHERE id = p_user_id;

  v_allowed := (v_profile.words_used + p_words) <= v_profile.words_limit;

  IF v_allowed THEN
    UPDATE public.profiles
    SET words_used = words_used + p_words, updated_at = NOW()
    WHERE id = p_user_id;

    INSERT INTO public.usage_logs (user_id, tool, words_processed)
    VALUES (p_user_id, p_tool, p_words);
  END IF;

  RETURN jsonb_build_object(
    'allowed', v_allowed,
    'words_used', v_profile.words_used + CASE WHEN v_allowed THEN p_words ELSE 0 END,
    'words_limit', v_profile.words_limit
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Reset monthly usage (run via cron or pg_cron)
CREATE OR REPLACE FUNCTION public.reset_monthly_usage()
RETURNS void AS $$
BEGIN
  UPDATE public.profiles SET words_used = 0, scans_used = 0, updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
