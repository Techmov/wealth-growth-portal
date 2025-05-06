
import { supabase } from "./client";
import type { RealtimeChannel } from "@supabase/supabase-js";

// Enable Postgres replication for a table
export const enableRealtimeForTable = async (tableName: "profiles" | "investments" | "products" | "transactions" | "withdrawal_requests") => {
  try {
    // Execute a query to enable replication for the table
    const { data, error } = await supabase
      .from(tableName)
      .select()
      .limit(0);

    if (error) {
      console.error(`Error enabling realtime for ${tableName}:`, error);
      return false;
    }

    return true;
  } catch (error) {
    console.error(`Error in enableRealtimeForTable:`, error);
    return false;
  }
};

// Setup a realtime listener for a table
export const setupRealtimeListener = (
  tableName: "profiles" | "investments" | "products" | "transactions" | "withdrawal_requests",
  event: 'INSERT' | 'UPDATE' | 'DELETE' | '*', 
  callback: (payload: any) => void
): RealtimeChannel => {
  const channel = supabase
    .channel('table-changes')
    .on(
      'postgres_changes',
      {
        event: event,
        schema: 'public',
        table: tableName,
      },
      callback
    )
    .subscribe();

  return channel;
};

// Remove a realtime listener
export const removeRealtimeListener = (channel: RealtimeChannel) => {
  supabase.removeChannel(channel);
};
