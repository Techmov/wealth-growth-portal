
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
    try {
      console.log("Initializing auth state...");
      
      // First set up the auth listener BEFORE checking the session
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, currentSession) => {
          console.log("Auth state changed:", event);
          setSession(currentSession);
          
          // Only fetch profile if we have a user and it's a SIGNED_IN event
          if (currentSession?.user && event === 'SIGNED_IN') {
            console.log("User signed in, fetching profile...");
            // Use setTimeout to prevent Supabase auth deadlock
            setTimeout(() => {
              fetchProfile(currentSession.user.id).catch(err => {
                console.error("Error fetching profile on auth change:", err);
                setIsLoading(false);
              });
            }, 0);
          } else if (!currentSession) {
            // If there's no session, ensure we're not in loading state
            setIsLoading(false);
          }
        }
      );

      // Then check for existing session
      const { data: { session } } = await supabase.auth.getSession();
      console.log("Existing session check:", session ? "Found session" : "No session");
      
      setSession(session);
      
      if (session?.user) {
        try {
          await fetchProfile(session.user.id);
        } catch (error) {
          console.error("Error fetching profile during initialization:", error);
        } finally {
          // Always ensure loading state is concluded
          setIsLoading(false);
        }
      } else {
        // No session, so we're not loading anymore
        setIsLoading(false);
      }

      return () => {
        subscription.unsubscribe();
      };
    } catch (error) {
      console.error("Error during auth initialization:", error);
      // Make sure to set loading to false on error too
      setIsLoading(false);
    }
  }, [setSession, setIsLoading, fetchProfile]);

  // Call the initialization function
  useEffect(() => {
    const cleanup = initializeAuth();
    return () => {
      cleanup.then(unsubscribe => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      }).catch(err => {
        console.error("Error cleaning up auth initialization:", err);
      });
    };
  }, [initializeAuth]);
};
