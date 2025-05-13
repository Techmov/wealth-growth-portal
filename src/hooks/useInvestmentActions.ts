import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { User, Downline } from "@/types";

export function useInvestmentActions(user: User | null) {
  // Accepts full investment data object, not just productId
  const invest = async (investmentData: {
    userId: string;
    productId: string;
    amount: number;
    startDate: string;
    endDate: string;
    status: string;
    currentValue: number;
    startingValue: number;
    finalValue: number;
    dailyGrowthRate: number;
    lastProfitClaimDate: string;
  }) => {
    if (!user) {
      toast.error("You must be logged in to invest");
      return;
    }

    try {
      // Check user profile for balance
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("balance, total_invested")
        .eq("id", user.id)
        .single();

      if (profileError || !profileData) {
        throw new Error("Failed to fetch user profile");
      }

      if (profileData.balance < investmentData.amount) {
        toast.error("Insufficient balance to invest");
        return;
      }

      // Insert investment directly
      const { error: investError } = await supabase
        .from("investments")
        .insert([
          {
            user_id: investmentData.userId,
            product_id: investmentData.productId,
            amount: investmentData.amount,
            start_date: investmentData.startDate,
            end_date: investmentData.endDate,
            status: investmentData.status,
            current_value: investmentData.currentValue,
            starting_value: investmentData.startingValue,
            final_value: investmentData.finalValue,
            daily_growth_rate: investmentData.dailyGrowthRate,
            last_profit_claim_date: investmentData.lastProfitClaimDate,
          },
        ]);

      if (investError) {
        throw new Error(investError.message || "Failed to create investment");
      }

      // Update user balance and total invested
      const newBalance = profileData.balance - investmentData.amount;
      const newTotalInvested =
        (profileData.total_invested || 0) + investmentData.amount;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          balance: newBalance,
          total_invested: newTotalInvested,
        })
        .eq("id", user.id);

      if (updateError) {
        toast.warning("Investment succeeded, but profile update failed.");
      } else {
        toast.success("Investment successful — balance and total invested updated");
      }
    } catch (error: any) {
      console.error("Investment failed:", error);
      toast.error(error.message || "Investment failed");
      throw error;
    }
  };

  // Claim profit: sets last_profit_claim_date to end_date, adds final_value to balance, marks as completed
  const claimProfit = async (investmentId: string) => {
    if (!user) {
      toast.error("You must be logged in to claim profit");
      return;
    }

    try {
      // Fetch the investment
      const { data: investment, error: invError } = await supabase
        .from("investments")
        .select("*")
        .eq("id", investmentId)
        .single();

      if (invError || !investment) {
        throw new Error("Investment not found");
      }

      const now = new Date();
      const endDate = new Date(investment.end_date);

      // Only allow claim if investment is matured and not already claimed
      if (now < endDate) {
        toast.error("You can only claim profit after the investment matures.");
        return;
      }
      if (investment.status === "completed" || investment.last_profit_claim_date) {
        toast.info("Profit already claimed for this investment.");
        return;
      }

      // Add final_value to user's balance
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("balance")
        .eq("id", user.id)
        .single();

      if (profileError || !profile) {
        throw new Error("Failed to fetch user profile");
      }

      const newBalance = (profile.balance || 0) + (investment.final_value || 0);

      // Update user balance
      const { error: updateProfileError } = await supabase
        .from("profiles")
        .update({ balance: newBalance })
        .eq("id", user.id);

      if (updateProfileError) {
        throw new Error("Failed to update user balance");
      }

      // Mark investment as completed/expired and set last_profit_claim_date
      const { error: updateInvestmentError } = await supabase
        .from("investments")
        .update({
          status: "completed",
          last_profit_claim_date: investment.end_date,
        })
        .eq("id", investmentId);

      if (updateInvestmentError) {
        throw new Error("Failed to update investment status");
      }

      toast.success(`Successfully claimed $${investment.final_value} profit`);
      return { amount: investment.final_value };
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

  const getReferralBonus = async (referralCode: string) => {
    if (!user) {
      toast.error("You must be logged in to claim referral bonus");
      return;
    }

    try {
      if (referralCode && referralCode !== user.referralCode) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        toast.info(
          "Referral bonuses are automatically added when referrals invest."
        );
      } else {
        toast.error("Invalid referral code");
      }
    } catch (error) {
      console.error("Referral bonus error:", error);
      toast.error("Failed to process referral code");
    }
  };

  const getUserDownlines = async (): Promise<Downline[]> => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, total_invested, referral_bonus, created_at")
        .eq("referred_by", user.referralCode)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching downlines:", error);
        return [];
      }

      return (data || []).map((profile) => ({
        id: profile.id,
        username: profile.username || "Anonymous",
        totalInvested: profile.total_invested || 0,
        bonusGenerated: (profile.total_invested || 0) * 0.05,
        date: new Date(profile.created_at || Date.now()),
      }));
    } catch (error) {
      console.error("Unexpected error fetching downlines:", error);
      return [];
    }
  };

  return {
    invest,
    claimProfit,
    getClaimableProfit,
    getReferralBonus,
    getUserDownlines,
  };
}
