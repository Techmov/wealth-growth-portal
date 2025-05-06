
import { createContext, useContext, useEffect, ReactNode } from "react";
import { useAuthController } from "@/hooks/useAuthController";
import { UserProfile } from "@/types";
import { Session } from "@supabase/supabase-js";

// Define the type for the authentication context
interface AuthContextType {
  user: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<any>;
  signup: (name: string, email: string, password: string, referralCode?: string) => Promise<any>;
  logout: () => Promise<void>;
  updateUser: (userData: any) => Promise<void>;
  updateTrc20Address: (address: string, withdrawalPassword?: string) => Promise<void>;
  requestWithdrawal: (amount: number, trc20Address: string, withdrawalPassword?: string) => Promise<any>;
  deposit: (amount: number, txHash: string) => Promise<void>;
  loginSuccess: boolean;
  resetLoginSuccess: () => void;
}

// Create the authentication context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define the authentication provider component
export function AuthProvider({ children }: { children: ReactNode }) {
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
    resetLoginSuccess
  } = useAuthController();

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
