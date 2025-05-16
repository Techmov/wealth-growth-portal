import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export function useUserInvestmentData() {
  const { user } = useAuth();
  const [userInvestments, setUserInvestments] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState([]);
  const [totalInvested, setTotalInvested] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ Define fetch function with useCallback
  const fetchUserInvestments = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);

    const { data, error } = await supabase
      .from("investments")
      .select(`
        id,
        product_id,
        amount,
        start_date,
        end_date,
        starting_value,
        current_value,
        daily_growth_rate,
        status,
        final_value,
        last_profit_claim_date,
        created_at,
        user_id
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching investments:", error.message);
      setUserInvestments([]);
      setTotalInvested(0);
    } else {
      const investments = data.map(inv => ({
        ...inv,
        starting_value: inv.starting_value,
        current_value: inv.current_value,
        daily_growth_rate: inv.daily_growth_rate,
        start_date: inv.start_date,
        end_date: inv.end_date,
        final_value: inv.final_value,
        last_profit_claim_date: inv.last_profit_claim_date,
        created_at: inv.created_at,
      }));
      setUserInvestments(investments);

      const total = investments.reduce((sum, inv) => sum + (inv.amount || 0), 0);
      setTotalInvested(total);
    }

    setIsLoading(false);
  }, [user]);

  // ✅ Call it on mount
  useEffect(() => {
    fetchUserInvestments();
  }, [fetchUserInvestments]);

  return {
    userInvestments,
    transactions,
    withdrawalRequests,
    totalInvested,
    isLoading,
    refetchUserInvestments: fetchUserInvestments,
  };
}
