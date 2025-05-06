
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook for initializing authentication state and setting up listeners
 */
export const useAuthInitialization = ({
  setSession,
  setUser,
  setProfile,
  setIsAdmin,
  setIsLoading,
  fetchProfile
}: {
  setSession: (session: any) => void;
  setUser: (user: any) => void;
  setProfile: (profile: any) => void;
  setIsAdmin: (isAdmin: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
  fetchProfile: (userId: string) => Promise<void>;
}) => {
  // Effect to initialize auth state
  useEffect(() => {
    // Get the initial session
    const getInitialSession = async () => {
      try {
        setIsLoading(true);
        
        // Get current session from Supabase
        const { data } = await supabase.auth.getSession();
        const initialSession = data?.session;

        if (initialSession) {
          setSession(initialSession);
          
          // Fetch the user profile
          await fetchProfile(initialSession.user.id);
        }
      } catch (error) {
        console.error("Error getting initial session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    getInitialSession();

    // Set up the auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log("Auth state changed:", event);
        
        // Set the new session
        setSession(currentSession);
        
        // Handle changes to auth state
        if (event === "SIGNED_IN" && currentSession) {
          console.log("User signed in, fetching profile...");
          setTimeout(() => {
            fetchProfile(currentSession.user.id);
          }, 0);
        } else if (event === "SIGNED_OUT") {
          console.log("User signed out, clearing user data");
          // Clear user data on sign out
          setUser(null);
          setProfile(null);
          setIsAdmin(false);
        }
      }
    );
    
    // Clean up subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [setSession, setUser, setProfile, setIsAdmin, setIsLoading, fetchProfile]);
};
