
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

    console.log(`Creating investment with userId: ${userId}, productId: ${productId}`);

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

    // Explicitly cast productId to uuid when querying the products table
    const { data: productData, error: productError } = await supabaseClient
      .from('products')
      .select('id, name, amount')
      .eq('id', productId) // UUID comparison is handled by Supabase client
      .single();
    
    if (productError) {
      console.error("Product query error:", JSON.stringify(productError, null, 2));
      return new Response(JSON.stringify({
        error: 'Product not found or inactive',
        details: productError
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 400
      });
    }
    
    if (!productData) {
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

    console.log("Found product:", JSON.stringify(productData));

    // Call the RPC with direct parameters - PostgreSQL will handle the UUID conversion
    // This is critical: Pass the values directly, don't try to cast them in JavaScript
    const { data, error } = await supabaseClient.rpc('create_investment', {
      p_user_id: userId, 
      p_product_id: productId, 
      p_amount: productData.amount,
      p_end_date: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)).toISOString(), // 30 days from now
      p_starting_value: productData.amount,
      p_current_value: productData.amount,
      p_final_value: productData.amount * 2 // Double the investment amount
    });

    if (error) {
      console.error("Error in create_investment RPC call:", JSON.stringify(error, null, 2));
      return new Response(JSON.stringify({
        error: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 400
      });
    }

    console.log("Investment created successfully:", JSON.stringify(data));

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
    console.error("Investment function error:", error.message, error.stack);
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
