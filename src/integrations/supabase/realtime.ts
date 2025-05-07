
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
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log("✅ Profiles realtime subscription active");
      }
    });

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
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log("✅ Transactions realtime subscription active");
      }
    });

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
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log("✅ Investments realtime subscription active");
      }
    });

  // Listen for product changes
  const productsChannel = supabase
    .channel('products-changes')
    .on(
      'postgres_changes',
      {
        event: '*', 
        schema: 'public',
        table: 'products'
      },
      (payload) => {
        console.log('Product change received:', payload);
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log("✅ Products realtime subscription active");
      }
    });

  // Listen for withdrawal request changes
  const withdrawalRequestsChannel = supabase
    .channel('withdrawal-requests-changes')
    .on(
      'postgres_changes',
      {
        event: '*', 
        schema: 'public',
        table: 'withdrawal_requests'
      },
      (payload) => {
        console.log('Withdrawal request change received:', payload);
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log("✅ Withdrawal requests realtime subscription active");
      }
    });

  return {
    profilesChannel,
    transactionsChannel,
    investmentsChannel,
    productsChannel,
    withdrawalRequestsChannel,
    cleanup: () => {
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(transactionsChannel);
      supabase.removeChannel(investmentsChannel);
      supabase.removeChannel(productsChannel);
      supabase.removeChannel(withdrawalRequestsChannel);
    }
  };
}
