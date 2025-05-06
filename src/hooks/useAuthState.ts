
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

  // Function to fetch user profile from Supabase
  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
        
      if (error) {
        console.error("Error fetching profile:", error);
        return;
      }
      
      if (data) {
        setProfile(data);
        setIsAdmin(data.role === 'admin');
        
        // Create an AppUser from the profile data
        const appUser = mapProfileToUser(data);
        setUser(appUser);
      } else {
        // If no profile found but user exists, we might need to create one
        console.log("No profile found for user", userId);
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
    fetchProfile
  };
};
