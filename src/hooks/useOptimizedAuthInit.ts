
import { useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";

interface OptimizedAuthInitProps {
  setSession: (session: any) => void;
  setIsLoading: (loading: boolean) => void;
  fetchProfile: (userId: string) => Promise<any>;
}

export const useOptimizedAuthInit = ({
  setSession,
  setIsLoading,
  fetchProfile
}: OptimizedAuthInitProps) => {
  const initializeAuth = useCallback(async () => {
    const safetyTimeout = setTimeout(() => {
      console.log("Auth initialization timeout reached");
      setIsLoading(false);
    }, 3000); // Reduced from 8 seconds to 3 seconds
    
    try {
      setIsLoading(true);
      
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      
      // Set up auth listener
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, currentSession) => {
          setSession(currentSession);
          
          if (currentSession?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
            // Use setTimeout to prevent auth deadlock
            setTimeout(() => {
              fetchProfile(currentSession.user.id).finally(() => setIsLoading(false));
            }, 0);
          } else if (event === 'SIGNED_OUT') {
            setIsLoading(false);
          }
        }
      );
      
      // Handle initial session
      if (session?.user) {
        try {
          await fetchProfile(session.user.id);
        } catch (error) {
          console.error("Error fetching initial profile:", error);
        }
      }
      
      clearTimeout(safetyTimeout);
      setIsLoading(false);

      return () => {
        clearTimeout(safetyTimeout);
        subscription.unsubscribe();
      };
    } catch (error) {
      console.error("Auth initialization error:", error);
      clearTimeout(safetyTimeout);
      setIsLoading(false);
      return () => {};
    }
  }, [setSession, setIsLoading, fetchProfile]);

  useEffect(() => {
    const cleanupPromise = initializeAuth();
    
    return () => {
      cleanupPromise.then(cleanup => {
        if (typeof cleanup === 'function') {
          cleanup();
        }
      }).catch(console.error);
    };
  }, [initializeAuth]);
};
