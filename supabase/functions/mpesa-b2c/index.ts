import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface B2CRequest {
  phoneNumber: string;
  amount: number;
  occasion: string;
  remarks: string;
  commandId: 'SalaryPayment' | 'BusinessPayment' | 'PromotionPayment';
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

    const { phoneNumber, amount, occasion, remarks, commandId, environment }: B2CRequest = await req.json();

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

    const resultUrl = `${supabaseUrl}/functions/v1/mpesa-b2c-callback`;
    const timeoutUrl = `${supabaseUrl}/functions/v1/mpesa-b2c-timeout`;

    const formattedPhone = phoneNumber.replace(/^(\+?254|0)/, '254');

    const baseUrl = environment === 'production'
      ? 'https://api.safaricom.co.ke'
      : 'https://sandbox.safaricom.co.ke';

    const b2cResponse = await fetch(`${baseUrl}/mpesa/b2c/v1/paymentrequest`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authData.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        InitiatorName: initiatorName,
        SecurityCredential: securityCredential,
        CommandID: commandId,
        Amount: amount,
        PartyA: shortcode,
        PartyB: formattedPhone,
        Remarks: remarks,
        QueueTimeOutURL: timeoutUrl,
        ResultURL: resultUrl,
        Occassion: occasion,
      }),
    });

    const b2cData = await b2cResponse.json();

    if (b2cData.ResponseCode === '0') {
      const transactionId = `B2C${Date.now()}`;

      await supabase.from('transactions').insert({
        transaction_id: transactionId,
        type: 'B2C',
        amount,
        phone_number: formattedPhone,
        account_reference: commandId,
        description: remarks,
        status: 'pending',
        conversation_id: b2cData.ConversationID,
        originator_conversation_id: b2cData.OriginatorConversationID,
      });

      await supabase.from('audit_logs').insert({
        action: 'B2C Payment Initiated',
        details: `B2C ${commandId} of KES ${amount} to ${formattedPhone}`,
        category: 'transaction',
        metadata: { conversationId: b2cData.ConversationID },
      });

      return new Response(
        JSON.stringify({ 
          success: true, 
          conversationId: b2cData.ConversationID,
          transactionId,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      throw new Error(b2cData.errorMessage || b2cData.ResponseDescription || 'B2C request failed');
    }
  } catch (error) {
    console.error('B2C error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
