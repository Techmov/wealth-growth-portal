import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'; 

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

export const handler = async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Missing Authorization header');
    
    const requestData = await req.json();
    const { userId, productId } = requestData;
    
    if (!userId || !productId) {
      throw new Error('Missing required parameters: userId and productId are required');
    }

    if (!isValidUUID(userId) || !isValidUUID(productId)) {
      throw new Error('Invalid UUID format for userId or productId');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '', 
      Deno.env.get('SUPABASE_ANON_KEY') ?? '', 
      {
        global: {
          headers: {
            Authorization: authHeader
          }
        }
      }
    );

    const { data: productData, error: productError } = await supabaseClient.from('products').select('id, name, amount').eq('id', productId).single();
    
    if (productError || !productData) {
      return new Response(JSON.stringify({
        error: 'Product not found or inactive'
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 400
      });
    }

    // Explicitly cast UUID strings in the RPC payload
    const { data, error } = await supabaseClient.rpc('create_investment', {
      p_user_id: userId,
      p_product_id: productId,
      p_amount: 0,
      p_end_date: new Date().toISOString(),
      p_starting_value: 0,
      p_current_value: 0,
      p_final_value: 0
    });

    if (error) {
      console.error("Error in create_investment RPC call:", error);
      return new Response(JSON.stringify({
        error: error.message
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 400
      });
    }

    return new Response(JSON.stringify({
      success: true,
      data
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 200
    });

  } catch (error) {
    console.error("Investment function error:", error.message);
    return new Response(JSON.stringify({
      error: error.message
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 400
    });
  }
};

function isValidUUID(uuid) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

Deno.serve(handler);
