
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import * as authService from "@/services/authService"; 

export const useAuthActions = ({
  user,
  setIsLoading,
  setSession,
  fetchProfile,
  setLoginSuccess,
  setUser,
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
        toast.success("Login successful!", { 
          description: "Welcome back to your account." 
        });
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

  // Wrapper for signup to match the expected signature
  const signup = async (name: string, email: string, password: string, referralCode?: string) => {
    try {
      setIsLoading(true);
      await authService.signup({ name, email, password, referralCode });
      toast.success("Signup successful!", {
        description: "Please check your email to confirm your account."
      });
      return { user: null, session: null };
    } catch (error: any) {
      console.error("Signup error:", error);
      
      // Handle specific error codes
      if (error.message?.includes("User already registered")) {
        toast.error("This email is already registered", {
          description: "Please use a different email or try logging in."
        });
      } else {
        toast.error(error.message || "Failed to signup");
      }
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Fixed logout function with proper async handling and forced navigation
  const logout = async () => {
    try {
      setIsLoading(true);
      console.log("Logging out user");
      
      // First clear session and user state to prevent any UI flickers
      setSession(null);
      setUser(null);
      
      // Show loading toast while logging out
      const toastId = toast.loading("Logging out...");
      
      // Call Supabase auth signOut and await its completion
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      if (error) {
        console.error("Logout error:", error);
        toast.error(error.message || "Failed to logout");
        throw error;
      }
      
      // Update success toast
      toast.success("Logged out successfully", {
        id: toastId,
        description: "You have been successfully logged out."
      });
      
      // Force reload to ensure clean state
      setTimeout(() => {
        window.location.href = '/';
      }, 500);
      
    } catch (error: any) {
      console.error("Logout error:", error);
      toast.error("Logout failed", {
        description: error.message || "Something went wrong. Please try again."
      });
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
      
      const toastId = toast.loading("Updating profile...");
      
      const { data, error } = await supabase
        .from('profiles')
        .update(userData)
        .eq('id', user.id)
        .select()
        .single();
      
      if (error) {
        console.error("Update user error:", error);
        toast.error("Failed to update profile", {
          id: toastId,
          description: error.message || "Please try again later."
        });
        return Promise.reject(error);
      }
      
      // Refresh user profile
      await fetchProfile(user.id);
      
      toast.success("Profile updated successfully", {
        id: toastId
      });
      
      return Promise.resolve();
    } catch (error: any) {
      console.error("Update user error:", error);
      toast.error("Failed to update profile", {
        description: error.message || "Please try again later."
      });
      return Promise.reject(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Update TRC20 address function
  const updateTrc20Address = async (address: string, withdrawalPassword?: string) => {
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    try {
      const toastId = toast.loading("Updating withdrawal address...");
      
      // Prepare update data
      const updateData: any = { trc20_address: address };
      
      // Add withdrawal password if provided
      if (withdrawalPassword) {
        updateData.withdrawal_password = withdrawalPassword;
      }
      
      await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);
      
      // Refresh profile data
      await fetchProfile(user.id);
      
      toast.success("Withdrawal address updated", {
        id: toastId,
        description: "Your TRC20 address was successfully updated."
      });
      
      return Promise.resolve();
    } catch (error: any) {
      console.error("Error updating TRC20 address:", error);
      
      toast.error("Failed to update address", {
        description: error.message || "Please try again later."
      });
      
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
        console.error("Deposit error:", error);
        return Promise.reject(error);
      }
      
      return Promise.resolve();
    } catch (error: any) {
      console.error("Deposit error:", error);
      toast.error("Failed to submit deposit", {
        description: error.message || "Please try again later."
      });
      return Promise.reject(error);
    }
  };

  // Updated request withdrawal function to work with the new database function and withdrawal source parameter
  const requestWithdrawal = async (amount: number, trc20Address: string, withdrawalSource: 'profit' | 'referral_bonus', withdrawalPassword?: string) => {
    if (!user) {
      toast.error("User not authenticated");
      return Promise.reject(new Error("User not authenticated"));
    }

    if (!trc20Address) {
      toast.error("Please set your TRC20 address first");
      return Promise.reject(new Error("TRC20 address not set"));
    }

    if (amount <= 0) {
      toast.error("Withdrawal amount must be greater than zero");
      return Promise.reject(new Error("Invalid amount"));
    }

    // Check minimum withdrawal amount
    if (amount < 10) {
      toast.error("Minimum withdrawal amount is 10 USDT");
      return Promise.reject(new Error("Below minimum withdrawal amount"));
    }

    // Only check withdrawal password if it's set and required
    if (user.withdrawalPassword && withdrawalPassword !== user.withdrawalPassword) {
      toast.error("Incorrect withdrawal password");
      return Promise.reject(new Error("Invalid withdrawal password"));
    }

    try {
      const toastId = toast.loading("Processing withdrawal request...");
      
      // Use the new database function for withdrawal requests
      const { data, error } = await supabase.rpc(
        'request_withdrawal',
        {
          p_user_id: user.id,
          p_amount: amount,
          p_trc20_address: trc20Address,
          p_withdrawal_source: withdrawalSource
        }
      );
      
      if (error) {
        console.error("Error creating withdrawal request:", error);
        toast.error("Failed to submit withdrawal request", {
          id: toastId,
          description: error.message || "Please try again later."
        });
        return Promise.reject(error);
      }
      
      toast.success("Withdrawal request submitted", {
        id: toastId,
        description: "It will be processed within 24 hours."
      });
      
      return Promise.resolve(data);
    } catch (error: any) {
      console.error("Request withdrawal error:", error);
      toast.error("Failed to submit withdrawal request", {
        description: error.message || "Please try again."
      });
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
