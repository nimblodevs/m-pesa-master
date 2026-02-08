import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Safaricom's official M-Pesa callback IPs
const SAFARICOM_IPS = [
  '196.201.214.200',
  '196.201.214.206',
  '196.201.213.114',
  '196.201.214.207',
  '196.201.214.208',
];

serve(async (req) => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Get client IP for validation
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                     req.headers.get('x-real-ip') || 
                     'unknown';

    const payload = await req.json();

    // Log the raw callback
    await supabase.from('callback_logs').insert({
      callback_type: 'STK_CALLBACK',
      payload,
      ip_address: clientIP,
      is_valid: true,
      processed: false,
    });

    // Validate IP in production (optional - can be enabled)
    const validateIP = Deno.env.get('MPESA_VALIDATE_IP') === 'true';
    if (validateIP && !SAFARICOM_IPS.includes(clientIP)) {
      console.warn(`Callback from unrecognized IP: ${clientIP}`);
      await supabase.from('callback_logs').update({ is_valid: false })
        .eq('ip_address', clientIP)
        .order('received_at', { ascending: false })
        .limit(1);
    }

    // Process STK Push callback
    if (payload.Body?.stkCallback) {
      const callback = payload.Body.stkCallback;
      const checkoutRequestId = callback.CheckoutRequestID;
      const resultCode = callback.ResultCode;
      const resultDesc = callback.ResultDesc;

      let status: 'completed' | 'failed' = resultCode === 0 ? 'completed' : 'failed';
      let mpesaReceiptNumber = null;
      let transactionDate = null;
      let phoneNumber = null;
      let amount = null;

      // Extract callback metadata
      if (callback.CallbackMetadata?.Item) {
        for (const item of callback.CallbackMetadata.Item) {
          switch (item.Name) {
            case 'MpesaReceiptNumber':
              mpesaReceiptNumber = item.Value;
              break;
            case 'TransactionDate':
              transactionDate = item.Value;
              break;
            case 'PhoneNumber':
              phoneNumber = item.Value?.toString();
              break;
            case 'Amount':
              amount = item.Value;
              break;
          }
        }
      }

      // Update transaction
      const { error: updateError } = await supabase
        .from('transactions')
        .update({
          status,
          result_code: resultCode?.toString(),
          result_desc: resultDesc,
          mpesa_receipt_number: mpesaReceiptNumber,
          transaction_date: transactionDate ? new Date(
            transactionDate.toString().replace(/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1-$2-$3T$4:$5:$6')
          ).toISOString() : null,
          raw_callback_data: payload,
        })
        .eq('conversation_id', checkoutRequestId);

      if (updateError) {
        console.error('Failed to update transaction:', updateError);
      }

      // Update customer stats if successful
      if (status === 'completed' && phoneNumber) {
        const { data: customer } = await supabase
          .from('customers')
          .select('id, total_transactions, total_amount')
          .eq('phone_number', phoneNumber)
          .single();

        if (customer) {
          await supabase
            .from('customers')
            .update({
              total_transactions: customer.total_transactions + 1,
              total_amount: customer.total_amount + (amount || 0),
              last_transaction_date: new Date().toISOString(),
            })
            .eq('id', customer.id);
        }
      }

      // Log audit
      await supabase.from('audit_logs').insert({
        action: status === 'completed' ? 'Payment Completed' : 'Payment Failed',
        details: `${resultDesc}. Receipt: ${mpesaReceiptNumber || 'N/A'}`,
        category: 'transaction',
        metadata: { checkoutRequestId, resultCode, mpesaReceiptNumber },
      });

      // Mark callback as processed
      await supabase
        .from('callback_logs')
        .update({ processed: true })
        .eq('payload->Body->stkCallback->CheckoutRequestID', checkoutRequestId);
    }

    // M-Pesa expects this exact response
    return new Response(
      JSON.stringify({ ResultCode: 0, ResultDesc: 'Success' }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Callback processing error:', error);
    
    // Still return success to M-Pesa to prevent retries
    return new Response(
      JSON.stringify({ ResultCode: 0, ResultDesc: 'Accepted' }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  }
});
