import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import * as authService from "@/services/authService";

export const useAuthActions = ({
  user,
  setIsLoading,
  setSession,
  fetchProfile,
  setLoginSuccess,
}) => {
  // Login function
  const login = async (email: string, password: string) => {
    try {
      console.log("useAuthActions: Login attempt with email:", email);
      setIsLoading(true);
      
      const result = await authService.login({ email, password });
      
      if (!result || !result.session) {
        console.error("Login error: No session returned");
        toast.error("Failed to login");
        setIsLoading(false);
        return { success: false };
      }
      
      const session = result.session;
      
      console.log("useAuthActions: Login successful, session:", session.user.id);
      setSession(session);
      
      // Fetch profile data before setting login success
      try {
        await fetchProfile(session.user.id);
        // Set login success flag to trigger redirect
        setLoginSuccess(true);
        toast.success("Login successful!");
        return { success: true, session };
      } catch (profileError) {
        console.error("Error fetching profile:", profileError);
        toast.error("Login successful but error loading profile data");
        // Still return success since auth was successful
        return { success: true, session };
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
      
      setIsLoading(false);
      throw error;
    } finally {
      setIsLoading(false);
    }
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

  // Request withdrawal function
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

      return Promise.resolve();
    } catch (error) {
      console.error("Request withdrawal error:", error);
      return Promise.reject(error);
    }
  };

  return {
    login,
    signup,
    logout,
    updateUser,
    updateTrc20Address,
    requestWithdrawal,
    deposit
  };
};
