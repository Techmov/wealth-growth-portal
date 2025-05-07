
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { User, Product } from "@/types";

export function useInvestmentActions(user: User | null) {
  const invest = async (productId: string) => {
    if (!user) {
      toast.error("You must be logged in to invest");
      return;
    }

    try {
      // Instead of using RPC, we'll use an insert directly
      const { data, error } = await supabase
        .from('investments')
        .insert({
          user_id: user.id,
          product_id: productId,
          status: 'active'
          // The database trigger will handle the other fields
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message || "Failed to create investment");
      }

      toast.success(`Successfully invested in this product`);
      // Return void to match the expected return type
      return;
    } catch (error: any) {
      toast.error(error.message || "Investment failed");
      throw error;
    }
  };

  // New function to claim profit from an investment
  const claimProfit = async (investmentId: string) => {
    if (!user) {
      toast.error("You must be logged in to claim profit");
      return;
    }

    try {
      const { data, error } = await supabase.rpc('claim_investment_profit', {
        p_investment_id: investmentId
      });

      if (error) {
        throw new Error(error.message || "Failed to claim profit");
      }

      // Safely access the amount property with type checking
      let claimedAmount = 0;
      if (data && typeof data === 'object' && 'amount' in data) {
        claimedAmount = typeof data.amount === 'number' ? data.amount : 0;
      }

      toast.success(`Successfully claimed $${claimedAmount.toFixed(2)} profit`);
      return data;
    } catch (error: any) {
      toast.error(error.message || "Failed to claim profit");
      throw error;
    }
  };

  // Calculate claimable profit amount (for display/preview)
  const getClaimableProfit = async (investmentId: string) => {
    if (!user) return 0;

    try {
      const { data, error } = await supabase.rpc('calculate_claimable_profit', {
        p_investment_id: investmentId
      });

      if (error) {
        console.error("Error calculating claimable profit:", error);
        return 0;
      }

      return data || 0;
    } catch (error) {
      console.error("Unexpected error calculating profit:", error);
      return 0;
    }
  };

  // Handle referral bonuses
  const getReferralBonus = async (referralCode: string) => {
    if (!user) {
      toast.error("You must be logged in to claim referral bonus");
      return;
    }

    try {
      // In a real app, we'd verify this code against the database
      if (referralCode && referralCode !== user.referralCode) {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // This function now just notifies user that bonuses are automatically added
        toast.info("Referral bonuses are automatically added to your account when a referred user makes a deposit.");
      } else {
        toast.error("Invalid referral code");
      }
    } catch (error) {
      toast.error("Failed to process referral code");
    }
  };

  // Get user's downlines (referred users)
  const getUserDownlines = () => {
    if (!user) return [];

    // This would need to be implemented with actual data from Supabase
    // For now, we'll return an empty array as a placeholder
    return [];
  };

  return {
    invest,
    claimProfit,
    getClaimableProfit,
    getReferralBonus,
    getUserDownlines
  };
}
