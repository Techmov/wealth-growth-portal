
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface RealtimeSubscription {
  channel: string;
  table: string;
  callback: (payload: any) => void;
  filter?: string;
}

export function useRealtimeManager(subscriptions: RealtimeSubscription[] = []) {
  const channelsRef = useRef<Map<string, any>>(new Map());

  useEffect(() => {
    // Only create subscriptions if we have any
    if (subscriptions.length === 0) return;

    subscriptions.forEach(({ channel, table, callback, filter }) => {
      if (channelsRef.current.has(channel)) return;

      const realtimeChannel = supabase
        .channel(channel)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table,
          ...(filter && { filter })
        }, callback)
        .subscribe();

      channelsRef.current.set(channel, realtimeChannel);
    });

    return () => {
      // Cleanup all channels
      channelsRef.current.forEach(channel => {
        supabase.removeChannel(channel);
      });
      channelsRef.current.clear();
    };
  }, [subscriptions]);

  return {
    addSubscription: (subscription: RealtimeSubscription) => {
      const { channel, table, callback, filter } = subscription;
      
      if (channelsRef.current.has(channel)) return;

      const realtimeChannel = supabase
        .channel(channel)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table,
          ...(filter && { filter })
        }, callback)
        .subscribe();

      channelsRef.current.set(channel, realtimeChannel);
    },
    removeSubscription: (channel: string) => {
      const existingChannel = channelsRef.current.get(channel);
      if (existingChannel) {
        supabase.removeChannel(existingChannel);
        channelsRef.current.delete(channel);
      }
    }
  };
}
