
import { useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";

interface AuthInitializationProps {
  setSession: (session: any) => void;
  setIsLoading: (loading: boolean) => void;
  fetchProfile: (userId: string) => Promise<any>;
}

export const useAuthInitialization = ({
  setSession,
  setIsLoading,
  fetchProfile
}: AuthInitializationProps) => {
  const initializeAuth = useCallback(async () => {
    // Setup a hard safety timeout to prevent infinite loading
    const safetyTimeout = setTimeout(() => {
      console.log("SAFETY TIMEOUT: Auth initialization took too long, forcing loading state to false");
      setIsLoading(false);
    }, 8000); // 8 seconds maximum before forcing loading to false
    
    try {
      console.log("Starting auth initialization...");
      setIsLoading(true);
      
      // First get current session - avoid race conditions by checking session first
      const { data: { session } } = await supabase.auth.getSession();
      console.log("Initial session check:", session ? "Found session" : "No session");
      
      // Update session state immediately
      setSession(session);
      
      // Then set up auth listener for future changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, currentSession) => {
          console.log("Auth state changed:", event);
          
          // Update session state
          setSession(currentSession);
          
          // For SIGNED_IN and TOKEN_REFRESHED events with a valid user, fetch profile
          if (currentSession?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
            console.log("User authenticated, fetching profile...");
            // Use setTimeout to avoid Supabase auth deadlock
            setTimeout(() => {
              fetchProfile(currentSession.user.id)
                .catch(err => {
                  console.error("Error fetching profile on auth change:", err);
                  setIsLoading(false);
                });
            }, 0);
          } else if (event === 'SIGNED_OUT') {
            console.log("User signed out, clearing loading state");
            setIsLoading(false);
          }
        }
      );
      
      // Handle initial session profile fetch if needed
      if (session?.user) {
        console.log("Initial session has user, fetching profile...");
        try {
          await fetchProfile(session.user.id);
        } catch (error) {
          console.error("Error fetching initial profile:", error);
        } finally {
          clearTimeout(safetyTimeout); // Clear safety timeout as we're done
          setIsLoading(false); // Ensure loading is false after profile fetch
        }
      } else {
        console.log("No initial user session, auth initialization complete");
        clearTimeout(safetyTimeout); // Clear safety timeout as we're done
        setIsLoading(false); // No user, so we're done loading
      }

      // Return cleanup function
      return () => {
        clearTimeout(safetyTimeout); // Clear safety timeout on cleanup
        subscription.unsubscribe();
      };
    } catch (error) {
      console.error("Critical error during auth initialization:", error);
      clearTimeout(safetyTimeout); // Clear safety timeout on error
      setIsLoading(false); // Ensure loading state is false on error
      return () => {}; // Empty cleanup on error
    }
  }, [setSession, setIsLoading, fetchProfile]);

  // Execute the initialization function
  useEffect(() => {
    console.log("Auth initialization hook running");
    const cleanupPromise = initializeAuth();
    
    return () => {
      cleanupPromise.then(cleanup => {
        if (typeof cleanup === 'function') {
          cleanup();
        }
      }).catch(err => {
        console.error("Error during auth cleanup:", err);
      });
    };
  }, [initializeAuth]);
};
