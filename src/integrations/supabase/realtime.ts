
import { supabase } from "./client";

type RealtimeChannel = {
  id: string;
  on: () => void;
  subscribe: () => Promise<{ error: Error | null }>;
};

export const enableRealtimeForTable = async (table: string) => {
  // Enable Postgres replication for this table
  const { error: tableError } = await supabase.rpc('postgres_changes', {
    table_name: table,
  });

  if (tableError) {
    console.error(`Error enabling realtime for ${table}:`, tableError);
    return false;
  }

  return true;
};

export const setupRealtimeListener = (table: string, event: 'INSERT' | 'UPDATE' | 'DELETE' | '*', callback: (payload: any) => void) => {
  const channel = supabase.channel('any')
    .on(
      'postgres_changes',
      {
        event,
        schema: 'public',
        table,
      },
      callback
    )
    .subscribe();

  return channel;
};

export const removeRealtimeListener = (channel: any) => {
  supabase.removeChannel(channel);
};
