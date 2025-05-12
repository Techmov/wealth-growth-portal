
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Downline, User } from "@/types";
import { toast } from "sonner";
import { applyReferralCode, refreshReferralStats } from "@/utils/referralUtils";

export function useReferralSystem(user: User | null) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [referralLink, setReferralLink] = useState<string>("");
  const [downlines, setDownlines] = useState<Downline[]>([]);
  const [referralStats, setReferralStats] = useState({
    totalReferrals: 0,
    totalBonusEarned: 0,
    pendingBonuses: 0,
  });

  useEffect(() => {
    if (user?.referralCode) {
      const baseUrl = window.location.origin;
      setReferralLink(`${baseUrl}/signup?ref=${user.referralCode}`);
      fetchDownlines();
    }
  }, [user]);

  const fetchDownlines = async () => {
    if (!user || !user.referralCode) return;

    try {
      setIsLoading(true);
      
      // First, refresh the user's referral stats to ensure latest data
      await refreshReferralStats(user.id);
      
      // Fetch all users referred by this code with complete profile info
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, total_invested, referral_bonus, created_at")
        .eq("referred_by", user.referralCode)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching downlines:", error);
        throw error;
      }

      const mappedDownlines: Downline[] = (data || []).map(profile => ({
        id: profile.id,
        username: profile.username || "Anonymous",
        totalInvested: profile.total_invested || 0,
        bonusGenerated: (profile.total_invested || 0) * 0.05, // 5% referral bonus
        date: new Date(profile.created_at || Date.now()),
      }));

      setDownlines(mappedDownlines);

      // Get the latest user stats from the database
      if (user.id) {
        const { data: userData, error: userError } = await supabase
          .from("profiles")
          .select("referral_bonus, total_referred_users, total_referred_investments")
          .eq("id", user.id)
          .single();

        if (userError) {
          console.error("Error fetching user data:", userError);
        } else if (userData) {
          setReferralStats({
            totalReferrals: userData.total_referred_users || 0,
            totalBonusEarned: userData.referral_bonus || 0,
            pendingBonuses: 0, // Currently not tracking pending separately
          });
        }
      }
    } catch (error: any) {
      console.error("Error fetching downlines:", error.message);
      toast.error("Failed to load referral data");
    } finally {
      setIsLoading(false);
    }
  };

  const copyReferralLink = () => {
    try {
      navigator.clipboard.writeText(referralLink);
      toast.success("Referral link copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy referral link");
    }
  };

  return {
    referralLink,
    copyReferralLink,
    applyReferralCode,
    downlines,
    isLoading,
    referralStats,
    refreshDownlines: fetchDownlines
  };
}
