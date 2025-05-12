
import { User } from "@/types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function useClaimProfitFunction(user: User | null) {
  const claimProfit = async (investmentId: string) => {
    if (!user) {
      toast.error("You must be logged in to claim profit");
      return;
    }

    try {
      const { data, error } = await supabase.rpc("claim_investment_profit", {
        p_investment_id: investmentId,
      });

      if (error) {
        throw new Error(error.message || "Failed to claim profit");
      }

      const amount = (data && typeof data === 'object' && 'amount' in data) ? Number(data.amount) : 0;
      toast.success(`Successfully claimed $${amount.toFixed(2)} profit`);
      return data;
    } catch (error: any) {
      console.error("Claim profit error:", error);
      toast.error(error.message || "Failed to claim profit");
      throw error;
    }
  };

  const getClaimableProfit = async (investmentId: string) => {
    if (!user) return 0;

    try {
      const { data, error } = await supabase.rpc("calculate_claimable_profit", {
        p_investment_id: investmentId,
      });

      if (error) {
        console.error("Error calculating claimable profit:", error);
        return 0;
      }

      return typeof data === "number" ? data : 0;
    } catch (error) {
      console.error("Unexpected error calculating profit:", error);
      return 0;
    }
  };

  return { claimProfit, getClaimableProfit };
}
