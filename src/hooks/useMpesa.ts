import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { 
  Transaction, 
  Customer, 
  ReconciliationRecord,
  AuditLog,
  RatibaSubscription,
  DashboardStats,
  TransactionType,
} from '@/types/mpesa';

// Transactions
export function useTransactions(type?: TransactionType) {
  return useQuery({
    queryKey: ['transactions', type],
    queryFn: async () => {
      let query = supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (type) {
        query = query.eq('type', type);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Transaction[];
    },
  });
}

export function useTransaction(id: string) {
  return useQuery({
    queryKey: ['transaction', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as Transaction;
    },
    enabled: !!id,
  });
}

// Customers
export function useCustomers() {
  return useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Customer[];
    },
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (customer: { name: string; phone_number: string; email?: string; account_number: string; status?: string }) => {
      const { data, error } = await supabase
        .from('customers')
        .insert({
          name: customer.name,
          phone_number: customer.phone_number,
          email: customer.email,
          account_number: customer.account_number,
          status: customer.status || 'active',
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}

// Reconciliations
export function useReconciliations() {
  return useQuery({
    queryKey: ['reconciliations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reconciliations')
        .select('*')
        .order('reconciliation_date', { ascending: false });
      if (error) throw error;
      return data as ReconciliationRecord[];
    },
  });
}

export function useRunReconciliation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (date?: string) => {
      const { data, error } = await supabase.functions.invoke('run-reconciliation', {
        body: { date },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reconciliations'] });
    },
  });
}

// Audit Logs
export function useAuditLogs() {
  return useQuery({
    queryKey: ['audit-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data as AuditLog[];
    },
  });
}

// Ratiba Subscriptions
export function useRatibaSubscriptions() {
  return useQuery({
    queryKey: ['ratiba-subscriptions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ratiba_subscriptions')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as RatibaSubscription[];
    },
  });
}

// Dashboard Stats
export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      // Get today's date range
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
      const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();

      // Get all transactions count
      const { count: totalTransactions } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true });

      // Get total volume
      const { data: volumeData } = await supabase
        .from('transactions')
        .select('amount')
        .eq('status', 'completed');
      
      const totalVolume = volumeData?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;

      // Get success rate
      const { count: completedCount } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed');

      const successRate = totalTransactions 
        ? ((completedCount || 0) / totalTransactions) * 100 
        : 0;

      // Get pending count
      const { count: pendingCount } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Get today's transactions
      const { count: todayTransactions } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfDay)
        .lte('created_at', endOfDay);

      // Get today's volume
      const { data: todayVolumeData } = await supabase
        .from('transactions')
        .select('amount')
        .eq('status', 'completed')
        .gte('created_at', startOfDay)
        .lte('created_at', endOfDay);

      const todayVolume = todayVolumeData?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;

      return {
        totalTransactions: totalTransactions || 0,
        totalVolume,
        successRate: Math.round(successRate * 10) / 10,
        pendingCount: pendingCount || 0,
        todayTransactions: todayTransactions || 0,
        todayVolume,
      } as DashboardStats;
    },
  });
}

// STK Push
export function useSTKPush() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (params: {
      phoneNumber: string;
      amount: number;
      accountReference: string;
      transactionDesc: string;
      environment: 'sandbox' | 'production';
    }) => {
      const { data, error } = await supabase.functions.invoke('mpesa-stk-push', {
        body: params,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}

// B2C Payment
export function useB2CPayment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (params: {
      phoneNumber: string;
      amount: number;
      occasion: string;
      remarks: string;
      commandId: 'SalaryPayment' | 'BusinessPayment' | 'PromotionPayment';
      environment: 'sandbox' | 'production';
    }) => {
      const { data, error } = await supabase.functions.invoke('mpesa-b2c', {
        body: params,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}

// Transaction Status Query
export function useTransactionStatus() {
  return useMutation({
    mutationFn: async (params: {
      transactionId: string;
      environment: 'sandbox' | 'production';
    }) => {
      const { data, error } = await supabase.functions.invoke('mpesa-transaction-status', {
        body: params,
      });
      if (error) throw error;
      return data;
    },
  });
}
