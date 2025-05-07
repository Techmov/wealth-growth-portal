
import { createContext, useContext, useEffect, ReactNode, useState } from "react";
import { useAuthController } from "@/hooks/useAuthController";
import { User } from "@/types";
import { Session } from "@supabase/supabase-js";
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
  } = useAuthController();

  // Effect for debugging auth state
  useEffect(() => {
    if (session) {
      console.log("AuthContext: Session active for user:", session.user.email);
    } else if (!isLoading) {
      console.log("AuthContext: No active session");
    }
  }, [session, isLoading]);

  // Effect to mark initialization complete
  useEffect(() => {
    const markInitialized = () => {
      // Small delay to ensure all auth state is properly processed
      const timer = setTimeout(() => {
        setInitialized(true);
      }, 500);
      return () => clearTimeout(timer);
    };
    
    // Only mark as initialized when loading state has settled
    if (!isLoading) {
      markInitialized();
    }
  }, [isLoading]);

  // Display loading state while initializing
  if (!initialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Initializing authentication...</p>
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
