
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
      .select("id, referral_code")
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

    // Increment the referrer's total_referred_users count using the typed incrementValue function
    await supabase
      .from("profiles")
      .update({ total_referred_users: (referrerData.total_referred_users || 0) + 1 })
      .eq("id", referrerData.id);

    toast.success("Referral code applied successfully!");
    return true;
  } catch (error: any) {
    console.error("Error applying referral code:", error);
    toast.error(error.message || "Failed to apply referral code");
    return false;
  }
};
