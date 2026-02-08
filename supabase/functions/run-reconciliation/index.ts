import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReconciliationRequest {
  date: string; // YYYY-MM-DD format
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { date }: ReconciliationRequest = await req.json();
    const reconciliationDate = date || new Date().toISOString().split('T')[0];

    // Get all transactions for the date
    const startOfDay = `${reconciliationDate}T00:00:00.000Z`;
    const endOfDay = `${reconciliationDate}T23:59:59.999Z`;

    const { data: transactions, error: txError } = await supabase
      .from('transactions')
      .select('*')
      .gte('created_at', startOfDay)
      .lte('created_at', endOfDay);

    if (txError) {
      throw new Error(`Failed to fetch transactions: ${txError.message}`);
    }

    const totalTransactions = transactions?.length || 0;
    const totalAmount = transactions?.reduce((sum, tx) => sum + Number(tx.amount), 0) || 0;
    
    // Count by status
    const completedTx = transactions?.filter(tx => tx.status === 'completed') || [];
    const pendingTx = transactions?.filter(tx => tx.status === 'pending') || [];
    const failedTx = transactions?.filter(tx => tx.status === 'failed') || [];

    // Matched = completed, Unmatched = pending or failed
    const matchedTransactions = completedTx.length;
    const unmatchedTransactions = pendingTx.length + failedTx.length;

    // Calculate discrepancy (pending amount)
    const discrepancyAmount = pendingTx.reduce((sum, tx) => sum + Number(tx.amount), 0);

    // Determine status
    let status: 'reconciled' | 'pending' | 'discrepancy' = 'reconciled';
    if (unmatchedTransactions > 0) {
      status = discrepancyAmount > 0 ? 'discrepancy' : 'pending';
    }

    // Upsert reconciliation record
    const { data: reconciliation, error: recError } = await supabase
      .from('reconciliations')
      .upsert({
        reconciliation_date: reconciliationDate,
        total_transactions: totalTransactions,
        total_amount: totalAmount,
        matched_transactions: matchedTransactions,
        unmatched_transactions: unmatchedTransactions,
        discrepancy_amount: discrepancyAmount,
        status,
        notes: `Auto-reconciliation: ${completedTx.length} completed, ${pendingTx.length} pending, ${failedTx.length} failed`,
      }, {
        onConflict: 'reconciliation_date',
      })
      .select()
      .single();

    if (recError) {
      throw new Error(`Failed to save reconciliation: ${recError.message}`);
    }

    // Log audit
    await supabase.from('audit_logs').insert({
      action: 'Reconciliation Completed',
      details: `Daily reconciliation for ${reconciliationDate}: ${totalTransactions} transactions, ${status}`,
      category: 'reconciliation',
      metadata: { 
        date: reconciliationDate, 
        totalTransactions, 
        matchedTransactions, 
        unmatchedTransactions,
        discrepancyAmount,
      },
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        reconciliation,
        summary: {
          date: reconciliationDate,
          totalTransactions,
          totalAmount,
          matchedTransactions,
          unmatchedTransactions,
          discrepancyAmount,
          status,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Reconciliation error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
