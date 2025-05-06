
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
    let isMounted = true;
    setIsLoading(true);
    
    // Set up the auth state change listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log("Auth state changed:", event);
        
        if (!isMounted) return;
        
        // Set the new session
        setSession(currentSession);
        
        // Handle changes to auth state
        if (event === "SIGNED_IN" && currentSession) {
          console.log("User signed in, fetching profile...");
          // Use setTimeout to avoid potential auth deadlock issues
          setTimeout(() => {
            if (isMounted) {
              fetchProfile(currentSession.user.id);
            }
          }, 0);
        } else if (event === "SIGNED_OUT") {
          console.log("User signed out, clearing user data");
          // Clear user data on sign out
          setUser(null);
          setProfile(null);
          setIsAdmin(false);
          setIsLoading(false); // Ensure we're not stuck in loading state
        }
      }
    );
    
    // Get the initial session after setting up the listener
    const getInitialSession = async () => {
      try {
        if (!isMounted) return;
        
        // Get current session from Supabase
        const { data } = await supabase.auth.getSession();
        const initialSession = data?.session;

        if (initialSession && isMounted) {
          setSession(initialSession);
          
          // Fetch the user profile
          await fetchProfile(initialSession.user.id);
        } else if (isMounted) {
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error getting initial session:", error);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    getInitialSession();
    
    // Clean up subscription and prevent state updates after unmounting
    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [setSession, setUser, setProfile, setIsAdmin, setIsLoading, fetchProfile]);
};
