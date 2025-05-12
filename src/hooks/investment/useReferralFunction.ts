
import { User, Downline } from "@/types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function useReferralFunction(user: User | null) {
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

  return { getReferralBonus, getUserDownlines };
}
