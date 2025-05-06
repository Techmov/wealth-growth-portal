
import { useState, useCallback } from "react";
import { Profile } from "@/types/supabase";
import { User as AppUser } from "@/types";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { mapProfileToUser } from "@/utils/authMappers";

export const useAuthState = () => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  // Reset login success flag after redirection
  const resetLoginSuccess = useCallback(() => {
    setLoginSuccess(false);
  }, []);

  // Function to fetch user profile from Supabase
  const fetchProfile = useCallback(async (userId: string): Promise<void> => {
    try {
      console.log("useAuthState: Fetching profile for user:", userId);
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
        
      if (error) {
        console.error("useAuthState: Error fetching profile:", error);
        setIsLoading(false);
        throw error;
      }
      
      if (data) {
        console.log("useAuthState: Profile data retrieved:", data);
        setProfile(data);
        setIsAdmin(data.role === 'admin');
        
        // Create an AppUser from the profile data
        const appUser = mapProfileToUser(data);
        console.log("useAuthState: Setting user data:", appUser);
        setUser(appUser);
      } else {
        console.log("useAuthState: No profile found for user", userId);
        throw new Error("No profile found for user");
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error("useAuthState: Unexpected error fetching profile:", error);
      setIsLoading(false);
      throw error;
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
