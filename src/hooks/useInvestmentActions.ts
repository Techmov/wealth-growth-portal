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
      // First, get the product details to calculate the initial values
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('amount, duration, growth_rate')
        .eq('id', productId)
        .single();

      if (productError || !product) {
        throw new Error(productError?.message || "Product not found");
      }

      // Calculate end date based on product duration
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + product.duration);

      // Now insert with all required fields
      const { data, error } = await supabase
        .from('investments')
        .insert({
          user_id: user.id,
          product_id: productId,
          amount: product.amount,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          starting_value: product.amount,
          current_value: product.amount,
          final_value: product.amount * 2, // Assuming 100% return as mentioned in UI
          status: 'active'
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

  // Enhanced function to handle referral bonuses
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

  // Get user's downlines (referred users) with real data from Supabase
  const getUserDownlines = async (): Promise<Downline[]> => {
    if (!user) return [];

    try {
      // Fetch users who were referred by the current user
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, total_invested, referral_bonus, created_at')
        .eq('referred_by', user.referralCode)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching downlines:", error);
        return [];
      }

      // Map the database response to our Downline type
      return data.map(profile => ({
        id: profile.id,
        username: profile.username || 'Anonymous',
        totalInvested: profile.total_invested || 0,
        bonusGenerated: profile.total_invested ? profile.total_invested * 0.05 : 0, // 5% referral bonus
        date: new Date(profile.created_at || Date.now())
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
    getUserDownlines
  };
}
