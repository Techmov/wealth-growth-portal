
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
      // Find the product from the database
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (productError) {
        throw new Error("Product not found");
      }

      const product: Product = {
        id: productData.id,
        name: productData.name,
        description: productData.description,
        amount: productData.amount,
        duration: productData.duration,
        growthRate: productData.growth_rate,
        risk: productData.risk as 'low' | 'medium' | 'high',
        active: productData.active
      };

      // Check if user has enough balance
      if (product.amount > user.balance) {
        throw new Error("Insufficient balance");
      }

      // Calculate investment details
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + product.duration);
      const finalValue = product.amount * 2; // Double the investment amount

      // Create investment record
      const { data: investmentData, error: investmentError } = await supabase
        .from('investments')
        .insert({
          user_id: user.id,
          product_id: productId,
          amount: product.amount,
          end_date: endDate.toISOString(),
          starting_value: product.amount,
          current_value: product.amount,
          final_value: finalValue,
          status: 'active'
        })
        .select('id')
        .single();

      if (investmentError) {
        console.error("Investment error:", investmentError);
        throw new Error(investmentError.message || "Investment failed");
      }

      // Create transaction record
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: 'investment',
          amount: -product.amount, // Negative as money is leaving balance
          status: 'completed',
          description: `Investment in ${product.name}`
        });

      if (transactionError) {
        console.error("Transaction error:", transactionError);
        // Continue even if transaction record fails
      }

      // Update user balance
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          balance: user.balance - product.amount,
          total_invested: user.totalInvested + product.amount
        })
        .eq('id', user.id);

      if (profileError) {
        console.error("Profile update error:", profileError);
        // Continue even if profile update fails
      }

      toast.success(`Successfully invested $${product.amount} in ${product.name}`);

    } catch (error: any) {
      toast.error(error.message || "Investment failed");
      throw error;
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
    getReferralBonus,
    getUserDownlines
  };
}
