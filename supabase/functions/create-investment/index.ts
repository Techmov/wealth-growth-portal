
// Follow this setup guide to integrate the Deno runtime into your Supabase functions:
// https://supabase.com/docs/guides/functions/deno-runtime

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Define CORS headers for browser compatibility
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing Authorization header');
    }

    // Parse the request body
    const requestData = await req.json();
    const { userId, productId } = requestData;
    
    console.log("Creating investment with parameters:", {
      userId,
      productId
    });

    if (!userId || !productId) {
      throw new Error('Missing required parameters: userId and productId are required');
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    console.log("About to call create_investment with userId:", userId, "productId:", productId);
    
    // First, verify that the UUIDs are valid
    if (!isValidUUID(userId) || !isValidUUID(productId)) {
      throw new Error('Invalid UUID format for userId or productId');
    }
    
    // The key fix: explicitly convert parameters to text format when calling RPC
    // PostgreSQL will handle the internal casting from text to UUID
    const { data, error } = await supabaseClient.rpc('create_investment', {
      p_user_id: userId,  // Pass as string, PostgreSQL will cast internally
      p_product_id: productId,  // Pass as string, PostgreSQL will cast internally
      p_amount: 0,        // These values will be calculated in the function
      p_end_date: new Date().toISOString(),
      p_starting_value: 0,
      p_current_value: 0,
      p_final_value: 0
    });

    if (error) {
      console.error("Error in create_investment RPC call:", error);
      
      // Return a proper error response
      return new Response(
        JSON.stringify({ error: error.message }),
        {
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json' 
          },
          status: 400,
        }
      );
    }

    console.log("Investment created successfully:", data);

    // Return the successful response
    return new Response(
      JSON.stringify({ success: true, data }),
      {
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Investment function error:", error.message);
    
    // Return a proper error response
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        },
        status: 400,
      }
    );
  }
};

// Helper function to validate UUID format
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

Deno.serve(handler);
