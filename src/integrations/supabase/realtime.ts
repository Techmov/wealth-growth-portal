
import { supabase } from "./client";

// Function to enable realtime for specific tables
export const setupRealtimeSubscriptions = async () => {
  // This is only needed if you haven't enabled realtime for your tables in the Supabase dashboard
  try {
    // Add your tables to the realtime publication - run this once
    await supabase.rpc('supabase_functions.enable_realtime', {
      table_name: 'profiles'
    });
    
    await supabase.rpc('supabase_functions.enable_realtime', {
      table_name: 'transactions'
    });
    
    await supabase.rpc('supabase_functions.enable_realtime', {
      table_name: 'investments'
    });
    
    await supabase.rpc('supabase_functions.enable_realtime', {
      table_name: 'withdrawal_requests'
    });
    
    console.log("Realtime subscriptions setup successful");
  } catch (error) {
    console.error("Error setting up realtime subscriptions:", error);
  }
};

// You can call this function when your app initializes
// but it's better to do this in the Supabase dashboard directly
