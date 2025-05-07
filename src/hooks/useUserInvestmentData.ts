
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Investment, Transaction, WithdrawalRequest, User } from "@/types";

export function useUserInvestmentData(user: User | null) {
  const [userInvestments, setUserInvestments] = useState<Investment[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setUserInvestments([]);
      setTransactions([]);
      setWithdrawalRequests([]);
      setIsLoading(false);
      return;
    }
    
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        // Fetch user's investments
        const { data: investmentsData, error: investmentsError } = await supabase
          .from('investments')
          .select('*')
          .eq('user_id', user.id);

        if (investmentsError) {
          console.error("Error fetching investments:", investmentsError);
        } else if (investmentsData) {
          // Map Supabase data to our Investment type
          const mappedInvestments: Investment[] = investmentsData.map(inv => ({
            id: inv.id,
            userId: inv.user_id,
            productId: inv.product_id,
            amount: inv.amount,
            startDate: new Date(inv.start_date),
            endDate: new Date(inv.end_date),
            startingValue: inv.starting_value,
            currentValue: inv.current_value,
            finalValue: inv.final_value,
            status: inv.status as 'active' | 'completed' | 'cancelled'
          }));
          
          setUserInvestments(mappedInvestments);
        }

        // Fetch user's transactions
        const { data: transactionsData, error: transactionsError } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false });

        if (transactionsError) {
          console.error("Error fetching transactions:", transactionsError);
        } else if (transactionsData) {
          // Map Supabase data to our Transaction type
          const mappedTransactions: Transaction[] = transactionsData.map(tx => ({
            id: tx.id,
            userId: tx.user_id,
            type: tx.type as 'deposit' | 'withdrawal' | 'investment' | 'return' | 'referral',
            amount: tx.amount,
            status: tx.status as 'pending' | 'completed' | 'failed' | 'rejected',
            date: new Date(tx.date || Date.now()),
            description: tx.description,
            trc20Address: tx.trc20_address,
            txHash: tx.tx_hash,
            depositScreenshot: tx.deposit_screenshot,
            rejectionReason: tx.rejection_reason
          }));
          
          setTransactions(mappedTransactions);
        }

        // Fetch user's withdrawal requests
        const { data: withdrawalData, error: withdrawalError } = await supabase
          .from('withdrawal_requests')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false });

        if (withdrawalError) {
          console.error("Error fetching withdrawal requests:", withdrawalError);
        } else if (withdrawalData) {
          // Map Supabase data to our WithdrawalRequest type
          const mappedWithdrawals: WithdrawalRequest[] = withdrawalData.map(wr => ({
            id: wr.id,
            userId: wr.user_id,
            amount: wr.amount,
            status: wr.status as 'pending' | 'approved' | 'rejected',
            date: new Date(wr.date || Date.now()),
            trc20Address: wr.trc20_address,
            txHash: wr.tx_hash,
            rejectionReason: wr.rejection_reason
          }));
          
          setWithdrawalRequests(mappedWithdrawals);
        }
      } catch (error) {
        console.error("Unexpected error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();

    // Set up real-time subscriptions
    const userInvestmentsChannel = supabase
      .channel('user-investments')
      .on('postgres_changes', 
        {
          event: '*', 
          schema: 'public',
          table: 'investments',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchUserData();
        }
      )
      .subscribe();
    
    const userTransactionsChannel = supabase
      .channel('user-transactions')
      .on('postgres_changes', 
        {
          event: '*', 
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchUserData();
        }
      )
      .subscribe();
      
    const withdrawalRequestsChannel = supabase
      .channel('withdrawal-requests')
      .on('postgres_changes', 
        {
          event: '*', 
          schema: 'public',
          table: 'withdrawal_requests',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchUserData();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(userInvestmentsChannel);
      supabase.removeChannel(userTransactionsChannel);
      supabase.removeChannel(withdrawalRequestsChannel);
    };
  }, [user]);

  return { 
    userInvestments, 
    transactions, 
    withdrawalRequests, 
    isLoading 
  };
}
