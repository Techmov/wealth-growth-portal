
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Downline, User } from "@/types";
import { toast } from "sonner";

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

  const applyReferralCode = async (referralCode: string): Promise<boolean> => {
    if (!user) {
      toast.error("You need to be logged in to apply a referral code");
      return false;
    }
    
    try {
      if (user.referralCode === referralCode) {
        toast.error("You cannot refer yourself");
        return false;
      }
      
      // Check if the referral code exists
      const { data, error } = await supabase
        .from("profiles")
        .select("id")
        .eq("referral_code", referralCode)
        .single();
      
      if (error || !data) {
        toast.error("Invalid referral code");
        return false;
      }
      
      // Update the user's referred_by field
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ referred_by: referralCode })
        .eq("id", user.id);
      
      if (updateError) {
        throw new Error(updateError.message);
      }
      
      toast.success("Referral code applied successfully");
      return true;
    } catch (error: any) {
      console.error("Error applying referral code:", error);
      toast.error(error.message || "Failed to apply referral code");
      return false;
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
