import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { User, Product, Downline } from "@/types";

export function useInvestmentActions(user: User | null) {
  const invest = async (productId: string) => {
    if (!user) {
      toast.error("You must be logged in to invest");
      return;
    }

    try {
      console.log("Attempting investment for product:", productId);

      const { data: productData, error: productError } = await supabase
        .from("products")
        .select("amount")
        .eq("id", productId)
        .single();

      if (productError || !productData) {
        throw new Error("Failed to fetch product information");
      }

      const investmentAmount = productData.amount;

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("balance, total_invested")
        .eq("id", user.id)
        .single();

      if (profileError || !profileData) {
        throw new Error("Failed to fetch user profile");
      }

      if (profileData.balance < investmentAmount) {
        toast.error("Insufficient balance to invest");
        return;
      }

      const response = await supabase.functions.invoke("create-investment", {
        body: { userId: user.id, productId },
      });

      const { data, error, status } = response;

      if (status < 200 || status >= 300) {
        console.error("Edge Function error response:", response);
        const message =
          (data && typeof data === "object" && data.error) ||
          error?.message ||
          "Investment failed";
        throw new Error(message);
      }

      const newBalance = profileData.balance - investmentAmount;
      const newTotalInvested =
        (profileData.total_invested || 0) + investmentAmount;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          balance: newBalance,
          total_invested: newTotalInvested,
        })
        .eq("id", user.id);

      if (updateError) {
        console.warn(
          "Investment succeeded, but failed to update balance/investment:",
          updateError
        );
        toast.warning("Investment succeeded, but profile update failed.");
      } else {
        toast.success(
          "Investment successful — balance and total invested updated"
        );
      }

      return data;
    } catch (error: any) {
      console.error("Investment failed:", error);
      toast.error(error.message || "Investment failed");
      throw error;
    }
  };

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

      const amount = typeof data?.amount === "number" ? data.amount : 0;
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
      console.log("Fetching downlines for:", user.referralCode);

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
