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
      const investments = data.map((inv) => ({
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

      const total = investments.reduce(
        (sum, inv) => sum + (inv.amount || 0),
        0
      );
      setTotalInvested(total);
    }

    setIsLoading(false);
  }, [user]);

  const updateInvestmentProfits = useCallback(
    async (investmentId: string) => {
      if (!user) {
        console.warn("No user found.");
        return;
      }

      const investment = userInvestments.find((inv) => inv.id === investmentId);
      if (!investment) {
        console.warn(`Investment with id ${investmentId} not found.`);
        return;
      }

      const today = new Date();
      const lastClaimDate = new Date(investment.last_profit_claim_date);
      const endDate = new Date(investment.end_date);
      const currentDateStr = today.toISOString().split("T")[0];

      const diffHours = (today.getTime() - lastClaimDate.getTime()) / (1000 * 60 * 60);

      if (diffHours < 24) {
        window.alert("You can only claim profit once every 24 hours.");
        return;
      }

      // If matured
      if (today >= endDate && investment.status !== "closed") {
        // Add current value to user's profile balance
        const { error: balanceUpdateError } = await supabase.rpc("increment_user_balance", {
          user_id_input: user.id,
          amount_input: investment.current_value
        });

        if (balanceUpdateError) {
          console.error("Error updating user balance:", balanceUpdateError.message);
        } else {
          // Mark investment as closed
          const { error: statusUpdateError } = await supabase
            .from("investments")
            .update({ status: "closed" })
            .eq("id", investment.id);

          if (statusUpdateError) {
            console.error("Error closing investment:", statusUpdateError.message);
          }
        }

        window.alert("Investment matured. Profit added to balance.");
        fetchUserInvestments();
        return;
      }

      const { amount, daily_growth_rate, current_value } = investment;
      const dailyGrowth = Number(amount) * (daily_growth_rate / 100);
      const profitToAdd = dailyGrowth;

      const newCurrentValue = parseFloat(
        (Math.abs(current_value) + Math.abs(profitToAdd)).toFixed(2)
      );

      const { data: updateData, error: updateError } = await supabase
        .from("investments")
        .update({
          amount: newCurrentValue,
          current_value: newCurrentValue,
          last_profit_claim_date: currentDateStr,
        })
        .eq("id", investmentId.trim())
        .select();

      if (updateError) {
        console.error(`Error updating investment ${investmentId}:`, updateError.message);
        window.alert("Failed to update investment.");
        return;
      }

      window.alert(`Investment updated. Profit of ${profitToAdd.toFixed(2)} added.`);
    },
    [user, userInvestments, fetchUserInvestments]
  );

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
    updateInvestmentProfits,
  };
}
