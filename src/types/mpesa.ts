export type TransactionType = 'C2B' | 'B2C' | 'B2B' | 'RATIBA';
export type TransactionStatus = 'completed' | 'pending' | 'failed' | 'reversed';
export type Environment = 'sandbox' | 'production';

export interface Transaction {
  id: string;
  transactionId: string;
  type: TransactionType;
  amount: number;
  currency: string;
  phoneNumber: string;
  accountReference: string;
  description: string;
  status: TransactionStatus;
  timestamp: Date;
  customerName?: string;
  resultCode?: string;
  resultDesc?: string;
  conversationId?: string;
  originatorConversationId?: string;
}

export interface Customer {
  id: string;
  name: string;
  phoneNumber: string;
  email?: string;
  accountNumber: string;
  totalTransactions: number;
  totalAmount: number;
  lastTransactionDate: Date;
  status: 'active' | 'inactive';
}

export interface ReconciliationRecord {
  id: string;
  date: Date;
  totalTransactions: number;
  totalAmount: number;
  matchedTransactions: number;
  unmatchedTransactions: number;
  discrepancyAmount: number;
  status: 'reconciled' | 'pending' | 'discrepancy';
}

export interface AuditLog {
  id: string;
  timestamp: Date;
  action: string;
  userId: string;
  userName: string;
  ipAddress: string;
  details: string;
  category: 'transaction' | 'security' | 'configuration' | 'reconciliation';
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
  customerId: string;
  customerName: string;
  phoneNumber: string;
  amount: number;
  frequency: 'daily' | 'weekly' | 'monthly';
  startDate: Date;
  nextPaymentDate: Date;
  status: 'active' | 'paused' | 'cancelled';
  accountReference: string;
}
