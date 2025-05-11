
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { User, Product, Downline } from "@/types";
import { incrementValue } from "@/utils/supabaseUtils";

export function useInvestmentActions(user: User | null) {
  const invest = async (productId: string) => {
    if (!user) {
      toast.error("You must be logged in to invest");
      return;
    }

    try {
      console.log("Attempting investment for product:", productId);

      // Step 1: Fetch product to get investment amount
      const { data: productData, error: productError } = await supabase
        .from("products")
        .select("amount, name")
        .eq("id", productId)
        .single();

      if (productError || !productData) {
        throw new Error("Failed to fetch product information");
      }

      const investmentAmount = productData.amount;
      const productName = productData.name;

      // Step 2: Check user's current balance
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("balance")
        .eq("id", user.id)
        .single();

      if (profileError || !profileData) {
        throw new Error("Failed to fetch user profile");
      }

      if (profileData.balance < investmentAmount) {
        toast.error("Insufficient balance to invest");
        return;
      }

      // Step 3: Calculate end date based on product duration
      const { data: fullProductData, error: fullProductError } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .single();

      if (fullProductError || !fullProductData) {
        throw new Error("Failed to fetch complete product details");
      }

      const endDate = new Date();
      endDate.setDate(endDate.getDate() + (fullProductData.duration || 30));

      // Step 4: Insert investment directly using the database function
      const { data, error } = await supabase.rpc("create_investment", {
        p_user_id: user.id,
        p_product_id: productId,
        p_amount: investmentAmount,
        p_end_date: endDate.toISOString(),
        p_starting_value: investmentAmount,
        p_current_value: investmentAmount,
        p_final_value: investmentAmount * 2 // Double the investment amount
      });

      if (error) {
        console.error("Investment creation error:", error);
        throw new Error(error.message || "Failed to create investment");
      }

      toast.success(`Successfully invested in ${productName || 'investment product'}`);
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

      // Safely handle the response data - first check if data is an object
      const responseData = typeof data === 'object' && data !== null ? data : {};
      
      // Now extract the amount with proper type checking
      let claimedAmount = 0;
      if (responseData && 'amount' in responseData && typeof responseData.amount === 'number') {
        claimedAmount = responseData.amount;
      }
      
      toast.success(`Successfully claimed $${claimedAmount.toFixed(2)} profit`);
      return responseData;
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
      if (!referralCode) {
        toast.error("Please enter a referral code");
        return;
      }
      
      // Check if referral code is valid
      const { data, error } = await supabase
        .from("profiles")
        .select("id")
        .eq("referral_code", referralCode.toUpperCase())
        .single();
        
      if (error || !data) {
        toast.error("Invalid referral code");
        return;
      }
      
      // Check if user is trying to use own code
      if (user.referralCode === referralCode.toUpperCase()) {
        toast.error("You cannot use your own referral code");
        return;
      }
      
      // Update user's referred_by field
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ referred_by: referralCode.toUpperCase() })
        .eq("id", user.id);
        
      if (updateError) {
        throw new Error(updateError.message);
      }
      
      toast.success("Referral code applied successfully");
    } catch (error: any) {
      console.error("Referral bonus error:", error);
      toast.error(error.message || "Failed to process referral code");
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
        bonusGenerated: (profile.total_invested || 0) * 0.05, // 5% of total invested
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
