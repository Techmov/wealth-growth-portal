
import { createContext, useContext, useEffect, ReactNode, useState } from "react";
import { useAuthController } from "@/hooks/useAuthController";
import { User } from "@/types";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

// Define the type for the authentication context
interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<any>;
  signup: (name: string, email: string, password: string, referralCode?: string) => Promise<any>;
  logout: () => Promise<void>;
  updateUser: (userData: any) => Promise<void>;
  updateTrc20Address: (address: string, withdrawalPassword?: string) => Promise<void>;
  requestWithdrawal: (amount: number, trc20Address: string, withdrawalSource: 'profit' | 'referral_bonus', withdrawalPassword?: string) => Promise<any>;
  deposit: (amount: number, txHash: string) => Promise<void>;
  loginSuccess: boolean;
  resetLoginSuccess: () => void;
}

// Create the authentication context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define the authentication provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [initialized, setInitialized] = useState(false);
  
  const {
    user,
    session,
    isLoading,
    isAdmin,
    login,
    signup,
    logout,
    updateUser,
    updateTrc20Address,
    requestWithdrawal,
    deposit,
    loginSuccess,
    resetLoginSuccess,
    fetchProfile
  } = useAuthController();

  // Effect to monitor and respond to Supabase auth state changes
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log("Auth state changed:", event);
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (newSession?.user?.id) {
          await fetchProfile(newSession.user.id);
        }
      }
      
      if (event === 'SIGNED_OUT') {
        console.log("User signed out, clearing data");
      }
    });

    // Initialize auth state
    const initializeAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        
        if (data.session?.user?.id) {
          await fetchProfile(data.session.user.id);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        setInitialized(true);
      }
    };
    
    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Display loading state while initializing
  if (!initialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading authentication...</p>
        </div>
      </div>
    );
  }

  // Make the authentication details available to all child components
  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isAdmin,
        login,
        signup,
        logout,
        updateUser,
        updateTrc20Address,
        requestWithdrawal,
        deposit,
        loginSuccess,
        resetLoginSuccess
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Define the hook to use the authentication context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
