
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

      // Use Supabase Edge Function to create the investment
      const response = await supabase.functions.invoke("create-investment", {
        body: { 
          userId: user.id, 
          productId: productId 
        },
      });
      
      // Check for errors in the response
      if (response.error || !response.data) {
        const errorMessage = response.error?.message || "Investment creation failed";
        console.error("Investment error:", errorMessage);
        throw new Error(errorMessage);
      }

      // Check for error property in the data
      if (response.data.error) {
        const errorMessage = response.data.error || "Investment failed";
        console.error("Investment error:", errorMessage);
        throw new Error(errorMessage);
      }

      console.log("Investment successful:", response.data);
      toast.success("Investment successful! Your portfolio has been updated");
      
      return response.data;
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
      console.log("Fetching downlines for:", user.id);

      // First, get the user's referral code
      const { data: userData, error: userError } = await supabase
        .from("profiles")
        .select("referral_code")
        .eq("id", user.id)
        .single();

      if (userError || !userData?.referral_code) {
        console.error("Error fetching user's referral code:", userError);
        return [];
      }

      // Then fetch all users referred by this code
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, total_invested, referral_bonus, created_at")
        .eq("referred_by", userData.referral_code)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching downlines:", error);
        return [];
      }

      return (data || []).map((profile) => ({
        id: profile.id,
        username: profile.username || "Anonymous",
        totalInvested: profile.total_invested || 0,
        bonusGenerated: (profile.total_invested || 0) * 0.05, // 5% referral bonus
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
