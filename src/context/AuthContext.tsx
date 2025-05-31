
import { createContext, useContext, ReactNode, useState, useMemo } from "react";
import { useAuthState } from "@/hooks/useAuthState";
import { useAuthActions } from "@/hooks/useAuthActions";
import { useOptimizedAuthInit } from "@/hooks/useOptimizedAuthInit";
import { User } from "@/types";
import { Session } from "@supabase/supabase-js";
import { Loader2 } from "lucide-react";

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
  requestWithdrawal: (amount: number, trc20Address: string, withdrawalSource?: 'profit' | 'referral_bonus', withdrawalPassword?: string) => Promise<any>;
  deposit: (amount: number, txHash: string) => Promise<void>;
  loginSuccess: boolean;
  resetLoginSuccess: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Get auth state from custom hook
  const {
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
  } = useAuthState();

  // Get auth actions from custom hook
  const authActions = useAuthActions({
    user,
    setUser,
    setIsLoading,
    setSession,
    fetchProfile,
    setLoginSuccess
  });

  // Initialize auth with optimized hook
  useOptimizedAuthInit({
    setSession,
    setIsLoading,
    fetchProfile
  });

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    user,
    session,
    isLoading,
    isAdmin,
    loginSuccess,
    resetLoginSuccess,
    ...authActions
  }), [user, session, isLoading, isAdmin, loginSuccess, authActions]);

  // Simplified loading state - single loading screen
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
