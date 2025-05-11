
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

export const handler = async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Missing Authorization header');
    
    const requestData = await req.json();
    const { table_name, column_name, id } = requestData;
    
    if (!id || !table_name || !column_name) {
      throw new Error('Missing required parameters');
    }

    // Create Supabase client
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

    // Get the current value
    const { data, error } = await supabaseClient
      .from(table_name)
      .select(column_name)
      .eq('id', id)
      .single();

    if (error) {
      console.error("Error fetching value:", error);
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

    if (!data) {
      return new Response(JSON.stringify({
        error: 'Record not found'
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 404
      });
    }

    // Return the value
    return new Response(JSON.stringify({
      success: true,
      value: data[column_name]
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 200
    });

  } catch (error) {
    console.error("Function error:", error.message);
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

Deno.serve(handler);
