import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface StatusRequest {
  transactionId: string;
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

    const { transactionId, environment }: StatusRequest = await req.json();

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

    const shortcode = environment === 'production'
      ? Deno.env.get('MPESA_PROD_SHORTCODE')
      : Deno.env.get('MPESA_SANDBOX_SHORTCODE') || '174379';

    const initiatorName = environment === 'production'
      ? Deno.env.get('MPESA_PROD_INITIATOR_NAME')
      : Deno.env.get('MPESA_SANDBOX_INITIATOR_NAME') || 'testapi';

    const securityCredential = environment === 'production'
      ? Deno.env.get('MPESA_PROD_SECURITY_CREDENTIAL')
      : Deno.env.get('MPESA_SANDBOX_SECURITY_CREDENTIAL');

    if (!securityCredential) {
      throw new Error('Security credential not configured');
    }

    const resultUrl = `${supabaseUrl}/functions/v1/mpesa-status-callback`;
    const timeoutUrl = `${supabaseUrl}/functions/v1/mpesa-status-timeout`;

    const baseUrl = environment === 'production'
      ? 'https://api.safaricom.co.ke'
      : 'https://sandbox.safaricom.co.ke';

    const statusResponse = await fetch(`${baseUrl}/mpesa/transactionstatus/v1/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authData.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        Initiator: initiatorName,
        SecurityCredential: securityCredential,
        CommandID: 'TransactionStatusQuery',
        TransactionID: transactionId,
        PartyA: shortcode,
        IdentifierType: '4',
        ResultURL: resultUrl,
        QueueTimeOutURL: timeoutUrl,
        Remarks: 'Transaction status query',
        Occasion: 'Status check',
      }),
    });

    const statusData = await statusResponse.json();

    await supabase.from('audit_logs').insert({
      action: 'Transaction Status Query',
      details: `Queried status for transaction ${transactionId}`,
      category: 'transaction',
      metadata: { transactionId, responseCode: statusData.ResponseCode },
    });

    return new Response(
      JSON.stringify({ 
        success: statusData.ResponseCode === '0', 
        data: statusData,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Transaction status error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
