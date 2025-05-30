
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export function useUserInvestmentData() {
  const { user } = useAuth();
  const [userInvestments, setUserInvestments] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState<any[]>([]);
  const [totalInvested, setTotalInvested] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserInvestments = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);

    try {
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

      if (error) throw error;

      const investments = data.map(inv => ({
        ...inv,
        start_date: new Date(inv.start_date),
        end_date: new Date(inv.end_date),
        created_at: new Date(inv.created_at),
        // Ensure last_profit_claim_date matches created_at for new investments
        last_profit_claim_date: inv.last_profit_claim_date 
          ? new Date(inv.last_profit_claim_date)
          : new Date(inv.created_at),
      }));

      setUserInvestments(investments);
      setTotalInvested(investments.reduce((sum, inv) => sum + (inv.amount || 0), 0));
    } catch (error: any) {
      console.error("Error fetching investments:", error.message);
      setUserInvestments([]);
      setTotalInvested(0);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const updateInvestmentProfits = useCallback(
    async (investmentId: string) => {
      if (!user) return;

      const investment = userInvestments.find(inv => inv.id === investmentId);
      if (!investment) {
        console.warn("Investment not found");
        return;
      }

      if (investment.status === "closed") {
        alert("Investment closed");
        return;
      }

      const now = new Date();
      const endDate = new Date(investment.end_date);
      endDate.setHours(23, 59, 59, 999);

      // Use client-side calculated claim date
      const lastClaimDate = investment.last_profit_claim_date;

      if ((now.getTime() - lastClaimDate.getTime()) < 86400000) {
        const nextClaim = new Date(lastClaimDate.getTime() + 86400000);
        alert(`Next claim: ${nextClaim.toLocaleString()}`);
        return;
      }

      try {
        if (now >= endDate) {
          await handleMatureInvestment(investment);
        } else {
          await claimDailyProfit(investment, now);
        }
        await fetchUserInvestments();
      } catch (error: any) {
        console.error("Transaction failed:", error.message);
        alert("Operation failed");
      }
    },
    [user, userInvestments, fetchUserInvestments]
  );

  async function handleMatureInvestment(investment: any) {
    await Promise.all([
      supabase.rpc("increment_user_balance", {
        user_id_input: user!.id,
        amount_input: investment.current_value,
      }),
      supabase
        .from("investments")
        .update({ status: "closed" })
        .eq("id", investment.id),
    ]);
    alert("Investment matured successfully");
  }

  async function claimDailyProfit(investment: any, claimDate: Date) {
    const dailyProfit = Number(investment.amount) * (investment.daily_growth_rate / 100);
    const newValue = investment.current_value + dailyProfit;

    await supabase
      .from("investments")
      .update({
        current_value: newValue,
        last_profit_claim_date: claimDate.toISOString(),
      })
      .eq("id", investment.id);

    alert(`Claimed $${dailyProfit.toFixed(2)} profit`);
  }

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
