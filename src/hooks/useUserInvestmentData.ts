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
      .select(
        `
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
      `
      )
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
      const lastProfitClaimDate = new Date(investment.last_profit_claim_date);

      // Calculate days elapsed since last profit claim
      const diffMs = today.getTime() - lastProfitClaimDate.getTime();
      const daysElapsed = Math.max(
        0,
        Math.floor(diffMs / (1000 * 60 * 60 * 24))
      ); // no negative days

      // If no days passed, no update needed
      // if (daysElapsed <= 0) {
      //   console.log("⏳ No update needed. daysElapsed =", daysElapsed);
      //   window.alert("No new profit to claim yet.");
      //   return;
      // }

      const { amount, daily_growth_rate, current_value } = investment;

      // Calculate total profit to add over elapsed days
      const dailyGrowth = Number(amount) * (daily_growth_rate / 100);
      const profitToAdd = dailyGrowth;

      // Then:
      const newCurrentValue =
        parseFloat(
          (Math.abs(current_value) + Math.abs(profitToAdd)).toFixed(2)
        );

      console.log("📈 Adding profit:", profitToAdd);
      console.log(
        "🔄 Old value:",
        current_value,
        "➡️ New value:",
        newCurrentValue
      );

      // Perform the update in Supabase
      const { data: updateData, error: updateError } = await supabase
        .from("investments")
        .update({
          amount: newCurrentValue,
          current_value: newCurrentValue,
          last_profit_claim_date: today.toISOString().split("T")[0],
        })
        .eq("id", investmentId.trim())
        .select();
      console.log("Updating investment with id:", `"${investmentId.trim()}"`);

      if (updateError) {
        console.error(
          `❌ Error updating investment ${investmentId}:`,
          updateError.message
        );
        window.alert("Failed to update investment.");
        return;
      }

      if (!updateData || updateData.length === 0) {
        console.warn("⚠️ Update returned no rows - maybe no matching ID?");
        window.alert("Update did not affect any rows.");
        return;
      }

      console.log("✅ Updated data:", updateData);

      // Confirm updated row by fetching it again
      const { data: confirmedData, error: confirmError } = await supabase
        .from("investments")
        .select()
        .eq("id", investmentId.trim())
        .single();

      if (confirmError) {
        console.error(
          "❌ Error fetching updated investment:",
          confirmError.message
        );
      } else {
        console.log("✅ Confirmed updated investment:", confirmedData);
      }

      window.alert(
        `Investment updated. Profit of ${profitToAdd.toFixed(2)} added.`
      );
    },
    [user, userInvestments]
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
    updateInvestmentProfits, // ✅ return this so you can use it outside
  };
  }
