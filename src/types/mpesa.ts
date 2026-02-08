export type TransactionType = 'C2B' | 'B2C' | 'B2B' | 'RATIBA';
export type TransactionStatus = 'completed' | 'pending' | 'failed' | 'reversed';
export type Environment = 'sandbox' | 'production';

// Database-aligned types (snake_case from DB)
export interface Transaction {
  id: string;
  transaction_id: string;
  type: TransactionType;
  amount: number;
  currency: string;
  phone_number: string;
  account_reference: string;
  description: string | null;
  status: TransactionStatus;
  created_at: string;
  updated_at: string;
  customer_id: string | null;
  customer_name: string | null;
  result_code: string | null;
  result_desc: string | null;
  conversation_id: string | null;
  originator_conversation_id: string | null;
  mpesa_receipt_number: string | null;
  transaction_date: string | null;
  raw_callback_data: Record<string, unknown> | null;
}

export interface Customer {
  id: string;
  name: string;
  phone_number: string;
  email: string | null;
  account_number: string;
  total_transactions: number;
  total_amount: number;
  last_transaction_date: string | null;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface ReconciliationRecord {
  id: string;
  reconciliation_date: string;
  total_transactions: number;
  total_amount: number;
  matched_transactions: number;
  unmatched_transactions: number;
  discrepancy_amount: number;
  status: 'reconciled' | 'pending' | 'discrepancy';
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  user_id: string | null;
  user_name: string | null;
  ip_address: string | null;
  details: string | null;
  category: 'transaction' | 'security' | 'configuration' | 'reconciliation';
  metadata: Record<string, unknown> | null;
}

export interface DashboardStats {
  totalTransactions: number;
  totalVolume: number;
  successRate: number;
  pendingCount: number;
  todayTransactions: number;
  todayVolume: number;
}

export interface RatibaSubscription {
  id: string;
  customer_id: string | null;
  customer_name: string;
  phone_number: string;
  amount: number;
  frequency: 'daily' | 'weekly' | 'monthly';
  start_date: string;
  next_payment_date: string;
  status: 'active' | 'paused' | 'cancelled';
  account_reference: string;
  created_at: string;
  updated_at: string;
}

export interface ApiConfiguration {
  id: string;
  environment: Environment;
  consumer_key: string | null;
  consumer_secret: string | null;
  shortcode: string | null;
  passkey: string | null;
  initiator_name: string | null;
  security_credential: string | null;
  c2b_validation_url: string | null;
  c2b_confirmation_url: string | null;
  b2c_result_url: string | null;
  b2c_timeout_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CallbackLog {
  id: string;
  callback_type: string;
  payload: Record<string, unknown>;
  ip_address: string | null;
  signature: string | null;
  is_valid: boolean;
  processed: boolean;
  error_message: string | null;
  received_at: string;
}
