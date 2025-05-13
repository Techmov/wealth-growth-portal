import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Downline, User } from "@/types";
import { toast } from "sonner";
import { applyReferralCode } from "@/utils/referralUtils";

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

      // Get the user's UUID from their referralCode
      const { data: refUser, error: refError } = await supabase
        .from("profiles")
        .select("id")
        .eq("referral_code", user.referralCode)
        .single();

      if (refError || !refUser?.id) {
        throw new Error("Invalid referral code or user not found");
      }

      const refUserId = refUser.id;

      // Now fetch downlines using UUID
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, total_invested, referral_bonus, created_at")
        .eq("referred_by", refUserId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching downlines:", error);
        throw error;
      }

      const mappedDownlines: Downline[] = (data || []).map(profile => ({
        id: profile.id,
        username: profile.username || "Anonymous",
        totalInvested: profile.total_invested || 0,
        bonusGenerated: (profile.total_invested || 0) * 0.05,
        date: new Date(profile.created_at || Date.now()),
      }));

      setDownlines(mappedDownlines);

      if (mappedDownlines.length > 0) {
        const totalBonusEarned = mappedDownlines.reduce(
          (sum, d) => sum + d.bonusGenerated,
          0
        );

        setReferralStats({
          totalReferrals: mappedDownlines.length,
          totalBonusEarned,
          pendingBonuses: 0,
        });
      }

      if (user.id) {
        const { data: userData, error: userError } = await supabase
          .from("profiles")
          .select("referral_bonus, total_referred_users")
          .eq("id", user.id)
          .single();

        if (!userError && userData) {
          setReferralStats(prev => ({
            ...prev,
            totalReferrals: userData.total_referred_users || mappedDownlines.length || 0,
          }));
        }
      }
    } catch (error: any) {
      console.error("Error fetching downlines:", error.message);
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
