import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface STKPushRequest {
  phoneNumber: string;
  amount: number;
  accountReference: string;
  transactionDesc: string;
  environment: 'sandbox' | 'production';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { phoneNumber, amount, accountReference, transactionDesc, environment }: STKPushRequest = await req.json();

    // Get access token
    const authResponse = await fetch(`${supabaseUrl}/functions/v1/mpesa-auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ environment }),
    });

    const authData = await authResponse.json();
    if (!authData.success) {
      throw new Error(authData.error);
    }

    // Get shortcode and passkey from secrets
    const shortcode = environment === 'production'
      ? Deno.env.get('MPESA_PROD_SHORTCODE')
      : Deno.env.get('MPESA_SANDBOX_SHORTCODE') || '174379';

    const passkey = environment === 'production'
      ? Deno.env.get('MPESA_PROD_PASSKEY')
      : Deno.env.get('MPESA_SANDBOX_PASSKEY') || 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919';

    const callbackUrl = `${supabaseUrl}/functions/v1/mpesa-callback`;

    // Generate timestamp
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);

    // Generate password
    const password = btoa(`${shortcode}${passkey}${timestamp}`);

    // Format phone number (remove leading 0 or +)
    const formattedPhone = phoneNumber.replace(/^(\+?254|0)/, '254');

    const baseUrl = environment === 'production'
      ? 'https://api.safaricom.co.ke'
      : 'https://sandbox.safaricom.co.ke';

    const stkPushResponse = await fetch(`${baseUrl}/mpesa/stkpush/v1/processrequest`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authData.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: amount,
        PartyA: formattedPhone,
        PartyB: shortcode,
        PhoneNumber: formattedPhone,
        CallBackURL: callbackUrl,
        AccountReference: accountReference,
        TransactionDesc: transactionDesc,
      }),
    });

    const stkData = await stkPushResponse.json();

    if (stkData.ResponseCode === '0') {
      // Create pending transaction record
      const transactionId = `STK${Date.now()}`;
      
      await supabase.from('transactions').insert({
        transaction_id: transactionId,
        type: 'C2B',
        amount,
        phone_number: formattedPhone,
        account_reference: accountReference,
        description: transactionDesc,
        status: 'pending',
        conversation_id: stkData.CheckoutRequestID,
        originator_conversation_id: stkData.MerchantRequestID,
      });

      // Log audit
      await supabase.from('audit_logs').insert({
        action: 'STK Push Initiated',
        details: `STK push of KES ${amount} to ${formattedPhone}`,
        category: 'transaction',
        metadata: { checkoutRequestId: stkData.CheckoutRequestID },
      });

      return new Response(
        JSON.stringify({ 
          success: true, 
          checkoutRequestId: stkData.CheckoutRequestID,
          merchantRequestId: stkData.MerchantRequestID,
          transactionId,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      throw new Error(stkData.errorMessage || stkData.ResponseDescription || 'STK push failed');
    }
  } catch (error) {
    console.error('STK Push error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
