
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
      // Generate referral link based on current URL
      const baseUrl = window.location.origin;
      setReferralLink(`${baseUrl}/signup?ref=${user.referralCode}`);
      
      // Load downlines data
      fetchDownlines();
    }
  }, [user]);

  const fetchDownlines = async () => {
    if (!user || !user.referralCode) return;
    
    try {
      setIsLoading(true);
      
      // Get users referred by this user's referral code
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, total_invested, referral_bonus, created_at")
        .eq("referred_by", user.referralCode)
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error("Error fetching downlines:", error);
        throw error;
      }
      
      // Map to downlines format
      const mappedDownlines: Downline[] = (data || []).map(profile => ({
        id: profile.id,
        username: profile.username || "Anonymous",
        totalInvested: profile.total_invested || 0,
        bonusGenerated: (profile.total_invested || 0) * 0.05, // 5% bonus
        date: new Date(profile.created_at || Date.now()),
      }));
      
      setDownlines(mappedDownlines);
      
      // Calculate summary stats
      if (mappedDownlines.length > 0) {
        const totalBonusEarned = mappedDownlines.reduce(
          (sum, downline) => sum + downline.bonusGenerated, 
          0
        );
        
        setReferralStats({
          totalReferrals: mappedDownlines.length,
          totalBonusEarned,
          pendingBonuses: 0, // Would require additional logic to track pending bonuses
        });
      }

      // Also fetch the user's current referral data directly to ensure accurate stats
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
      console.error("Error fetching downlines:", error);
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
