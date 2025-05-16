import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext"; // ✅ Use this to get `user`

export function useUserInvestmentData() {
  const { user } = useAuth(); // ✅ Correctly access user inside the hook
  const [userInvestments, setUserInvestments] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState([]);
  const [totalInvested, setTotalInvested] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    setIsLoading(true);
    supabase
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
        created_at
      `)
      .eq("user_id", user.id)
      .then(({ data, error }) => {
        if (error) {
          setUserInvestments([]);
        } else {
          // Map snake_case to camelCase if needed
          setUserInvestments(
            data.map(inv => ({
              ...inv,
              starting_value: inv.starting_value,
              current_value: inv.current_value,
              daily_growth_rate: inv.daily_growth_rate,
              start_date: inv.start_date,
              end_date: inv.end_date,
              created_at: inv.created_at,
            }))
          );
        }
        setIsLoading(false);
      });

    // Fetch transactions and withdrawalRequests as needed...
  }, [user]);

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
