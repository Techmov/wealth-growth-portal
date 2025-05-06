
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { row_id, amount, table = 'profiles', column = 'balance' } = await req.json()

    if (!row_id || amount === undefined) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: row_id and amount are required' }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 400 }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get current value
    const { data: currentData, error: fetchError } = await supabase
      .from(table)
      .select(column)
      .eq('id', row_id)
      .single()

    if (fetchError) {
      console.error('Error fetching current value:', fetchError)
      return new Response(
        JSON.stringify({ error: fetchError.message }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 500 }
      )
    }

    const currentValue = currentData[column] || 0
    const newValue = currentValue + amount

    // Update with new value
    const updateData = {}
    updateData[column] = newValue

    const { data, error: updateError } = await supabase
      .from(table)
      .update(updateData)
      .eq('id', row_id)
      .select()

    if (updateError) {
      console.error('Error updating value:', updateError)
      return new Response(
        JSON.stringify({ error: updateError.message }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 500 }
      )
    }

    return new Response(
      JSON.stringify({ success: true, data }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    )
  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 500 }
    )
  }
})
