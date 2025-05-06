
import { supabase } from './client';

// Initialize all realtime subscriptions
export function initializeRealtimeSubscriptions() {
  // Listen for profile changes
  const profilesChannel = supabase
    .channel('profiles-changes')
    .on(
      'postgres_changes',
      {
        event: '*', 
        schema: 'public',
        table: 'profiles'
      },
      (payload) => {
        console.log('Profile change received:', payload);
      }
    )
    .subscribe();

  // Listen for transaction changes
  const transactionsChannel = supabase
    .channel('transactions-changes')
    .on(
      'postgres_changes',
      {
        event: '*', 
        schema: 'public',
        table: 'transactions'
      },
      (payload) => {
        console.log('Transaction change received:', payload);
      }
    )
    .subscribe();

  // Listen for investment changes
  const investmentsChannel = supabase
    .channel('investments-changes')
    .on(
      'postgres_changes',
      {
        event: '*', 
        schema: 'public',
        table: 'investments'
      },
      (payload) => {
        console.log('Investment change received:', payload);
      }
    )
    .subscribe();

  return {
    profilesChannel,
    transactionsChannel,
    investmentsChannel,
    cleanup: () => {
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(transactionsChannel);
      supabase.removeChannel(investmentsChannel);
    }
  };
}
