import { useState } from "react";
import { Session } from "@supabase/supabase-js";
import { User } from "@/types";
import { Profile } from "@/types/supabase";
import { supabase } from "@/integrations/supabase/client";
import { mapProfileToUser } from "@/utils/authMappers";
import { toast } from "sonner";

/**
 * Hook for managing authentication controller logic
 * This separates the state management and authentication operations
 */
export const useAuthController = () => {
  // State management
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  // Add a specific state for tracking login redirect
  const [loginSuccess, setLoginSuccess] = useState(false);

  // Fetch user profile
  const fetchProfile = async (userId: string) => {
    try {
      console.log("useAuthController: Fetching profile for user:", userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
        
      if (error) {
        console.error("useAuthController: Error fetching profile:", error);
        setIsLoading(false);
        return;
      }
      
      if (data) {
        console.log("useAuthController: Profile data retrieved:", data);
        setProfile(data);
        setIsAdmin(data.role === 'admin');
        
        // Create an AppUser from the profile data
        const appUser = mapProfileToUser(data);
        console.log("useAuthController: Setting user data:", appUser);
        setUser(appUser);
      } else {
        console.log("useAuthController: No profile found for user", userId);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error("useAuthController: Unexpected error fetching profile:", error);
      setIsLoading(false);
    }
  };

  // Login function
  const login = async (email: string, password: string) => {
    try {
      console.log("useAuthController: Login attempt with email:", email);
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error("Login error:", error);
        
        // Handle specific error codes
        if (error.message?.includes("Email not confirmed")) {
          toast.error("Please confirm your email before logging in");
        } else if (error.message?.includes("Invalid login credentials")) {
          toast.error("Invalid email or password");
        } else {
          toast.error(error.message || "Failed to login");
        }
        
        setIsLoading(false);
        throw error;
      }
      
      const session = data.session;
      
      if (session) {
        console.log("useAuthController: Login successful, session:", session.user.id);
        setSession(session);
        
        // Set login success flag to trigger redirect
        setLoginSuccess(true);
        
        toast.success("Login successful!");
        return { success: true, session };
      }
      setIsLoading(false);
      return { success: false };
    } catch (error: any) {
      console.error("Login error:", error);
      setIsLoading(false);
      throw error;
    }
  };

  // Reset login success flag after redirection
  const resetLoginSuccess = () => {
    setLoginSuccess(false);
  };

  // Signup function
  const signup = async (name: string, email: string, password: string, referralCode?: string) => {
    try {
      setIsLoading(true);
      
      // Create user with Supabase auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            referred_by: referralCode || null,
          },
        },
      });

      if (error) {
        console.error("Signup error:", error);
        
        if (error.message?.includes("User already registered")) {
          toast.error("Email already in use. Please log in instead.");
        } else {
          toast.error(error.message || "Failed to create account");
        }
        
        throw error;
      }
      
      toast.success("Account created! Please check your email to confirm registration.");
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
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Logout error:", error);
        toast.error(error.message || "Failed to logout");
        throw error;
      }
      
      // Clear user data on sign out
      setUser(null);
      setProfile(null);
      setIsAdmin(false);
      setSession(null);
      
      toast.success("Logged out successfully");
    } catch (error: any) {
      console.error("Logout error:", error);
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
      
      const { data, error } = await supabase
        .from('profiles')
        .update(userData)
        .eq('id', user.id)
        .select()
        .single();
      
      if (error) {
        console.error("Update user error:", error);
        toast.error(error.message || "Failed to update user");
        return Promise.reject(error);
      }
      
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
      await supabase
        .from('profiles')
        .update({ trc20_address: address })
        .eq('id', user.id);
      
      // Refresh profile data
      await fetchProfile(user.id);
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  };

  // Add deposit function
  const deposit = async (amount: number, txHash: string) => {
    if (!user) {
      toast.error("User not authenticated");
      return Promise.reject(new Error("User not authenticated"));
    }

    try {
      // Create a deposit transaction record
      const { error } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          amount,
          type: 'deposit',
          status: 'pending',
          tx_hash: txHash,
          description: 'Manual deposit request'
        });
        
      if (error) {
        return Promise.reject(error);
      }
      
      toast.success("Deposit request submitted");
      return Promise.resolve();
    } catch (error: any) {
      console.error("Deposit error:", error);
      toast.error(error.message || "Failed to submit deposit");
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

  return {
    // State
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
    resetLoginSuccess,
    
    // Methods
    fetchProfile,
    login,
    signup,
    logout,
    updateUser,
    updateTrc20Address,
    requestWithdrawal,
    deposit
  };
};
