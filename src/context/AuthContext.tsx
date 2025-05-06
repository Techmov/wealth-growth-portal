
import React, { createContext, useState, useEffect, useContext, useCallback } from "react";
import { Profile } from "@/types/supabase";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { User as AppUser } from "@/types";

// Import the new utility files
import { useAuthState } from "@/hooks/useAuthState";
import { mapProfileToUser } from "@/utils/authMappers";
import { 
  login as loginService, 
  signup as signupService, 
  logout as logoutService,
  updateProfile as updateProfileService,
  updateTrc20Address as updateTrc20AddressService,
  deposit as depositService,
  requestWithdrawal as requestWithdrawalService
} from "@/services/authService";

export interface AuthContextType {
  user: AppUser | null;
  profile: Profile | null;
  isLoading: boolean;
  session: Session | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, referralCode?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (userData: Partial<Profile>) => Promise<void>;
  updateUser: (userData: Partial<AppUser>) => Promise<void>;
  updateTrc20Address: (address: string) => Promise<void>;
  deposit: (amount: number, txHash: string, screenshot?: File) => Promise<void>;
  requestWithdrawal: (amount: number) => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  
  const { 
    user, 
    setUser, 
    profile, 
    setProfile, 
    isLoading, 
    setIsLoading,
    session,
    setSession,
    isAdmin,
    setIsAdmin,
    fetchProfile
  } = useAuthState();

  // Set up authentication state listener
  useEffect(() => {
    setIsLoading(true);
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      
      if (initialSession?.user) {
        // Use setTimeout to avoid potential deadlocks with Supabase auth
        setTimeout(() => {
          fetchProfile(initialSession.user.id);
        }, 0);
      } else {
        setUser(null);
        setProfile(null);
        setIsAdmin(false);
        setIsLoading(false);
      }
    });
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log("Auth state changed:", event);
        setSession(currentSession);
        
        if (currentSession?.user) {
          // Use setTimeout to avoid potential deadlocks with Supabase auth
          setTimeout(() => {
            fetchProfile(currentSession.user.id);
          }, 0);
        } else {
          setUser(null);
          setProfile(null);
          setIsAdmin(false);
        }
        
        setIsLoading(false);
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile, setIsAdmin, setIsLoading, setProfile, setSession, setUser]);

  // Function to update user data in application state
  const updateUser = async (userData: Partial<AppUser>) => {
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    // Update local state
    setUser({...user, ...userData});
    return Promise.resolve();
  };

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      await loginService(email, password);
    } catch (error: any) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Signup function
  const signup = async (name: string, email: string, password: string, referralCode?: string) => {
    try {
      setIsLoading(true);
      const userData = await signupService(name, email, password, referralCode);
      if (userData?.user) {
        await fetchProfile(userData.user.id);
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await logoutService();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Update profile function
  const updateProfile = async (userData: Partial<Profile>) => {
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    try {
      await updateProfileService(user.id, userData);
      fetchProfile(user.id);
    } catch (error) {
      console.error("Update profile error:", error);
      throw error;
    }
  };

  // Update TRC20 address function
  const updateTrc20Address = async (address: string) => {
    try {
      await updateTrc20AddressService(address);
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  };

  // Deposit function
  const deposit = async (amount: number, txHash: string, screenshot?: File) => {
    if (!user || !profile) {
      throw new Error("User not authenticated");
    }
    
    try {
      await depositService(user.id, amount, txHash, screenshot);
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  };

  // Request withdrawal function
  const requestWithdrawal = async (amount: number) => {
    if (!user || !profile) {
      throw new Error("User not authenticated");
    }
    
    try {
      await requestWithdrawalService(user.id, profile, amount);
      // Refresh profile data
      fetchProfile(user.id);
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        isLoading,
        login,
        signup,
        logout,
        updateProfile,
        updateUser,
        updateTrc20Address,
        deposit,
        requestWithdrawal,
        isAdmin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within a AuthProvider");
  }
  return context;
};
