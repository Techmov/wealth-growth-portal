
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'; 
import { corsHeaders } from '../_shared/cors.ts';

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

    // Validate UUIDs
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

    // Fetch the product data
    const { data: productData, error: productError } = await supabaseClient
      .from('products')
      .select('id, name, amount, duration, growth_rate')
      .eq('id', productId)
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

    // Calculate end date based on product duration (in days)
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + (productData.duration || 30));
    
    // Call the create_investment database function
    const { data, error } = await supabaseClient.rpc(
      'create_investment',
      { 
        p_user_id: userId,
        p_product_id: productId,
        p_amount: productData.amount,
        p_end_date: endDate.toISOString(),
        p_starting_value: productData.amount,
        p_current_value: productData.amount,
        p_final_value: productData.amount * 2 // Double the investment amount
      }
    );

    if (error) {
      console.error("Investment creation error:", JSON.stringify(error, null, 2));
      return new Response(JSON.stringify({
        error: error.message || 'Error creating investment',
        details: error
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 500
      });
    }

    console.log("Investment created successfully:", JSON.stringify(data));

    // Return success response
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
      error: error.message || 'Unknown error occurred'
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 500
    });
  }
};

function isValidUUID(uuid) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

Deno.serve(handler);
