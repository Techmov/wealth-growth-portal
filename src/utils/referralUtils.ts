
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
      .select("id")
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

    // Try to increment the referrer's total_referred_users count using direct update
    try {
      const { error: incrementError } = await supabase
        .from("profiles")
        .update({ total_referred_users: userData.total_referred_users + 1 })
        .eq("id", referrerData.id);
        
      if (incrementError) {
        console.error("Failed to increment referrer stats:", incrementError);
      }
    } catch (incrementError) {
      // Don't fail the entire operation if this fails, just log it
      console.error("Failed to increment referrer stats:", incrementError);
    }

    toast.success("Referral code applied successfully!");
    return true;
  } catch (error: any) {
    console.error("Error applying referral code:", error);
    toast.error(error.message || "Failed to apply referral code");
    return false;
  }
};
