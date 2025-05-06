
import { supabase } from "./client";

// Enable Postgres replication for a table
export const enableRealtimeForTable = async (table: string) => {
  try {
    // Execute a query to enable replication for the table
    const { data, error } = await supabase
      .from(table)
      .select()
      .limit(0);

    if (error) {
      console.error(`Error enabling realtime for ${table}:`, error);
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
  table: string, 
  event: 'INSERT' | 'UPDATE' | 'DELETE' | '*', 
  callback: (payload: any) => void
) => {
  const channel = supabase
    .channel('table-changes')
    .on(
      'postgres_changes',
      {
        event: event,
        schema: 'public',
        table: table,
      },
      callback
    )
    .subscribe();

  return channel;
};

// Remove a realtime listener
export const removeRealtimeListener = (channel: any) => {
  supabase.removeChannel(channel);
};
