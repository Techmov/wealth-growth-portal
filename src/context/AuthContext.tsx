
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import * as authService from "@/services/authService";
import { toast } from "sonner";
import { mapProfileToUser } from "@/utils/authMappers";
import { useAuthState } from "@/hooks/useAuthState";
import { AuthContextType } from "@/types/auth";

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
}

// Export the auth provider component
export function AuthProvider({ children }: AuthProviderProps) {
  // Use the auth state hook for shared state management
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
  } = useAuthState();

  // Effect to initialize auth state
  useEffect(() => {
    // Get the initial session
    const getInitialSession = async () => {
      try {
        setIsLoading(true);
        
        // Get current session from Supabase
        const { data } = await supabase.auth.getSession();
        const initialSession = data?.session;

        if (initialSession) {
          setSession(initialSession);
          
          // Fetch the user profile
          await fetchProfile(initialSession.user.id);
        }

      } catch (error) {
        console.error("Error getting initial session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    getInitialSession();

    // Set up the auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        // Set the new session
        setSession(currentSession);
        
        // Handle changes to auth state
        if (event === "SIGNED_IN" && currentSession) {
          setTimeout(() => {
            fetchProfile(currentSession.user.id);
          }, 0);
        } else if (event === "SIGNED_OUT") {
          // Clear user data on sign out
          setUser(null);
          setProfile(null);
          setIsAdmin(false);
        }
      }
    );
    
    // Clean up subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { session } = await authService.login({ email, password });
      
      if (session) {
        setSession(session);
        await fetchProfile(session.user.id);
        toast.success("Login successful!");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      
      // Handle specific error codes
      if (error.message?.includes("Email not confirmed")) {
        toast.error("Please confirm your email before logging in");
      } else if (error.message?.includes("Invalid login credentials")) {
        toast.error("Invalid email or password");
      } else {
        toast.error(error.message || "Failed to login");
      }
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Signup function
  const signup = async (name: string, email: string, password: string, referralCode?: string) => {
    try {
      setIsLoading(true);
      await authService.signup({ name, email, password, referralCode });
      toast.success("Account created! Please check your email to confirm registration.");
    } catch (error: any) {
      console.error("Signup error:", error);
      
      if (error.message?.includes("User already registered")) {
        toast.error("Email already in use. Please log in instead.");
      } else {
        toast.error(error.message || "Failed to create account");
      }
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setIsLoading(true);
      await authService.logout();
      toast.success("Logged out successfully");
    } catch (error: any) {
      console.error("Logout error:", error);
      toast.error(error.message || "Failed to logout");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Update user data
  const updateUser = async (userData: any) => {
    if (!user) {
      toast.error("User not authenticated");
      return Promise.reject(new Error("User not authenticated"));
    }

    try {
      setIsLoading(true);
      await authService.updateProfile(user.id, userData);
      
      // Update local user state
      setUser({ ...user, ...userData });
      
      // Refresh user profile
      await fetchProfile(user.id);
      
      return Promise.resolve();
    } catch (error: any) {
      console.error("Update user error:", error);
      toast.error(error.message || "Failed to update user");
      return Promise.reject(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Update TRC20 address function
  const updateTrc20Address = async (address: string) => {
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    try {
      await authService.updateTrc20Address(user.id, address);
      // Refresh profile data
      fetchProfile(user.id);
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  };

  // Request withdrawal function (mock for now)
  const requestWithdrawal = async (amount: number) => {
    if (!user) {
      toast.error("User not authenticated");
      return Promise.reject(new Error("User not authenticated"));
    }

    try {
      // In a real app, this would be a call to the backend
      // For now, just create a custom event
      window.dispatchEvent(
        new CustomEvent("newWithdrawalRequest", {
          detail: {
            userId: user.id,
            amount,
            trc20Address: user.trc20Address
          }
        })
      );

      // Update user balance
      const newBalance = Math.max(0, user.balance - amount);
      const newWithdrawn = user.totalWithdrawn + amount;
      
      // Update user in localStorage for current session
      setUser({
        ...user,
        balance: newBalance,
        totalWithdrawn: newWithdrawn
      });

      // Update users in localStorage
      const storedUsers = JSON.parse(localStorage.getItem("users") || "[]");
      const updatedUsers = storedUsers.map((u: any) => {
        if (u.id === user.id) {
          return {
            ...u,
            balance: newBalance,
            totalWithdrawn: newWithdrawn
          };
        }
        return u;
      });
      localStorage.setItem("users", JSON.stringify(updatedUsers));
      
      return Promise.resolve();
    } catch (error) {
      console.error("Request withdrawal error:", error);
      return Promise.reject(error);
    }
  };

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
    fetchProfile
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
