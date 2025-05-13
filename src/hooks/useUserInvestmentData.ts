
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
        console.log("Fetching investments for user:", user.id);
        
        // Fetch user's investments - treating IDs as strings in the query
        const { data: investmentsData, error: investmentsError } = await supabase
          .from('investments')
          .select('*')
          .eq('user_id', user.id);

        if (investmentsError) {
          console.error("Error fetching investments:", investmentsError);
        } else if (investmentsData) {
          // Map Supabase data to our Investment type, ensuring correct type conversion
          const mappedInvestments: Investment[] = investmentsData.map(inv => ({
            id: String(inv.id),
            userId: String(inv.user_id || ""),
            productId: String(inv.product_id || ""),
            amount: Number(inv.amount || 0),
            startDate: new Date(inv.start_date || inv.created_at),
            endDate: new Date(inv.end_date || Date.now()),
            startingValue: Number(inv.starting_value || 0),
            currentValue: Number(inv.current_value || 0),
            finalValue: Number(inv.final_value || 0),
            status: (inv.status as 'active' | 'completed' | 'cancelled') || 'active',
            lastProfitClaimDate: inv.last_profit_claim_date ? new Date(inv.last_profit_claim_date) : undefined
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
            type: tx.type as 'deposit' | 'withdrawal' | 'investment' | 'return' | 'referral' | 'profit',
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
