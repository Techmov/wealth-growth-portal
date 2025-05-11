
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
    const { row_id, table_name, column_name, value } = requestData;
    
    if (!row_id || !table_name || !column_name || value === undefined) {
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

    // Use SQL to increment the value (safer than multiple READ + UPDATE operations)
    const { data, error } = await supabaseClient
      .from(table_name)
      .update({ [column_name]: supabaseClient.rpc('get_current_value', { 
        p_table: table_name, 
        p_column: column_name, 
        p_id: row_id 
      }).then(val => val + value) })
      .eq('id', row_id)
      .select();

    if (error) {
      console.error("Increment error:", error);
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
    console.error("Increment function error:", error.message);
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
