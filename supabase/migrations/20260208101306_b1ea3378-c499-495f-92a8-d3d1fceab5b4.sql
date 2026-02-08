-- =====================================================
-- M-Pesa Integration Hub Database Schema
-- =====================================================

-- Create enum types
CREATE TYPE transaction_type AS ENUM ('C2B', 'B2C', 'B2B', 'RATIBA');
CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed', 'reversed');
CREATE TYPE user_role AS ENUM ('admin', 'finance', 'viewer');
CREATE TYPE environment_type AS ENUM ('sandbox', 'production');
CREATE TYPE subscription_frequency AS ENUM ('daily', 'weekly', 'monthly');
CREATE TYPE subscription_status AS ENUM ('active', 'paused', 'cancelled');
CREATE TYPE reconciliation_status AS ENUM ('pending', 'reconciled', 'discrepancy');
CREATE TYPE audit_category AS ENUM ('transaction', 'security', 'configuration', 'reconciliation');

-- =====================================================
-- Profiles Table (for user roles and metadata)
-- =====================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  role user_role NOT NULL DEFAULT 'viewer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- Customers Table
-- =====================================================
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone_number TEXT NOT NULL UNIQUE,
  email TEXT,
  account_number TEXT NOT NULL UNIQUE,
  total_transactions INTEGER NOT NULL DEFAULT 0,
  total_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
  last_transaction_date TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- Transactions Table
-- =====================================================
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id TEXT NOT NULL UNIQUE,
  type transaction_type NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'KES',
  phone_number TEXT NOT NULL,
  account_reference TEXT NOT NULL,
  description TEXT,
  status transaction_status NOT NULL DEFAULT 'pending',
  customer_id UUID REFERENCES public.customers(id),
  customer_name TEXT,
  result_code TEXT,
  result_desc TEXT,
  conversation_id TEXT,
  originator_conversation_id TEXT,
  mpesa_receipt_number TEXT,
  transaction_date TIMESTAMPTZ,
  raw_callback_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create index for faster lookups
CREATE INDEX idx_transactions_type ON public.transactions(type);
CREATE INDEX idx_transactions_status ON public.transactions(status);
CREATE INDEX idx_transactions_phone ON public.transactions(phone_number);
CREATE INDEX idx_transactions_date ON public.transactions(created_at);

-- =====================================================
-- Ratiba Subscriptions Table
-- =====================================================
CREATE TABLE public.ratiba_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES public.customers(id),
  customer_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  frequency subscription_frequency NOT NULL,
  start_date DATE NOT NULL,
  next_payment_date DATE NOT NULL,
  status subscription_status NOT NULL DEFAULT 'active',
  account_reference TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ratiba_subscriptions ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- Reconciliations Table
-- =====================================================
CREATE TABLE public.reconciliations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reconciliation_date DATE NOT NULL UNIQUE,
  total_transactions INTEGER NOT NULL DEFAULT 0,
  total_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
  matched_transactions INTEGER NOT NULL DEFAULT 0,
  unmatched_transactions INTEGER NOT NULL DEFAULT 0,
  discrepancy_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
  status reconciliation_status NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.reconciliations ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- Audit Logs Table
-- =====================================================
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  action TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  user_name TEXT,
  ip_address TEXT,
  details TEXT,
  category audit_category NOT NULL,
  metadata JSONB
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_audit_logs_timestamp ON public.audit_logs(timestamp);
CREATE INDEX idx_audit_logs_category ON public.audit_logs(category);
CREATE INDEX idx_audit_logs_user ON public.audit_logs(user_id);

-- =====================================================
-- API Configurations Table (for M-Pesa credentials)
-- =====================================================
CREATE TABLE public.api_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  environment environment_type NOT NULL UNIQUE,
  consumer_key TEXT,
  consumer_secret TEXT,
  shortcode TEXT,
  passkey TEXT,
  initiator_name TEXT,
  security_credential TEXT,
  c2b_validation_url TEXT,
  c2b_confirmation_url TEXT,
  b2c_result_url TEXT,
  b2c_timeout_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.api_configurations ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- Callback Logs Table (raw M-Pesa callbacks)
