
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { incrementValue } from "./supabaseUtils";

export const applyReferralCode = async (
  userId: string,
  referralCode: string
): Promise<boolean> => {
  try {
    if (!userId || !referralCode) {
      return false;
    }

    // Check if the referral code exists
    const { data: referrerData, error: referrerError } = await supabase
      .from("profiles")
      .select("id, referral_code, total_referred_users")
      .eq("referral_code", referralCode.toUpperCase())
      .single();

    if (referrerError || !referrerData) {
      toast.error("Invalid referral code");
      return false;
    }

    // Get the user's profile to prevent self-referral
    const { data: userData, error: userError } = await supabase
      .from("profiles")
      .select("id, referral_code")
      .eq("id", userId)
      .single();

    if (userError || !userData) {
      toast.error("Unable to verify user details");
      return false;
    }

    // Check for self-referral
    if (userData.referral_code === referralCode.toUpperCase()) {
      toast.error("You cannot refer yourself");
      return false;
    }

    // Update user profile with the referral code
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ referred_by: referralCode.toUpperCase() })
      .eq("id", userId);

    if (updateError) {
      toast.error("Failed to update referral information");
      return false;
    }

    // Increment the referrer's total_referred_users count
    const currentReferredUsers = referrerData.total_referred_users || 0;
    
    const { error: incrementError } = await supabase
      .from("profiles")
      .update({ total_referred_users: currentReferredUsers + 1 })
      .eq("id", referrerData.id);

    if (incrementError) {
      console.error("Failed to increment referred users count:", incrementError);
    }

    toast.success("Referral code applied successfully!");
    return true;
  } catch (error: any) {
    console.error("Error applying referral code:", error);
    toast.error(error.message || "Failed to apply referral code");
    return false;
  }
};

// New function to update a user's referral stats
export const refreshReferralStats = async (userId: string): Promise<void> => {
  try {
    if (!userId) return;
    
    // Get user's referral code
    const { data: userData, error: userError } = await supabase
      .from("profiles")
      .select("referral_code")
      .eq("id", userId)
      .single();
      
    if (userError || !userData?.referral_code) {
      console.error("Failed to fetch user's referral code:", userError);
      return;
    }
    
    // Count referred users
    const { count, error: countError } = await supabase
      .from("profiles")
      .select("id", { count: 'exact', head: true })
      .eq("referred_by", userData.referral_code);
    
    if (countError) {
      console.error("Failed to count referred users:", countError);
      return;
    }
    
    // Calculate total referred investments
    const { data: referredUsers, error: referredError } = await supabase
      .from("profiles")
      .select("total_invested")
      .eq("referred_by", userData.referral_code);
      
    if (referredError) {
      console.error("Failed to fetch referred users investments:", referredError);
      return;
    }
    
    const totalReferredInvestments = (referredUsers || []).reduce(
      (sum, user) => sum + (user.total_invested || 0), 0
    );
    
    // Calculate referral bonus (5% of referred investments)
    const referralBonus = totalReferredInvestments * 0.05;
    
    // Update user profile with latest stats
    await supabase
      .from("profiles")
      .update({
        total_referred_users: count || 0,
        total_referred_investments: totalReferredInvestments,
        referral_bonus: referralBonus
      })
      .eq("id", userId);
      
  } catch (error) {
    console.error("Error refreshing referral stats:", error);
  }
};
