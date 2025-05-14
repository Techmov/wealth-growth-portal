// useauthactions.ts
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import * as authService from "@/services/authService"; 

// Withdrawal fee constant
const WITHDRAWAL_FEE = 3;

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
        setLoginSuccess(true);
        toast.success("Login successful!", { 
          description: "Welcome back to your account." 
        });
        return { success: true, session };
      } catch (profileError) {
        console.error("Error fetching profile:", profileError);
        toast.error("Login successful but error loading profile data");
        return { success: true, session };
      }
    } catch (error: any) {
      console.error("Login error:", error);
      
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

  // Signup function with referral handling
  const signup = async (name: string, email: string, password: string, referralCode?: string) => {
    setIsLoading(true);

    try {
      console.log("Signup input:", { name, email, password, referralCode });

      // Register the user with Supabase auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });
      console.log("Auth result:", { authData, authError });
      if (authError) throw authError;

      const userId = authData?.user?.id;
      console.log("User ID:", userId);
      if (!userId) throw new Error("User ID not available after sign up.");

      let referred_by = null;
      let referred_by_code = null;
      
      // Handle referral code if provided
      if (referralCode) {
        const { data: refUser, error: refError } = await supabase
          .from("profiles")
          .select("id, referral_code")
          .eq("referral_code", referralCode)
          .single();
        console.log("Referral lookup:", { refUser, refError });
        if (!refError && refUser) {
          referred_by = refUser.id;
          referred_by_code = refUser.referral_code;
        }
      }

      console.log({ referred_by, referred_by_code });

      // Create profile with referral data
      const { error: profileError } = await supabase
        .from("profiles")
        .insert({
          id: userId,
          full_name: name,
          email,
          referral_code: generateReferralCode(),
          referred_by,
          referred_by_code
        });

      console.log("Profile insert error:", profileError);
      if (profileError) throw profileError;

      if (authData.session) {
        setSession(authData.session);
        await fetchProfile(authData.session.user.id);
        setLoginSuccess(true);
        setIsLoading(false);
        return authData;
      } else {
        setIsLoading(false);
        return {
          message: "Check your email for the confirmation link.",
        };
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Signup error:", error);
      return { error };
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setLoginSuccess(false);
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error("Logout failed");
      console.error("Logout error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (userData: any) => {
    // TODO: Implement user update logic
    return;
  };

  const updateTrc20Address = async (address: string, withdrawalPassword?: string) => {
    // TODO: Implement TRC20 address update logic
    return;
  };

  const requestWithdrawal = async (amount: number, trc20Address: string, withdrawalSource?: 'profit' | 'referral_bonus', withdrawalPassword?: string) => {
    // TODO: Implement withdrawal request logic
    return;
  };

  const deposit = async (amount: number, txHash: string) => {
    // TODO: Implement deposit logic
    return;
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

// Helper function
const generateReferralCode = () => {
  return Math.random().toString(36).substr(2, 9).toUpperCase();
};