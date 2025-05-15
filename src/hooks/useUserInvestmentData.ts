import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useUserInvestmentData(user) {
  const [userInvestments, setUserInvestments] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserInvestments = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);

    try {
      const { data: investmentsData, error: investmentsError } = await supabase
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
        .eq("user_id", user.id);

      if (investmentsError) {
        console.error("Error fetching investments:", investmentsError);
        setUserInvestments([]);
      } else if (investmentsData) {
        setUserInvestments(
          investmentsData.map(inv => ({
            ...inv,
            start_date: inv.start_date,
            end_date: inv.end_date,
            starting_value: inv.starting_value,
            current_value: inv.current_value,
            daily_growth_rate: inv.daily_growth_rate,
            created_at: inv.created_at,
          }))
        );
      }

      // TODO: Fetch transactions and withdrawalRequests similarly if needed

    } catch (error) {
      console.error("Unexpected error fetching investments:", error);
      setUserInvestments([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchUserInvestments();
  }, [fetchUserInvestments]);

  return {
    userInvestments,
    transactions,
    withdrawalRequests,
    isLoading,
    refetchUserInvestments: fetchUserInvestments,
  };
}
