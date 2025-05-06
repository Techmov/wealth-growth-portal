
import { createContext, useContext, ReactNode } from "react";
import { Session } from "@supabase/supabase-js";
import { AuthContextType } from "@/types/auth";
import { useAuthController } from "@/hooks/useAuthController";
import { useAuthInitialization } from "@/hooks/useAuthInitialization";

// Create the auth context
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
}

// Export the auth provider component
export function AuthProvider({ children }: AuthProviderProps) {
  // Use the auth controller hook for shared state and methods
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
    fetchProfile,
    login,
    signup,
    logout,
    updateUser,
    updateTrc20Address,
    requestWithdrawal,
    deposit
  } = useAuthController();

  // Initialize auth state and set up listeners
  useAuthInitialization({
    setSession,
    setUser,
    setProfile,
    setIsAdmin,
    setIsLoading,
    fetchProfile
  });

  // Prepare the context value
  const contextValue: AuthContextType = {
    user,
    profile,
    session,
    isLoading,
    isAdmin,
    login,
    signup,
    logout,
    updateUser,
    updateTrc20Address,
    requestWithdrawal,
    fetchProfile,
    deposit
  };

  // Provide the auth context to children
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook for accessing auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
