
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the service role key
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Parse request body
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return new Response(JSON.stringify({ error: "Invalid request body" }), { 
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action } = body;

    // Handle different admin actions
    switch (action) {
      case "get_all_users":
        const { data: users, error: usersError } = await supabase
          .from("profiles")
          .select("*");
        
        if (usersError) {
          throw usersError;
        }
        
        return new Response(JSON.stringify({ success: true, data: users }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

      case "get_pending_deposits":
        const { data: deposits, error: depositsError } = await supabase
          .from("transactions")
          .select("*")
          .eq("type", "deposit")
          .eq("status", "pending");
        
        if (depositsError) {
          throw depositsError;
        }
        
        return new Response(JSON.stringify({ success: true, data: deposits }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

      case "get_admin_plans":
        const { data: plans, error: plansError } = await supabase
          .from("products")
          .select("*")
          .order("created_at", { ascending: false });
        
        if (plansError) {
          throw plansError;
        }
        
        return new Response(JSON.stringify({ success: true, data: plans }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

      case "get_pending_withdrawals":
        const { data: withdrawals, error: withdrawalsError } = await supabase
          .from("withdrawal_requests")
          .select(`
            *,
            profiles:user_id (
              name,
              email,
              username
            )
          `)
          .eq("status", "pending");
        
        if (withdrawalsError) {
          throw withdrawalsError;
        }
        
        return new Response(JSON.stringify({ success: true, data: withdrawals }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      
      default:
        return new Response(JSON.stringify({ error: "Invalid action" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
  } catch (error) {
    console.error("Admin edge function error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
