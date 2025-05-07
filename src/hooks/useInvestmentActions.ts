
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
      // Use the server-side procedure to handle investment creation
      const { data, error } = await supabase.rpc('create_investment', {
        p_user_id: user.id,
        p_product_id: productId,
        p_amount: 0, // Will be determined by the procedure based on product
        p_end_date: new Date(), // Will be calculated by the procedure
        p_starting_value: 0, // Will be determined by the procedure
        p_current_value: 0, // Will be determined by the procedure
        p_final_value: 0 // Will be determined by the procedure
      });

      if (error) {
        throw new Error(error.message || "Failed to create investment");
      }

      toast.success(`Successfully invested in this product`);
      return data;
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

      toast.success(`Successfully claimed $${data.amount.toFixed(2)} profit`);
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