-- =====================================================
CREATE TABLE public.callback_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  callback_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  ip_address TEXT,
  signature TEXT,
  is_valid BOOLEAN DEFAULT true,
  processed BOOLEAN DEFAULT false,
  error_message TEXT,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.callback_logs ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_callback_logs_received ON public.callback_logs(received_at);
CREATE INDEX idx_callback_logs_type ON public.callback_logs(callback_type);

-- =====================================================
-- Helper Functions
-- =====================================================

-- Check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Check if current user is finance
CREATE OR REPLACE FUNCTION public.is_finance()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'finance'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Check if current user is admin or finance
CREATE OR REPLACE FUNCTION public.is_admin_or_finance()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'finance')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Get current user's role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS user_role AS $$
DECLARE
  user_role_val user_role;
BEGIN
  SELECT role INTO user_role_val FROM public.profiles WHERE id = auth.uid();
  RETURN COALESCE(user_role_val, 'viewer');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- =====================================================
-- Auto-create profile on user signup
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'viewer'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- Update timestamp trigger
-- =====================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.ratiba_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reconciliations_updated_at
  BEFORE UPDATE ON public.reconciliations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_api_configurations_updated_at
  BEFORE UPDATE ON public.api_configurations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- RLS Policies
-- =====================================================

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE USING (public.is_admin());

-- Transactions policies
CREATE POLICY "Admin and finance can view transactions" ON public.transactions
  FOR SELECT USING (public.is_admin_or_finance());

CREATE POLICY "Admins can insert transactions" ON public.transactions
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update transactions" ON public.transactions
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admins can delete transactions" ON public.transactions
  FOR DELETE USING (public.is_admin());

-- Customers policies
CREATE POLICY "Admin and finance can view customers" ON public.customers
  FOR SELECT USING (public.is_admin_or_finance());

CREATE POLICY "Admins can insert customers" ON public.customers
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update customers" ON public.customers
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admins can delete customers" ON public.customers
  FOR DELETE USING (public.is_admin());

-- Ratiba subscriptions policies
CREATE POLICY "Admin and finance can view subscriptions" ON public.ratiba_subscriptions
  FOR SELECT USING (public.is_admin_or_finance());

CREATE POLICY "Admins can insert subscriptions" ON public.ratiba_subscriptions
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update subscriptions" ON public.ratiba_subscriptions
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admins can delete subscriptions" ON public.ratiba_subscriptions
  FOR DELETE USING (public.is_admin());

-- Reconciliations policies
CREATE POLICY "Admin and finance can view reconciliations" ON public.reconciliations
  FOR SELECT USING (public.is_admin_or_finance());

CREATE POLICY "Admins can insert reconciliations" ON public.reconciliations
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update reconciliations" ON public.reconciliations
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admins can delete reconciliations" ON public.reconciliations
  FOR DELETE USING (public.is_admin());

-- Audit logs policies
CREATE POLICY "Admins can view audit logs" ON public.audit_logs
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can insert audit logs" ON public.audit_logs
  FOR INSERT WITH CHECK (public.is_admin());

-- API configurations policies
CREATE POLICY "Admins can view api configurations" ON public.api_configurations
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can insert api configurations" ON public.api_configurations
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update api configurations" ON public.api_configurations
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admins can delete api configurations" ON public.api_configurations
  FOR DELETE USING (public.is_admin());

-- Callback logs policies
CREATE POLICY "Admins can view callback logs" ON public.callback_logs
  FOR SELECT USING (public.is_admin());

-- Insert default API configurations
INSERT INTO public.api_configurations (environment, shortcode, is_active)
VALUES 
  ('sandbox', '174379', true),
  ('production', '', false);
