import { createContext, useContext, useEffect, ReactNode, useState } from "react";
import { useAuthState } from "@/hooks/useAuthState";
import { useAuthActions } from "@/hooks/useAuthActions";
import { useAuthInitialization } from "@/hooks/useAuthInitialization";
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
  requestWithdrawal: (amount: number, trc20Address: string, withdrawalSource?: 'profit' | 'referral_bonus', withdrawalPassword?: string) => Promise<any>;
  deposit: (amount: number, txHash: string) => Promise<void>;
  loginSuccess: boolean;
  resetLoginSuccess: () => void;
}

// Create the authentication context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define the authentication provider component
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
  const {
    login,
    signup,
    logout,
    updateUser,
    updateTrc20Address,
    requestWithdrawal,
    deposit
  } = useAuthActions({
    user,
    setUser,
    setIsLoading,
    setSession,
    fetchProfile,
    setLoginSuccess
  });

  // Initialize auth with custom hook
  useAuthInitialization({
    setSession,
    setIsLoading,
    fetchProfile
  });

  // Effect for debugging auth state
  useEffect(() => {
    console.log("AuthContext: Auth state updated", { 
      hasSession: !!session, 
      hasUser: !!user, 
      isLoading, 
      loginSuccess 
    });
  }, [session, user, isLoading, loginSuccess]);

  // Use a simpler loading state without additional initialization flag
  if (isLoading) {
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

/*
async function signup(name, email, password, referralCode) {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });
  if (authError) throw authError;

  const userId = authData?.user?.id;
  if (!userId) throw new Error("User ID not available after sign up.");

  let referred_by = null;
  let referred_by_code = null;
  if (referralCode) {
    const { data: refUser } = await supabase
      .from("profiles")
      .select("id, referral_code")
      .eq("referral_code", referralCode)
      .single();
    if (refUser && refUser.id) {
      referred_by = refUser.id;
      referred_by_code = refUser.referral_code;
    }
  }

  console.log({ referred_by, referred_by_code }); // Debug log

  const { error: profileError } = await supabase
    .from("profiles")
    .insert({
      id: userId,
      full_name: name,
      email,
      referral_code: generateReferralCode(), // your logic
      referred_by,         // <-- use exact column name
      referred_by_code,    // <-- use exact column name
    });
  if (profileError) throw profileError;
}
*/
