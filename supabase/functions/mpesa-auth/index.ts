import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AuthResponse {
  access_token: string;
  expires_in: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { environment } = await req.json();
    
    // Get credentials from secrets
    const consumerKey = environment === 'production' 
      ? Deno.env.get('MPESA_PROD_CONSUMER_KEY')
      : Deno.env.get('MPESA_SANDBOX_CONSUMER_KEY');
    
    const consumerSecret = environment === 'production'
      ? Deno.env.get('MPESA_PROD_CONSUMER_SECRET')
      : Deno.env.get('MPESA_SANDBOX_CONSUMER_SECRET');

    if (!consumerKey || !consumerSecret) {
      throw new Error(`M-Pesa ${environment} credentials not configured`);
    }

    // Generate base64 credentials
    const credentials = btoa(`${consumerKey}:${consumerSecret}`);

    // M-Pesa OAuth URL
    const baseUrl = environment === 'production'
      ? 'https://api.safaricom.co.ke'
      : 'https://sandbox.safaricom.co.ke';

    const response = await fetch(
      `${baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${credentials}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`M-Pesa auth failed: ${response.status} - ${errorText}`);
    }

    const data: AuthResponse = await response.json();

    return new Response(
      JSON.stringify({ 
        success: true, 
        access_token: data.access_token,
        expires_in: data.expires_in 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('M-Pesa auth error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
