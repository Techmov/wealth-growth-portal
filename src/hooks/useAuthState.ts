
import { useState, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
import { UserProfile } from "@/types";
import { supabase } from "@/integrations/supabase/client";

export const useAuthState = () => {
  // User state
  const [user, setUser] = useState<UserProfile | null>(null);
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loginSuccess, setLoginSuccess] = useState<boolean>(false);

  // Reset login success state
  const resetLoginSuccess = () => setLoginSuccess(false);

  // Fetch user profile from Supabase
  const fetchProfile = useCallback(async (userId: string) => {
    try {
      // Fetch profile data
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error("Error fetching profile:", error);
        setIsLoading(false);
        return;
      }
      
      if (data) {
        // Check if the user has admin role or is the specific admin email
        const isAdminUser = data.role === 'admin' || data.email === 'cranetech.co.ke@gmail.com';
        
        // Create a user profile object with all the fields we need
        const userProfile: UserProfile = {
          id: data.id,
          name: data.name || '',
          email: data.email || '',
          referralCode: data.referral_code || '',
          balance: data.balance || 0,
          totalInvested: data.total_invested || 0,
          totalWithdrawn: data.total_withdrawn || 0,
          referralBonus: data.referral_bonus || 0,
          trc20Address: data.trc20_address || '',
          withdrawalPassword: data.withdrawal_password || '',
          role: isAdminUser ? 'admin' : 'user'
        };
        
        setUser(userProfile);
        setProfile(data);
        setIsAdmin(isAdminUser);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error("Unexpected error fetching profile:", error);
      setIsLoading(false);
    }
  }, []);

  return {
    user,
    setUser,
    profile,
    setProfile,
    session,
    setSession,
    isLoading,
    setIsLoading,
    isAdmin,
    setIsAdmin,
    loginSuccess,
    setLoginSuccess,
    resetLoginSuccess,
    fetchProfile
  };
};
