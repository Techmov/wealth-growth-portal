
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
      // Ensure productId is being passed as a proper string
      console.log("Investing with product ID:", productId);
      
      // Make API call to the edge function
      const { data, error } = await supabase.functions.invoke('create-investment', {
        body: { 
          userId: user.id,
          productId: productId 
        }
      });

      if (error) {
        console.error("Investment error:", error);
        throw new Error(error.message || "Failed to create investment");
      }

      // Check if the response indicates success
      if (!data || (data as any).error) {
        console.error("Investment request failed:", (data as any).error || "Unknown error");
        throw new Error((data as any).error?.message || "Failed to process investment request");
      }

      toast.success(`Successfully invested in this product`);
      return data;
    } catch (error: any) {
      console.error("Investment failed with error:", error);
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

  // Enhanced function to get user's downlines with better error handling and querying
  const getUserDownlines = async (): Promise<Downline[]> => {
    if (!user) return [];

    try {
      console.log("Fetching downlines for user with referral code:", user.referralCode);
      
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

      console.log("Fetched downlines data:", data);

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
