
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

      console.log("Fetching downlines for user with referral code:", user.referralCode);

      // Fetch profiles where referred_by matches current user's referral_code
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, total_invested, referral_bonus, created_at, email, name")
        .eq("referred_by", user.referralCode)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching downlines:", error);
        throw error;
      }

      console.log("Fetched downline data:", data);

      const mappedDownlines: Downline[] = (data || []).map(profile => ({
        id: profile.id,
        username: profile.username || profile.name || profile.email || "Anonymous",
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

  // Set up real-time subscription for new referrals
  useEffect(() => {
    if (!user?.referralCode) return;

    const referralsChannel = supabase
      .channel('referrals-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT', 
          schema: 'public',
          table: 'profiles',
          filter: `referred_by=eq.${user.referralCode}`
        },
        (payload) => {
          console.log('New referral detected:', payload);
          fetchDownlines();
          toast.success("New referral joined!");
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE', 
          schema: 'public',
          table: 'profiles',
          filter: `referred_by=eq.${user.referralCode}`
        },
        (payload) => {
          console.log('Referral information updated:', payload);
          fetchDownlines();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(referralsChannel);
    };
  }, [user?.referralCode]);

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
